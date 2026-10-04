const mongoose = require("mongoose");

const customDesignSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        jewelleryType: {
            type: String,
            required: true
        },

        purity: {
            type: String,
            required: true
        },

        weight: {
            type: Number,
            required: true
        },

        notes: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            required: true
        },

        status: {
            type: String,
            default: "New"
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "CustomDesign",
    customDesignSchema
);