const express = require('express');
const routes = express.Router();


const checkAuth = require('../../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const PlannerMonthlyDots = require('../../../controllers/planner/student/monthlyDots');

const SingleDayEvents = require('../../../controllers/planner/student/singleDayEvents');

const WeekView = require('../../../controllers/planner/student/weekView');

// const SetPersonalEventReminder = require('../../../controllers/planner/student/personalEvent/setReminder');

// const RemovePersonalEventReminder = require('../../../controllers/planner/student/personalEvent/removeReminder');

/***************** ./ Contoller Definition Part *******************9835569999 9701255577/



/***************** Grades Routes *******************/

routes.get('/monthlyDots/:studentId/:date', checkAuth, PlannerMonthlyDots);

routes.get('/SingleDayEvents/:studentId/:date?', checkAuth, SingleDayEvents);

routes.get('/weekView/:studentId/:date?', checkAuth, WeekView);

/***************** ./ Grades Routes *******************/


module.exports = routes;