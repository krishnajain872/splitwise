const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const CLIENT_ID = process.env.CLIENT_ID
const CLEINT_SECRET = process.env.CLEINT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

async function sendMail(body, subject, recipient) {
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'krishnajain@gkmit.co',
                clientId: CLIENT_ID,
                clientSecret: CLEINT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        })

        const mailOptions = {
            from: 'krishnajain@gkmit.co',
            to: recipient,
            subject: subject,
            text: body,
        }
        const result = await transport.sendMail(mailOptions)
        return result
    } catch (error) {
        return error
    }
}

module.exports = { sendMail }
