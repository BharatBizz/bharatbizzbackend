require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const User = require('./models/userModel'); // Assuming you have a User model
const indexRouter = require('./routes/indexRouter');
const adminRouter = require('./routes/adminRouter');
const PORT = process.env.PORT || 3000;
const app = express();
require('./models/config');

// CORS configuration
const corsOptions = {
  origin: ['https://bharatbizz.vercel.app/'],
    credentials: true
};
// Enable CORS
app.use(cors(corsOptions));

exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET,
});

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: true,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SECRET,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
        sameSite: 'none'
    }
}));

app.use(logger('tiny'));
app.use(fileupload());



// Routes
app.get('/', (req, res) => {
    res.send('Hello');
});
app.use((req, res, next) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Visitor IP Address:', ipAddress);

    next();
});


// app.use('/user', indexRouter);
app.use('/admin', adminRouter)
app.use('/user',indexRouter)
app.all("*", (req, res, next) => {
    res.status(404).send('404 - Not Found');
});

// Server listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;