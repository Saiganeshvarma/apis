var express = require("express")
const { checkoutController } = require("../Controller/paymentController")
const { verifyPayment } = require("../Controller/verifyPaymentController")
const authMiddleware = require("../Middleware/authMiddleware")


var router = express.Router()



router.post("/checkout",authMiddleware,checkoutController)

router.post("/verifypayment",authMiddleware,verifyPayment)

module.exports = router 