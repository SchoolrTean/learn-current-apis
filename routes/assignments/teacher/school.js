const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../middleware/auth');

/**Cron or Scheduled Jobs */
require('../../../controllers/assignment/teacher/scheduled/sendScheduledAssignmentsController');

require('../../../controllers/assignment/teacher/scheduled/sendScheduledAssignmentNotificationBeforeOneHourController');


/***************** Contoller Definition Part *******************/

const schoolController = require('../../../controllers/assignment/teacher/schoolController');

const filterController = require('../../../controllers/assignment/teacher/filterController');

const removeAssignments = require('../../../controllers/assignment/teacher/removeAssignmentsController');

const seeList = require('../../../controllers/classes/teacher/student/seeList');

const completionStatusReport = require('../../../controllers/classes/teacher/student/completionReport');

const studentSubmittedAssignmentList = require('../../../controllers/classes/teacher/student/studentSubmittedList');

const giveAssignmentRating = require('../../../controllers/classes/teacher/student/giveAssignmentRating');

const responseReport = require('../../../controllers/assignment/teacher/reports/responseReportController');


/***************** ./ Contoller Definition Part *******************/



/***************** School Routes *******************/

/**Star and Unstar of assingment is done using this api its always inversly proportional */
routes.patch('/star/:teacherId/:groupId/:assignmentId', checkAuth, schoolController.starAssignment);


/**This api contains 2 functionalities
 * 1.Delete  -  only for scheudled assignments
 * 2.Delete For All - only for today assignments
 */
routes.delete('/:teacherId/:groupId/:assignmentId/:deleteType', checkAuth, schoolController.deleteAssignment);


/** Cancel assignments are only done for previous assignments */
routes.patch('/cancel/:teacherId/:groupId/:assignmentId', checkAuth, schoolController.cancelAssignment);


/**Assignment List contians passed date assingments or today if date was not passed with next and previous dates
 * next date is used to know that there are scheduled assignments and that date is passed on click of next arrow
 * previous date is used to know that there are previous assignments and that date is passed on click of previous arrow
 */
routes.get('/:teacherId/:date?', checkAuth, schoolController.assignmentList);


/**This api is used in calendar and chat to display single assignment to show in popup */
routes.get('/assignment/:teacherId/:assignmentId', checkAuth, schoolController.singleAssignment);


/**Api contains static filter id for assignment type and group and assignment type combination */
routes.get('/filter/:teacherId/:filterId/:groupId?', checkAuth, filterController.filterSchoolData);


/**APi is used to remove cancelled assignments only from the teacher account*/
routes.delete('/removeCancelled/:teacherId', checkAuth, removeAssignments.Cancelled);


/**APi is used to remove Delete For All assignments only from the teacher account*/
routes.delete('/removeDeleted/:teacherId', checkAuth, removeAssignments.Deleted);

/**APi is used to show Announcement Response*/
routes.get('/seeList/:teacherId/:classId/:assignmentId', checkAuth, seeList);

/**APi is used to show Home Work / Project Work Response*/
routes.get('/completionStatus/:teacherId/:classId/:assignmentId', checkAuth, completionStatusReport);


/**APi is used to show Home Work / Project Work Response*/
routes.get('/studentSubmittedAssignmentData/:teacherId/:classId/:assignmentId/:studentId', checkAuth, studentSubmittedAssignmentList);


/**APi is used to show Home Work / Project Work Response*/
routes.patch('/assignmentAssessment/:teacherId/:classId/:assignmentId/:submissionId', checkAuth, giveAssignmentRating);


/**APi is used to show Announcement Response */
// routes.get('/announcementResponseReport/:teacherId/:groupId/:assignmentId', checkAuth, responseReport.announcementResponse);

/**APi is used to show Homework Response */
routes.get('/homeWorkResponseReport/:teacherId/:groupId/:assignmentId/:homeWorkId', checkAuth, responseReport.homeWorkResponse);

/***************** ./ School Routes *******************/




module.exports = routes;