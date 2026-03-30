require("dotenv").config()

var express = require("express")
const connectToDatabase = require("./database/db.js")
var useRoutes = require("./Routes/userRoutes")
var productRoutes = require("./Routes/ProductRoutes.js")

var app = express()


app.use(express.json())

app.use("/api/userRoutes",useRoutes)

app.use("/api/productRoutes",productRoutes)




connectToDatabase()


var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
})
