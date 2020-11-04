const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const searchStudentsInContactList = require('../../../controllers/group/teacher/student/getContactList');

const addStudent = require('../../../controllers/group/teacher/student/addStudentToGroup');

// const sendJoinNotification = require('../../../controllers/group/teacher/student/sendJoinNotification')

const addExistingGroupStudents = require('../../../controllers/group/teacher/student/addExistingGroupStudents');

// const connectedStudentList = require('../../../controllers/group/teacher/connectedStudentsList');

const StudentInfo = require('../../../controllers/group/teacher/student/studentInfo');

const DeleteStudent = require('../../../controllers/group/teacher/student/delete');

const ReAdmitStudent = require('../../../controllers/group/teacher/student/reAdmit');

const RemoveStudent = require('../../../controllers/group/teacher/student/remove');

// const StudentInfo = require('../../../controllers/group/teacher/student/studentInfo');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.post('/addStudent', checkAuth, addStudent);

routes.post('/contactList', checkAuth, searchStudentsInContactList);

// routes.patch('/sendJoinNotification/:teacherId/:groupId/:studentId', checkAuth, sendJoinNotification);

routes.post('/addExistingGroupsStudents', checkAuth, addExistingGroupStudents);

routes.get('/studentInfo/:teacherId/:groupId/:studentId', checkAuth, StudentInfo);

routes.delete('/student/:teacherId/:groupId/:studentId', checkAuth, DeleteStudent);

routes.patch('/reAdmitStudent/:teacherId/:groupId/:studentId', checkAuth, ReAdmitStudent);

routes.delete('/removeStudent/:teacherId/:groupId/:studentId', checkAuth, RemoveStudent);


// routes.get('/addExistingGroupsStudents', checkAuth, addExistingGroupStudents);


/***************** ./ Grades Routes *******************/


module.exports = routes;