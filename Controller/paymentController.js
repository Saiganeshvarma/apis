var Cart = require("../Model/cartModel")

var Product = require("../Model/ProductModel")

var razorpay = require("../config/razorpay")


var paymentController = async(req,res)=>{
    try{
        var userId = req.user.id 
        var cart = await Cart.findOne({userId})

        if(!cart || cart.length == 0){
            res.status(200).json({
                message : "cart is emty"
            })
        }

        var totalAmount = 0 

        for(var item of cart.items){
            var product = await Product.findById(item.product)
            totalAmount += product.price + item.quantity
        }

        var order = await razorpay.orders.create({
            amount : totalAmount*100,
            currency : "INR"

        })
        res.status(200).json({
            message : "checkout created",order,totalAmount
        })




    }catch(error){
        console.log("error",error);
    }
}


module.exports = {
    paymentController
}


