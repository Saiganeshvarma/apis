require("dotenv").config()
var express = require("express")
const connectToDatabase = require("./DataBase/db.js")
var useRoutes = require("./Routes/userRoutes")

var app = express()


app.use(express.json())

app.use("/api/userRoutes",useRoutes)




connectToDatabase()

var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
})
