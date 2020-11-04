const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');

/** ---------------------------- Controllers Definition --------------------------------*/


const addSchoolStudent = require('../../controllers/school/student/add');

const listSchoolStudent = require('../../controllers/school/student/list');

const addLanguages = require('../../controllers/school/student/addLanguages');

const addToExistingGroup = require('../../controllers/school/student/addToExistingSchoolGroup');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/add", checkAuth, addSchoolStudent);

routes.post("/addLanguage", checkAuth, addLanguages);

routes.post("/addToExistingGroup", checkAuth, addToExistingGroup);

routes.get("/list/:schoolId/:groupId", checkAuth, listSchoolStudent);


module.exports = routes;