
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
const History = require('../models/history');
const WithdrawalRequest = require('../models/withDrawRequest');
// const WithdrawalRequest = require('../models/withDrawRequest');

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
        const { userId, password } = req.body;

        const user = await User.findOne({ userId });

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
        console.log(authHeader)
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

exports.depositMoney = catchAsyncErrors(async (req, res, next) => {
    // Extract amount from request body
    const { amount } = req.body;
    const userId = req.params.userId;

    // Convert the amount to a number
    const parsedAmount = parseFloat(amount);

    // Validate the amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount value' });
    }
    if (parsedAmount < 2500) {
        return res.status(400).json({ success: false, message: 'Amount must be at least Rs 2500' });
    }

    try {
        // Find the user by userId
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update the user's wallet
        user.wallet += parsedAmount;
        await user.save();

        // Log the deposit in history
        const history = new History({
            userId,
            amount: parsedAmount,
            type: 'deposit'
        });
        await history.save();

        // Respond with success
        res.status(200).json({ success: true, wallet: user.wallet, history });
    } catch (error) {
        // Pass errors to the error handler middleware
        next(error);
    }
});

exports.getHistory = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    try {
        const history = await History.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await History.countDocuments({ userId });

        res.status(200).json({
            success: true,
            history,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

exports.requestWithdraw = catchAsyncErrors(async (req, res, next) => {
    try {
        const { userId, amount } = req.body;

        // Validate input
        if (!userId || !amount) {
            return res.status(400).json({ message: 'User ID and amount are required' });
        }

        // Check if user exists
        const user = await User.findOne({userId});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has sufficient funds
        if (user.wallet < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Create withdrawal request
        const newRequest = new WithdrawalRequest({
            userId,
            amount,
            status: 'pending'
        });

        await newRequest.save();

        // Update user's wallet
        user.wallet -= amount;
        await user.save();

        res.status(201).json({ message: 'Withdrawal request submitted successfully', request: newRequest });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
});