const express = require("express");
const session = require('express-session')
const path = require('path')
const usersRouter = require('./routers/users');
const authRoutes = require('./routers/authRoutes')
const messageRoutes = require('./routers/messageRoutes')


const app = express()
const port = process.env.PORT || 4001;

app.use(express.static('public'))
app.use(express.json())
app.use('/users', usersRouter)
app.use('/', authRoutes)
app.use('/', messageRoutes)
app.use(session({secret: 'Your_Secret_Key', resave: true, saveUninitialized: true}))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.listen(port, () => {
 console.log(`Web server is listening on port ${port}!`);
});
