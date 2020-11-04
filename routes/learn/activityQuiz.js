const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth')

/** ---------------------------- Controllers Definition --------------------------------*/
const ActivityQuizQuestionList = require('../../controllers/learn/activityQuizQuestionList');

const SaveActivityQuiz = require('../../controllers/learn/saveActivityQuizAnswers');



/** ---------------------------- Controllers Definition --------------------------------*/


routes.get("/list/:userId/:activityQuizId", checkAuth, ActivityQuizQuestionList);

routes.post("/saveResult", checkAuth, SaveActivityQuiz);


module.exports = routes;