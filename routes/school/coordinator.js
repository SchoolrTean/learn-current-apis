const express = require('express');
const routes = express.Router();

const checkAuth = require('../../controllers/authentication/auth');

/** ---------------------------- Controllers Definition --------------------------------*/


const addSchoolCoordinator = require('../../controllers/school/coordinator/add');

const editSchoolCoordinator = require('../../controllers/school/coordinator/edit');

const deleteSchoolCoordinator = require('../../controllers/school/coordinator/delete');

const checkEmail = require('../../controllers/school/coordinator/checkEmailIdRegistered');

const SchoolCoordinatorList = require('../../controllers/school/coordinator/list');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/add", checkAuth, addSchoolCoordinator);

routes.patch("/edit/:schoolId/:coordinatorId", checkAuth, editSchoolCoordinator);

routes.delete("/delete/:schoolId/:coordinatorId", checkAuth, deleteSchoolCoordinator);

routes.post("/checkEmailId", checkAuth, checkEmail.checkEmailIdRegistered);

routes.get("/list/:schoolId", checkAuth, SchoolCoordinatorList);


module.exports = routes;