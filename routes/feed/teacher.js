const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const teacherFeed = require('../../controllers/feed/teacher/teacherFeed');

const filterFeed = require('../../controllers/feed/teacher/filterFeed');


/***************** ./ Contoller Definition Part *******************/



/***************** Group Routes *******************/

routes.get('/:teacherId/:lastFeedId?', checkAuth, teacherFeed);

routes.patch('/filter/:teacherId/:lastFeedId?', checkAuth, filterFeed);




/***************** ./ Group Routes *******************/


module.exports = routes;