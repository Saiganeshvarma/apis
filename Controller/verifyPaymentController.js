var crypto = require("crypto")
var Product = require("../Model/ProductModel")
var Cart = require("../Model/cartModel")
var Order = require("../Model/orderModel")


var verifyPayment = async(req,res)=>{
    try{
        var userId  = req.user.id 
        var {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature

        } = req.body 

        var generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex")


        if(generated_signature !== razorpay_signature){
            return res.status(400).json({
                message: "payment verification failed"
            })
        }

        var cart = await Cart.findOne({userId})

        var totalAmount = 0

        for(var item in cart.items){
            var product = await Product.findById(item.product)
            totalAmount += product.price * item.quantity 
        }

        var newOrder = await Order.create({
            userId,
            items : cart.items,
            totalAmount,
            status : "paid"
        })

        cart.items = []
        await cart.save()

        res.status(200).json({
            message: "payment successful & order placed",
            order: newOrder
        })






    }catch(error){
        console.log("error",error);
    }
}


module.exports = {
    verifyPayment
}