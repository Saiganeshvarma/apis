require("dotenv").config()
var cors = require("cors")

var express = require("express")
const connectToDatabase = require("./database/db.js")
var useRoutes = require("./Routes/userRoutes")
var productRoutes = require("./Routes/ProductRoutes.js")
var profileRoutes = require("./Routes/profileRoutes.js")

var cartRoutes = require("./Routes/cartRoutes.js")


var app = express()


app.use(express.json())
app.use(cors())

app.use("/api/userRoutes",useRoutes)

app.use("/api/productRoutes",productRoutes)

app.use("/api/profileRoutes",profileRoutes)

app.use("/api/cartRoutes",cartRoutes)

connectToDatabase()


var port = process.env.PORT

app.listen(port,()=>{
    console.log("The server is running");
})
