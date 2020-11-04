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

const CreatePersonalEvent = require('../../../controllers/planner/student/personalEvent/create');

const GetPersonalEvent = require('../../../controllers/planner/student/personalEvent/get');

const EditPersonalEvent = require('../../../controllers/planner/student/personalEvent/edit');

const DeletePersonalEvent = require('../../../controllers/planner/student/personalEvent/delete');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.post('/create', checkAuth, upload.any('personalEventDocument'), CreatePersonalEvent);

routes.get('/event/:studentId/:eventId', checkAuth, GetPersonalEvent);

routes.put('/edit/:studentId/:eventId', checkAuth, upload.any('personalEventDocument'), EditPersonalEvent);

routes.delete('/delete/:studentId/:eventId', checkAuth, DeletePersonalEvent);


/***************** ./ Grades Routes *******************/


module.exports = routes;