let jwt = require("jsonwebtoken")

let checkJWT = (req, res, next) => {

    let headerVaule = req.get("Authorization")
    let signedToken

    if(headerVaule){
        let parts = headerVaule.split(" ")
        signedToken = parts[1]
    }

    if(!signedToken){
        console.log("Missing signed token")
        res.sendStatus(403)
        return
    }
    //if I get to this line, verify the secrect
    
    try{
        let unsigned = jwt.verify(signedToken, process.env.JWT_SECRET)
        req.userInfo = unsigned // stuffing the req object
    } catch(err) {
        console.log("Failed to verify token", err)
        res.sendStatus(403)
        return
    }

    // if we get here, it's a valid token, so go to the next tast in the chain

    next()
}

module.exports = {
    checkJWT
}