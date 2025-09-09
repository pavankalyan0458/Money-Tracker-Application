// backend/utils/sendEmail.js
const nodemailer = require('nodemailer'); // Import Nodemailer library

/**
 * Sends an email using Nodemailer.
 * Configures a transporter with SMTP settings from environment variables.
 *
 * @param {object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} options.subject - Subject line of the email.
 * @param {string} options.html - HTML content of the email.
 */
const sendEmail = async (options) => {
    console.log('Attempting to send email...');
    console.log('Email Host:', process.env.EMAIL_HOST);
    console.log('Email Port:', process.env.EMAIL_PORT);
    console.log('Email Secure:', process.env.EMAIL_SECURE);
    console.log('Email Username (Sender):', process.env.EMAIL_USERNAME);
    // DO NOT LOG PASSWORD IN PRODUCTION! For debugging only:
    // console.log('Email Password:', process.env.EMAIL_PASSWORD ? '*****' : 'NOT SET');
    console.log('Email From Name:', process.env.EMAIL_FROM_NAME);
    console.log('Email From Email:', process.env.EMAIL_FROM_EMAIL);
    console.log('Recipient (To):', options.to);
    console.log('Subject:', options.subject);
    // console.log('HTML Content (truncated):', options.html.substring(0, 100) + '...'); // Truncate for logs

    // 1. Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465 (SSL), false for 587 (TLS)
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        // IMPORTANT for local development with self-signed certs or some SMTPs
        // DO NOT use rejectUnauthorized: false in production without understanding risks
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2. Define email options
    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    // 3. Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID: %s', info.messageId);
        // Preview URL is useful for Ethereal.email, but not for real SMTP services
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
        console.error('*** ERROR SENDING EMAIL ***');
        console.error('Nodemailer Error:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code); // Look for codes like 'EAUTH'
        console.error('Error command:', error.command);
        return { success: false, message: 'Failed to send email.', error: error.message };
    }
};

module.exports = sendEmail;
