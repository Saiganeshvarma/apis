var mongoose = require("mongoose")


var orderSchema = new mongoose.Schema({
    userId : {
        type : String
    },
    items : [
        {
            product : {
                type : String
            },
            quantity : {
                type : String
                
            }
        }
    ],
    totalAmount : {
        type : Number
    },
    status : {
        type  : String,
        default : "pending"
    },
    paymentId : {
        type : String
    }

})

var order = mongoose.model("order",orderSchema)

module.exports = order