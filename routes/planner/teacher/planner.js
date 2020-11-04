const express = require('express');
const routes = express.Router();


const checkAuth = require('../../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const PlannerMonthlyDots = require('../../../controllers/planner/teacher/monthlyDots');

const SingleDayEvents = require('../../../controllers/planner/teacher/singleDayEvents');

const WeekEvents = require('../../../controllers/planner/teacher/weekView');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.get('/monthlyDots/:teacherId/:date', checkAuth, PlannerMonthlyDots);

routes.get('/SingleDayEvents/:teacherId/:date?', checkAuth, SingleDayEvents);

routes.get('/weekEvents/:teacherId/:date?', checkAuth, WeekEvents);


/***************** ./ Grades Routes *******************/


module.exports = routes;