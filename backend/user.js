const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: false
    },

    role: {
        type: String,
        default: "user"
    },

    // Password Reset
    resetPasswordToken: {
        type: String,
        default: null
    },

    resetPasswordExpires: {
        type: Date,
        default: null
    }

});

console.log("USER.JS LOADED - OTP FIELDS PRESENT");
module.exports = mongoose.model("User", UserSchema);
