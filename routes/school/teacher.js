const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');

/** ---------------------------- Controllers Definition --------------------------------*/


const addSchoolTeacher = require('../../controllers/school/teacher/add');

const editSchoolTeacher = require('../../controllers/school/teacher/edit');

const deleteSchoolTeacher = require('../../controllers/school/teacher/delete');

const checkEmail = require('../../controllers/school/teacher/checkEmailIdRegistered');

const SchoolTeacherList = require('../../controllers/school/teacher/list');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/add", checkAuth, addSchoolTeacher);

routes.patch("/edit/:schoolId/:teacherId", checkAuth, editSchoolTeacher);

routes.delete("/delete/:schoolId/:teacherId", checkAuth, deleteSchoolTeacher);

routes.post("/checkEmailId", checkAuth, checkEmail.checkEmailIdRegistered);

routes.get("/list/:schoolId", checkAuth, SchoolTeacherList);


module.exports = routes;