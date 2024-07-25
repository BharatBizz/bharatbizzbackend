
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


exports.registerAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
       
        const { email } = req.body;
      
        console.log(req.body)
        const { password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }
        const newAdmin = new Admin({
            email,
            password,
        });

        await newAdmin.save();  
        sendToken(newAdmin, 201, res);
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        console.log(admin.password);

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // If everything is correct, send token
        sendToken(admin, 200, res);
    } catch (error) {
        console.error('Error in loginAdmin controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


exports.currentAdmin = catchAsyncErrors(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const admin = await Admin.findById(userId).exec();

        if (!admin) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        admin.isAuth = true;
        admin.lastLogin = new Date();
        await admin.save();
        res.json({ success: true, admin });
    } catch (error) {
        console.error('Error fetching current admin:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

