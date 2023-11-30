const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const {
    CLEINT_SECRET: client_secret,
    CLIENT_ID: client_id,
    REFRESH_TOKEN: refresh_token,
    REDIRECT_URI: redirect_url,
} = process.env

const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_url
)
oAuth2Client.setCredentials({ refresh_token: refresh_token })

async function sendMail(body, subject, recipient) {
    try {
        const accessToken = await oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'krishnajain@gkmit.co',
                clientId: client_id,
                clientSecret: client_secret,
                refreshToken: refresh_token,
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
