const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models");
const verification = require("./../helpers/verifyRegistration.helper");
const mailer = require("./../helpers/mail.helper");

const {
  JWT_REFRESH_TOKEN_EXPIRATION: refresh_expire,
  JWT_REFRESH_TOKEN_SECRET: refresh_secret,
  JWT_AUTH_TOKEN_SECRET: auth_secret,
  JWT_AUTH_TOKEN_EXPIRATION: auth_expire,
} = process.env;

function createURL(base_url, token) {
  return `${base_url}/user-account-verification/${token}`;
}
const sendVerificationLink = async (payload) => {
  const { BASE_URL: base_url } = process.env;
  const token = await verification.generateToken(payload.user_id);
  const url = createURL(base_url, token);
  const body = `use this link for your account verification -:${url} `;
  const subject = ` Splitwise -: User Verfication`;
  await mailer.sendMail(body, subject, payload.email);
  const existingUser = await User.findByPk(payload.user_id);
  existingUser.status = "invited";
  await existingUser.save();
  existingUser.dataValues.token = token;
  return existingUser.dataValues;
};

const userRegistration = async (payload) => {
  const { PASSWORD_HASH_SALTS: salt } = process.env;
  payload.password = await bcrypt.hash(payload.password, Number(salt));
  const existingUser = await User.findOne({
    where: { mobile: payload.mobile },
  });
  if (existingUser) {
    const error = new Error("user already registered");
    error.statusCode = 409;
    throw error;
  }
  payload.status = "dummy";
  const user = await User.create(payload);
  return user.dataValues;
};

const userLogin = async (payload) => {
  const { mobile, password } = payload;
  const user = await User.findOne({
    where: {
      mobile: mobile,
    },
  });
  if (!user) {
    const error = new Error("user not found!");
    error.statusCode = 404;
    throw error;
  }
  const match = await bcrypt.compareSync(password, user.dataValues.password);
  if (!match) {
    const error = new Error("UnAuthorized Access");
    error.statusCode = 401;
    throw error;
  }
  const refresh_token = jwt.sign(
    { user_id: user.dataValues.id },
    refresh_secret,
    {
      expiresIn: refresh_expire,
    },
  );

  const accessToken = jwt.sign({ user_id: user.dataValues.id }, auth_secret, {
    expiresIn: auth_expire,
  });

  return {
    id: user.id,
    mobile: user.dataValues.mobile,
    email: user.dataValues.email,
    accessToken,
    refresh_token,
  };
};

const generateAccessToken = async (payload) => {
  const decodedJwt = await jwt.verify(payload, refresh_secret);
  const user = await User.findByPk(decodedJwt.user_id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  let newAccessToken = jwt.sign({ user_id: user.id }, auth_secret, {
    expiresIn: auth_expire,
  });
  return {
    accessToken: newAccessToken,
    refresh_token: payload,
  };
};

const userVerification = async (payload) => {
  const response = verification.validateToken(payload);
  if (!response) {
    const error = new Error("UnAuthorized Access");
    error.statusCode = 401;
    throw error;
  }
  const userData = await User.findByPk(response.data);
  if (!userData) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  userData.status = "verified";
  await userData.save();
  return userData.dataValues;
};

module.exports = {
  userRegistration,
  userLogin,
  generateAccessToken,
  userVerification,
  sendVerificationLink,
};
