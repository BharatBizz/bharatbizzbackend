
const { catchAsyncErrors } = require('../middlewares/catchAsyncErrors')
const Admin=require('../models/adminModel')
const { sendToken } = require('../utils/sendToken');
const bcrypt = require('bcryptjs')
const ErrorHandler = require('../utils/ErrorHandler')
const imagekit=require('../utils/imagekit').initimagekit()
const { v4: uuidv4 } = require('uuid');
const {sendmail} =require('../utils/nodemailer')
const User=require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.registerInvestor = catchAsyncErrors(async (req, res, next) => {
    const { userId, email, password } = req.body;

    if (!userId || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ userId }, { email }] });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
        userId,
        email,
        password
    });

    // Send response
    res.status(201).json({ success: true, message: "Investor registered successfully", user });
});

exports.loginInvestor = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Investor not found' });
        }

        console.log(user.password);

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If everything is correct, send token
        sendToken(user, 200, res);
    } catch (error) {
        console.error('Error in loginInvestor controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

exports.currentInvestor = catchAsyncErrors(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isAuth = true;
        user.lastLogin = new Date();
        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error fetching current admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
