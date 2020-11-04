const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');

/** ---------------------------- Controllers Definition --------------------------------*/


const addSchoolGroup = require('../../controllers/school/group/add');

const listSchoolGroup = require('../../controllers/school/group/list');

const getSchoolGroup = require('../../controllers/school/group/getDetails');

const editSchoolGroup = require('../../controllers/school/group/edit');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/add", checkAuth, addSchoolGroup);

routes.get("/list/:schoolId", checkAuth, listSchoolGroup);

routes.get("/getDetails/:schoolId/:groupId", checkAuth, getSchoolGroup);

routes.patch("/edit/:schoolId/:groupId", checkAuth, editSchoolGroup);



module.exports = routes;