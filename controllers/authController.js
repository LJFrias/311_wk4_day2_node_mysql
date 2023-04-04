let db = require('../sql/connection')
let argon2 = require('argon2') // used to hash the password
let jwt = require("jsonwebtoken")
const session = require('express-session')

let register = async (req, res) => {

    let username = req.body.username
    let password = req.body.password
    let fullName = req.body.fullName

    let passwordHash

    try {
        //hash the password
        passwordHash = await argon2.hash(password)
    } catch(err) {
        console.log(err)
        //if err code = 'ER_UP_ENTRY' {
        //console.log('username already exists. please choose another.', err)
        //}
        res.sendStatus(500)
        return
    }

    let params = [username, passwordHash, fullName]
    let sql = "INSERT INTO regUser (username, password_hash, full_name) VALUES (?, ?, ?)"

    try {
        let results = await db.queryPromise(sql, params)
        res.sendStatus(200)
    } catch(err) {
        console.log(err)
        if(err.code == "ER_DUP_ENTRY"){
        res.status(400).send("That username is taken. Please try again")
        } else {
           res.sendStatus(500) 
        }
        return
    }
}

//we have a registered user, and now they want to login
//if good, yes here's your token, or no I got nothing for you
let login = (req, res) => {

    let username = req.body.username
    let password = req.body.password

    let sql = "SELECT id, full_name, password_hash FROM regUser WHERE username = ?"
    let params = [username]

    db.query(sql, params, async (err, rows) => {
        if(err){
            console.log("Could not get user", err)
            res.sendStatus(500)
        } else {
            //we found someone
            //making sure we have one rw
            if(rows.length > 1){
                console.log("Returned too many rows for username", username)
                res.sendStatus(500)
            } else if(rows.length == 0){
                console.log("Username does not exists")
                res.status(400).send("That username does not exist. Please sign up for an account")
            } else {
                //we have 1 row
                //it comes back as an array ofobjects, so you get the object by its index
                //[{"id": 234, "username": "ljfrias", "password_hash": ".....", "full_name": "Luke Frias"}]

                let pwHash = rows[0].password_hash
                let fnName = rows[0].full_name
                let userID = rows[0].id

                let goodPass = false

                try{
                    goodPass = await argon2.verify(pwHash, password) // returns a boolean, so at this point goodPass = true if it matches
                } catch(err){
                    console.log("Failed to verify password")
                    res.status(400).send("Invalid Password")
                }

                if(goodPass){
                    let token = {
                        "fullName": fnName,
                        "userId": userID // usually want the bare minimum of key/value
                    }

                    // res.json(token) // unsigned token JUST A TEST
                    //now we need to sign the token

                    let signedToken = jwt.sign(token, process.env.JWT_SECRET)

                    // res.json(signedToken)
                    // res.setHeader("Authorization", "Bearer", signedToken)
                    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6IkNhcmwgR3V5IiwidXNlcklkIjozLCJpYXQiOjE2ODA2MTcyMDZ9.Q-A4UmyKu9vncyZAk8HS22VKjUE45j0GNJHLCUYsK2E
                    res.sendStatus(200)

                    //"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ikx1a2UgRnJpYXMiLCJ1c2VySWQiOjEsImlhdCI6MTY4MDE5MTEzM30.zt60sJAH84FKInsi2TVdo7IbN336fUcCchLy9EyirMc"

                } else {
                    res.sendStatus(400)
                }
            }
        }
    })


}

const logout = (req, res) => {
    console.log("Logging Out")
        if (req.session) {
          req.session.destroy(err => {
            if (err) {
              res.status(400).send('Unable to log out')
            } else {
              res.send('Logout successful')
            }
          });
        } else {
          res.end()
        }
      }


module.exports = {
    register,
    login,
    logout
}