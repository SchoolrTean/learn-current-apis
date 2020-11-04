const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../middleware/auth');

const multer = require('multer');
const fs = require('fs');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './uploads/homeWorkDocuments/');
  },
  filename: function (req, file, cb) {

    let ext = file.originalname.split('.');
    let randNum = Math.round(Math.random() * (999999 - 111111));

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

/***************** Contoller Definition Part *******************/

const homeWorkController = require('../../../controllers/assignment/teacher/homeWork/homeWorkContoller');


/***************** ./ Contoller Definition Part *******************/



/***************** HomeWork Routes *******************/

routes.post('/', checkAuth, upload.any('homeWorkDocument'), homeWorkController.insertHomeWork);

routes.get('/:teacherId/:classId/:homeWorkId', checkAuth, homeWorkController.getHomeWork);

routes.patch('/:teacherId/:classId/:homeWorkId', checkAuth, upload.any('homeWorkDocument'), homeWorkController.updateHomeWork);

routes.put('/:teacherId/:groupId/:homeWorkId', checkAuth, upload.any('homeWorkDocument'), homeWorkController.forwardHomeWork);

routes.get('/viewHomeWork/:teacherId/:classId/:homeWorkId', checkAuth, homeWorkController.viewHomeWork);


/***************** ./ HomeWork Routes *******************/


module.exports = routes;