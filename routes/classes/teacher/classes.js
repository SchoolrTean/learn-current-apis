const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');




/***************** Contoller Definition Part *******************/
const GetSubjectWiseClassList = require('../../../controllers/classes/teacher/getSubjectWiseClassList');

const GetSubjectList = require('../../../controllers/classes/teacher/getSubjectList');

const AssignmentList = require('../../../controllers/classes/teacher/classSubjectWiseAssignmentList');

const ClassList = require('../../../controllers/classes/teacher/classSubjectWiseClassList');

const AllAssignmentList = require('../../../controllers/classes/teacher/allAssignmentList');

const AllClassList = require('../../../controllers/classes/teacher/allClassList');

const MyActivityList = require('../../../controllers/classes/teacher/myActivity');


/***************** ./ Contoller Definition Part *******************/



/***************** Group Routes *******************/
routes.get('/subjectWise/:teacherId', checkAuth, GetSubjectWiseClassList)

routes.get('/subjectList/:teacherId', checkAuth, GetSubjectList)

routes.patch('/assignmentList/:teacherId/:classId/:lastAssignmentId?', checkAuth, AssignmentList)

routes.patch('/classList/:teacherId/:classId/:lastClassId?', checkAuth, ClassList)

routes.get('/allAssignmentList/:teacherId/:lastAssignmentId?', checkAuth, AllAssignmentList)

routes.get('/allClassList/:teacherId/:lastClassId?', checkAuth, AllClassList)

routes.get('/myActivity/:teacherId/:activityId', checkAuth, MyActivityList)

/***************** ./ Group Routes *******************/





module.exports = routes;