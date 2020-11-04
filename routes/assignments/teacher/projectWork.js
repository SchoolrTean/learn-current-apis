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

    // let randNum = Math.round(Math.random() * (999999 - 111111));
    // const folderName = './uploads/projectWorkDocuments/' + fileName + randNum

    // try {
    //   if (!fs.existsSync(folderName)) {
    //     fs.mkdirSync(folderName)
    //     cb(null, folderName);
    //   }
    // } catch (err) {
    //   console.error(err)
    // }

    cb(null, './uploads/projectWorkDocuments/');

  },
  filename: function (req, file, cb) {
    // let randNum = Math.round(Math.random() * (999999 - 111111));
    // let ext = file.originalname.split('.');
    // let orginalfileName = "";

    // for (let index = 0; index < (ext.length - 1); index++) {
    //   const orginalExtension = ext[index];
    //   if (index == 0) {
    //     orginalfileName += orginalExtension
    //   } else {
    //     orginalfileName += "." + orginalExtension
    //   }
    // }

    // cb(null, orginalfileName + "-_-_-_" + fileName + randNum + "." + ext[ext.length - 1]);
    // cb(null, file.originalname);

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

const ProjectWorkController = require('../../../controllers/assignment/teacher/projectWork/projectWorkController');

/***************** ./ Contoller Definition Part *******************/



/************************ Project Work Routes ***********************/

routes.post('/', upload.any('projectDocument'), checkAuth, ProjectWorkController.saveProjectWork);

routes.get('/:teacherId/:groupId/:projectWorkId', checkAuth, ProjectWorkController.getProjectWork);

routes.patch('/:teacherId/:groupId/:projectWorkId', checkAuth, upload.any('projectDocument'), ProjectWorkController.updateProjectWork);

routes.get('/:teacherId/:groupId', checkAuth, ProjectWorkController.getStudentList);

routes.patch('/:teacherId/:groupId', checkAuth, ProjectWorkController.getSubjectWiseStudentList);

routes.get('/viewProjectWork/:teacherId/:classId/:projectWorkId', checkAuth, ProjectWorkController.viewProjectWork);

/************************ ./Project Work Routes ***********************/


module.exports = routes;