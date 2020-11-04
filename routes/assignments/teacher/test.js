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
    // const folderName = './uploads/testDocuments/' + fileName + randNum

    // try {
    //   if (!fs.existsSync(folderName)) {
    //     fs.mkdirSync(folderName)
    //     cb(null, folderName);
    //   }
    // } catch (err) {
    //   console.error(err)
    // }

    cb(null, './uploads/testDocuments/');

  },
  filename: function (req, file, cb) {

    let ext = file.originalname.split('.');
    let randNum = Math.round(Math.random() * (999999 - 111111));

    cb(null, fileName + randNum + "." + ext[ext.length - 1]);

    // cb(null, file.originalname);

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

const testController = require('../../../controllers/assignment/teacher/test/testController');


/***************** ./ Contoller Definition Part *******************/



/***************** SignUp Routes *******************/

routes.post('/', checkAuth, upload.any('testDocument'), testController.saveTest);

routes.get('/:teacherId/:groupId/:testId', checkAuth, testController.getTest);

routes.patch('/:teacherId/:groupId/:testId', checkAuth, upload.any('testDocument'), testController.updateTest);

routes.put('/:teacherId/:groupId/:testId', checkAuth, upload.any('testDocument'), testController.forwardTest);

routes.get('/viewTest/:teacherId/:classId/:testId', checkAuth, testController.viewTest);

/***************** ./ SignUp Routes *******************/


module.exports = routes;