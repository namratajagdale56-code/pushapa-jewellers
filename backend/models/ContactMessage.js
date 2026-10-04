const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        subject: {
            type: String,
            default: ""
        },

        message: {
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
    "ContactMessage",
    contactMessageSchema
);