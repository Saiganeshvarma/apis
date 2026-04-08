var Cart = require("../Model/cartModel")
var Product = require("../Model/ProductModel")
var razorpay = require("../config/razorpay")
var mongoose = require("mongoose")

var Cart = require("../Model/cartModel")
var Product = require("../Model/ProductModel")
var razorpay = require("../config/razorpay")

var checkout = async (req, res) => {
    try {
        var userId = req.user.userId

        // =========================
        // 1. Get Cart
        // =========================
        var cart = await Cart.findOne({ userId })

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: "cart empty" })
        }

        console.log("CART FOUND:", cart)

        // =========================
        // 2. Get All Products (Optimized)
        // =========================
        var productIds = cart.items.map(item => item.product)

        var products = await Product.find({
            _id: { $in: productIds }
        })

        // =========================
        // 3. Calculate Total
        // =========================
        var totalAmount = 0

        for (let item of cart.items) {
            var product = products.find(
                p => p._id.toString() === item.product.toString()
            )

            if (!product) {
                return res.status(400).json({ message: "product not found" })
            }

            totalAmount += product.price * item.quantity
        }

        console.log("Total Amount:", totalAmount)

        // =========================
        // 4. Safety Check
        // =========================
        if (totalAmount <= 0) {
            return res.status(400).json({ message: "invalid amount" })
        }

        // =========================
        // 5. Create Razorpay Order
        // =========================
        var order = await razorpay.orders.create({
            amount: totalAmount * 100, // convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: userId
            }
        })

        console.log("ORDER CREATED:", order)

        // =========================
        // 6. Send Response
        // =========================
        res.status(200).json({
            message: "checkout created",
            order,
            totalAmount
        })

    } catch (error) {
        console.log("FULL ERROR:", error)

        res.status(500).json({
            error: error.message || "server error"
        })
    }
}

module.exports = {
    checkout
}