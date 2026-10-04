const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },

        customerName: {
            type: String,
            required: true
        },

        mobile: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        pincode: {
            type: String,
            required: true
        },

        productName: {
            type: String,
            required: true
        },

        productPrice: {
            type: Number,
            required: true
        },
        purity: {
    type: String,
    default: "22K"
},

weight: {
    type: Number,
    default: 0
},
        paymentMethod: {
            type: String,
            default: "cod"
        },

        status: {
            type: String,
            default: "Placed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);
