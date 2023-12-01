const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  E_MAIL: sender,
  E_MAIL_PASSWORD: password,
  E_MAIL_HOST: host,
  E_MAIL_PORT: port,
} = process.env;

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
    });
    // verify connection configuration
    transport.verify(function (error) {
      if (error) {
        return new Error(`MAIL TRANSPORTER ERROR => ${error}`);
      }
    });
    const mailOptions = {
      from: sender,
      to: recipient,
      subject: subject,
      headers: { "Content-Type": "text/html" },
      text: body,
    };
    const result = await transport.sendMail(mailOptions);
    return result.messageId;
  } catch (error) {
    return new Error(`MAIL TRANSPORTER ERROR => ${error}`);
  }
}

module.exports = { sendMail };
