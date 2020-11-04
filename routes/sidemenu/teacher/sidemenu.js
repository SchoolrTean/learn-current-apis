const express = require('express');
const routes = express.Router();

const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            cb(null, './uploads/teacherProfilePics');
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

const viewTeacherProfile = require('../../../controllers/sidemenu/teacher/profile/view');

const editTeacherProfile = require('../../../controllers/sidemenu/teacher/profile/edit');

const editMobileNo = require('../../../controllers/sidemenu/teacher/profile/editMobileno');

const changeMobileno = require('../../../controllers/sidemenu/teacher/profile/changeMobileno');

const changePassword = require('../../../controllers/sidemenu/teacher/profile/changePassword');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.get('/profile/view/:teacherId', checkAuth, viewTeacherProfile);

routes.put('/profile/edit', checkAuth, upload.single('profilePic'), editTeacherProfile);

routes.patch('/profile/editMobileNo/:teacherId', checkAuth, editMobileNo);

routes.patch('/profile/changeMobileno/:teacherId', checkAuth, changeMobileno);

routes.patch('/profile/changePassword/:teacherId', checkAuth, changePassword);


/***************** ./ Grades Routes *******************/


module.exports = routes;