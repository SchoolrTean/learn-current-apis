const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');

const multer = require('multer');
const fs = require('fs');


let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {

            let randNum = Math.round(Math.random() * (999999 - 111111));
            const folderName = './uploads/teacherProfilePics/' + fileName + randNum

            try {
                  if (!fs.existsSync(folderName)) {
                        fs.mkdirSync(folderName)
                        cb(null, folderName);
                  }
            } catch (err) {
                  console.error(err)
            }

      },
      filename: function (req, file, cb) {

            cb(null, file.originalname);

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

const studentList = require('../../../controllers/sidemenu/student/studentList');

const viewStudentProfile = require('../../../controllers/sidemenu/student/profile/view');

const changePassword = require('../../../controllers/sidemenu/student/profile/changePassword');

const editStudentProfile = require('../../../controllers/sidemenu/student/profile/edit');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.get('/studentList/:studentId', checkAuth, studentList);

routes.get('/profile/view/:studentId', checkAuth, viewStudentProfile);

routes.patch('/profile/edit/:studentId', checkAuth, upload.single('profilePic'), editStudentProfile);

routes.patch('/profile/changePassword/:studentId', checkAuth, changePassword);

/***************** ./ Grades Routes *******************/


module.exports = routes;