const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    referredByUserID: {
        type: String,
    },
    firstName: {
        type: String,
        minlength: [4, "Firstname should be at least 4 characters long"]
    },
    lastName: {
        type: String,
        minlength: [4, "Lastname should be at least 4 characters long"]
    },
    incentive: {
        type: Number,
    },
    phone: {
        type: String,
    },
    userType: {
        type: String,
        default: "Investor"
    },
    otp: {
        type: Number,
        default: -1
    },
    wallet: {
        type: Number,
        default: 0
    },
    isAuth: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        minlength: [4, "Password should be at least 4 characters long"],
    },
    location: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: null
    },
    blocked: {
        type: Boolean,
        default: false
    },
    resetPassword: {
        type: String,
        default: "0"
    }
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.getjwttoken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

const User = mongoose.model("User", userSchema);

module.exports = User;
