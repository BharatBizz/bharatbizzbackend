
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
const History=require('../models/history')
const WithdrawalRequest=require('../models/withDrawRequest')
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

        const user = await Admin.findById(userId).exec();

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

exports.getAllTransactions = catchAsyncErrors(async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const transactions = await History.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await History.countDocuments();

        res.status(200).json({
            success: true,
            history: transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});


exports.getAllWithdrawalRequests = catchAsyncErrors(async (req, res) => {
    try {
        // Fetch all withdrawal requests
        const requests = await WithdrawalRequest.find();

        // Manually populate user details
        const populatedRequests = await Promise.all(requests.map(async (request) => {
            const user = await User.findOne({ userId: request.userId }, 'username email');
            return {
                ...request.toObject(),
                user: user ? { username: user.username, email: user.email } : null
            };
        }));

        res.status(200).json({ success: true, data: populatedRequests });
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


exports.updateWithdrawalStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const validStatuses = ['approved', 'denied', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const request = await WithdrawalRequest.findByIdAndUpdate(id, { status }, { new: true });

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        res.status(200).json({ success: true, request });
    } catch (error) {
        next(error);
    }
});


/**
 * Recursive function to fetch all users in the referral tree
 * @param {String} userId - The userId to start the search
 * @returns {Array} - List of users in the referral tree
 */
async function getAllReferredUsers(userId) {
    const referredUsers = [];
    const usersToCheck = [userId]; // Initialize the queue with the starting userId
    const checkedUsers = new Set(); // To avoid reprocessing the same user

    while (usersToCheck.length > 0) {
        const currentUserId = usersToCheck.shift(); // Get the next userId from the queue
        const users = await User.find({ referredByUserID: currentUserId }); // Find users referred by the current userId

        for (const user of users) {
            if (!checkedUsers.has(user.userId)) {
                referredUsers.push(user); // Add to the list of referred users
                checkedUsers.add(user.userId); // Mark as checked
                usersToCheck.push(user.userId); // Add to the queue for further exploration
            }
        }
    }

    return referredUsers;
}

/**
 * Controller function to get all referred users
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.getReferredUsers = async (req, res) => {
    const { userId } = req.params; // Extract userId from request parameters

    try {
        const referredUsers = await getAllReferredUsers(userId); // Get all referred users
        res.status(200).json({ success: true, team: referredUsers }); // Send response
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ success: false, message: 'Server Error' }); // Send error response
    }
};


exports.adminLogout = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("token")
    res.json({ message: "Successfully Signout" })
})
