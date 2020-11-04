const checkAuth = require('../../../middleware/auth');

const express = require('express');
const routes = express.Router();


/***************** Contoller Definition Part *******************/

const Assignments = require('../../../controllers/assignment/student/assignmentsController');

const Filter = require('../../../controllers/assignment/student/filterController');

const RemoveAssignments = require('../../../controllers/assignment/student/removeAssignmentsController');



/***************** School Routes *******************/

routes.get("/assignmentList/:studentId/:date?", checkAuth, Assignments.list);

routes.get("/assignment/:studentId/:assignmentId", checkAuth, Assignments.AssignmentRecord);

routes.patch("/reminder/:studentId/:assignmentId/:reminderType", checkAuth, Assignments.reminder);

routes.patch("/star/:studentId/:groupId/:assignmentId", checkAuth, Assignments.star);

routes.patch("/updateStatus/:studentId/:groupId/:assignmentId", checkAuth, Assignments.updateAssignmentStatus);

routes.get("/video/:studentId/:topicId/:videoId?", checkAuth, Assignments.playVideos);

routes.get("/filter/:studentId/:filterId/:teacherId?", checkAuth, Filter.filterSchoolData);

routes.delete("/removeCancelled/:studentId", checkAuth, RemoveAssignments.Cancelled);

routes.delete("/removeDeleted/:studentId", checkAuth, RemoveAssignments.Deleted);

/***************** ./School Routes *******************/


module.exports = routes;