const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth');



/** ---------------------------- Controllers Definition --------------------------------*/

const SaveTestAnswers = require('../../controllers/learn/saveTestAnswerResult');



/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/saveTestResult", checkAuth, SaveTestAnswers);




module.exports = routes;