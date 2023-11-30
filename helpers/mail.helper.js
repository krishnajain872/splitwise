const nodemailer = require('nodemailer')
require('dotenv').config()

const { SPLITWISE_MAIL: sender, SPLITWISE_MAIL_PASSWORD: password } =
    process.env

async function sendMail(body, subject, recipient) {
    try {
        // Create a nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: sender,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        })

        const mailOptions = {
            from: sender,
            to: recipient,
            subject: subject,
            headers: { 'Content-Type': 'text/html' },
            text: body,
        }
        const result = await transporter.sendMail(mailOptions)
        return result
    } catch (error) {
        return error
    }
}

module.exports = { sendMail }
