const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../middleware/auth')

/** ---------------------------- Controllers Definition --------------------------------*/
const AptitudeTopicList = require('../../../controllers/learn/non-academic/aptitude/topicList');

const AptitudeTest = require('../../../controllers/learn/non-academic/aptitude/test');

const AptitudeTestResult = require('../../../controllers/learn/non-academic/aptitude/saveTestResult');




/** ---------------------------- Controllers Definition --------------------------------*/

routes.get("/topicList/:userId/:courseId", checkAuth, AptitudeTopicList);

routes.get("/test/:userId/:courseTopicId", checkAuth, AptitudeTest);

routes.post("/saveTestResult", checkAuth, AptitudeTestResult);


module.exports = routes;