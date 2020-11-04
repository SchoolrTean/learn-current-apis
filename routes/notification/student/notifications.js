const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const allNotifications = require('../../../controllers/notifications/student/allNotifications');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.get('/allNotifications/:studentId/:lastNotificationId?', checkAuth, allNotifications);


/***************** ./ Grades Routes *******************/


module.exports = routes;