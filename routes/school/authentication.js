const express = require('express');
const routes = express.Router();

/** ---------------------------- Controllers Definition --------------------------------*/


const SignUp = require('../../controllers/school/authentication/signUp');

const password = require('../../controllers/school/authentication/password');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/SignUp", SignUp);

routes.post("/forgotPassword", password.forgot);

routes.post("/resetPassword", password.reset);

module.exports = routes;