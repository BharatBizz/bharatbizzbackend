const nodemailer = require('nodemailer');
const ErrorHandler = require('./ErrorHandler');

exports.sendmail = async (req, url1, res, url, next) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.MAIL_EMAIL,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const mailoptions = {
            from: 'Bharat Bizz <noreply@bharatbizz.com>',
            to: req.body.email,
            subject: 'Password Reset Request',
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="background-color: #f8f8f8; padding: 20px;">
                  <h1 style="color: #333;">Password Reset Request</h1>
                  <p>Dear User,</p>
                  <p>We have received a request to reset your password. Please click the link below to reset your password:</p>
                  <p style="text-align: center;">
                    <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                  </p>
                  <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                  <p><a href="${url}">${url}</a></p>
                  <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
                  <p>Thank you,<br/>The Bharat Bizz Team</p>
                </div>
              </div>
            `
          };
      
        const info = await transport.sendMail(mailoptions);

        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return res.status(200).json({
            message: 'Email sent successfully',
            url
        });
    } catch (err) {
        return next(new ErrorHandler(err.message || 'Failed to send email', 500));
    }
};
