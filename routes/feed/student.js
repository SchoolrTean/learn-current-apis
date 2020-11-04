const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const studentFeed = require('../../controllers/feed/student/studentFeed');

const studentFilteredFeed = require('../../controllers/feed/student/filterFeed');


/***************** ./ Contoller Definition Part *******************/



/***************** Group Routes *******************/

routes.get('/:studentId/:lastFeedId?', checkAuth, studentFeed);

routes.patch('/filter/:studentId/:lastFeedId?', checkAuth, studentFilteredFeed);


/***************** ./ Group Routes *******************/


module.exports = routes;