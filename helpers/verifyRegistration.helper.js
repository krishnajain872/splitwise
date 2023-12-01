const crypto = require("crypto");
const { VERIFY_TOKEN_SECRET: secretKey, VERIFY_TOKEN_EXPIRY: TOKEN_VALIDITY } =
  process.env; // Can be 10 characters
const IV_LENGTH = 16; // For AES, this is always 16

function hashKey(key) {
  return crypto
    .createHash("sha256")
    .update(String(key))
    .digest("base64")
    .slice(0, 32);
}

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey(secretKey)),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}
function decrypt(text) {
  let textParts = text.split(":");
  let iv = Buffer.from(textParts.shift(), "hex");
  let encryptedText = Buffer.from(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(hashKey(secretKey)),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  let decryptedStr = decrypted.toString();
  return decryptedStr;
}

function generateToken(info) {
  const currentTime = Math.floor(Date.now() / 60000); // Convert to minutes
  const data = `${info},${currentTime}`;
  const token = `${encrypt(data)},${currentTime}`;
  return token;
}

function validateToken(token) {
  const tokenParts = token.split(",");
  // const storedTime = parseInt(tokenParts[1])
  const decryptedData = decrypt(tokenParts[0]);
  const decryptedParts = decryptedData.split(",");
  const info = decryptedParts[0];
  const decryptedTime = parseInt(decryptedParts[1]);
  const timeDifference = Math.abs(
    decryptedTime - Math.floor(Date.now() / 60000),
  ); // Convert to minutes

  if (timeDifference <= TOKEN_VALIDITY) {
    return { data: info, valid: true };
  } else {
    return false;
  }
}

module.exports = {
  validateToken,
  generateToken,
};
