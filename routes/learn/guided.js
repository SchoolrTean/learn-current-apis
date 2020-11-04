const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth');



/** ---------------------------- Controllers Definition --------------------------------*/

const GuidedTopicsPage = require('../../controllers/learn/guided/topicsPage');

const GuidedTopicPathPage = require('../../controllers/learn/guided/topicPathPage');

const GudiedTopicExercises = require('../../controllers/learn/guided/topicExercises');

const GuidedTopicTests = require('../../controllers/learn/guided/topicTests');

const NoTopicExercies = require('../../controllers/learn/guided/noTopicExercises');

const GuidedTopicRating = require('../../controllers/learn/guided/topicRating');


/** ---------------------------- Controllers Definition --------------------------------*/

routes.get("/topicPath/:userId/:chapterId", checkAuth, GuidedTopicsPage);

routes.get("/topicPage/:userId/:chapterId/:topicId", checkAuth, GuidedTopicPathPage);

routes.get("/exercises/:userId/:chapterId/:topicId/:exerciseId?", checkAuth, GudiedTopicExercises);

routes.get("/tests/:userId/:chapterId/:topicId/:testId?", checkAuth, GuidedTopicTests);

routes.get("/noTopicExercises/:userId/:chapterId/:exerciseId?", checkAuth, NoTopicExercies);

routes.post("/topicRating", checkAuth, GuidedTopicRating);


module.exports = routes;