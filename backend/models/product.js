const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },


    category: {
        type: String,
        required: true
    },


    price: {
        type: Number,
        required: true
    },


    image: {
        type: String,
        required: true
    },


    description: {
        type: String,
        default: "Premium quality jewellery from Pushapa Jewellers"
    },


    purity: {
        type: String,
        default: "22K"
    },


    weight: {
        type: Number,
        default: 0
    },


    makingCharges: {
        type: Number,
        default: 0
    },


    stoneCharges: {
        type: Number,
        default: 0
    }


});


const Product = mongoose.model("Product", productSchema, "product");


module.exports = Product;
