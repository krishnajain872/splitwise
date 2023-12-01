const nodemailer = require('nodemailer')
require('dotenv').config()

const {
    EMAIL_PORT: port,
    EMAIL_PASSWORD: password,
    EMAIL_HOST: host,
    EMAIL_ID: sender,
} = process.env

async function sendMail(body, subject, recipient) {
    try {
        // Create a nodemailer transporter
        var transport = nodemailer.createTransport({
            host: host,
            port: port,
            auth: {
                user: sender,
                pass: password,
            },
            tls: {
                rejectUnauthorized: false,
            },
        })
        // verify connection configuration
        transport.verify(function (error) {
            if (error) {
                return new Error(`MAIL TRANSPORTER ERROR => ${error}`)
            }
        })
        const mailOptions = {
            from: sender,
            to: recipient,
            subject: subject,
            headers: { 'Content-Type': 'text/html' },
            text: body,
        }
        const result = await transport.sendMail(mailOptions)
        return result.messageId
    } catch (error) {
        return new Error(`MAIL TRANSPORTER ERROR => ${error}`)
    }
}

module.exports = { sendMail }
