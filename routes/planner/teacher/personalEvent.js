const express = require('express');
const routes = express.Router();


const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './uploads/questionBank/teacher');
    },
    filename: function (req, file, cb) {
        let randNum = Math.round(Math.random() * (999999 - 111111));
        let ext = file.originalname.split('.');

        cb(null, fileName + randNum + "." + ext[ext.length - 1]);
    }

});

const upload = multer({
    storage: storage,
    limits: {
        /*fileSize  : 1024 * 1024 * 1,*/
        files: 5
    }
});


const checkAuth = require('../../../controllers/authentication/auth');


/***************** Contoller Definition Part *******************/

const CreatePersonalEvent = require('../../../controllers/planner/teacher/personalEvent/create');

const GetPersonalEvent = require('../../../controllers/planner/teacher/personalEvent/get');

const EditPersonalEvent = require('../../../controllers/planner/teacher/personalEvent/edit');

const DeletePersonalEvent = require('../../../controllers/planner/teacher/personalEvent/delete');

// const SetPersonalEventReminder = require('../../../controllers/planner/student/personalEvent/setReminder');

// const RemovePersonalEventReminder = require('../../../controllers/planner/student/personalEvent/removeReminder');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.post('/create', checkAuth, upload.any('personalEventDocument'), CreatePersonalEvent);

routes.get('/event/:teacherId/:eventId', checkAuth, GetPersonalEvent);

routes.put('/edit/:teacherId/:eventId', checkAuth, upload.any('personalEventDocument'), EditPersonalEvent);

routes.delete('/delete/:teacherId/:eventId', checkAuth, DeletePersonalEvent);

// routes.patch('/setReminder/:studentId/:eventId', checkAuth, SetPersonalEventReminder);

// routes.delete('/removeReminder/:studentId/:eventId', checkAuth, RemovePersonalEventReminder);


/***************** ./ Grades Routes *******************/


module.exports = routes;