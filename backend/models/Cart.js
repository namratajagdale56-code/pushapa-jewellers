const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    products:[
        {
            productName:{
                type:String
            },

            image:{
                type:String
            },

            price:{
                type:String
            }
        }
    ]

});


module.exports = mongoose.model("Cart", cartSchema);