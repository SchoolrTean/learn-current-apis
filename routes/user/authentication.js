const express = require('express');
const routes = express.Router();



/** ---------------------------- Controllers Definition --------------------------------*/
const SendOTP = require('../../controllers/authentication/sendOTP');

const VerifyOTP = require('../../controllers/authentication/verifyOtp');

const SignUp = require('../../controllers/authentication/signUp');

const Login = require('../../controllers/authentication/login');

const ForgotPassword = require('../../controllers/authentication/forgotPassword');

const ResetPassword = require('../../controllers/authentication/resetPassword');

const SocialSignUp = require('../../controllers/authentication/social/socialSignUp');

const SocialLogin = require('../../controllers/authentication/social/socialLogin');

const RefreshToken = require('../../controllers/authentication/tokens/refreshToken');

/** ---------------------------- Controllers Definition --------------------------------*/


routes.post("/sendOtp", SendOTP);

routes.patch("/verifyOtp", VerifyOTP);

routes.post("/signUp", SignUp);

routes.post("/login", Login);

routes.post("/forgotPassword", ForgotPassword);

routes.post("/resetPassword", ResetPassword);

routes.post("/socialSignUp", SocialSignUp);

routes.post("/socialLogin", SocialLogin);

routes.post('/generateAccessToken', RefreshToken.grantNewAccessToken)


module.exports = routes;