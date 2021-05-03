const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const User = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    fullName: String,
});

User.plugin(passportLocalMongoose, {
    limitAttempts: true,
    maxAttempts: 10,
});

module.exports = mongoose.model("User", User);