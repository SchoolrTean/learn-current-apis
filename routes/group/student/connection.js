const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');

// const multer = require('multer');

// let fileName = new Date().toISOString()
// fileName = fileName.replace(/\./g, '');
// fileName = fileName.replace(/:/g, '');
// fileName = fileName.replace(/-/g, '');

// const storage = multer.diskStorage({

//       destination: function (req, file, cb) {
//             cb(null, './uploads/studentProfilePics');
//       },
//       filename: function (req, file, cb) {
//             let randNum = Math.round(Math.random() * (999999 - 111111));
//             let ext = file.originalname.split('.');
//             let orginalfileName = "";

//             for (let index = 0; index < (ext.length - 1); index++) {
//                   const orginalExtension = ext[index];
//                   if (index == 0) {
//                         orginalfileName += orginalExtension
//                   } else {
//                         orginalfileName += "." + orginalExtension
//                   }
//             }

//             cb(null, orginalfileName + "-_-_-_" + fileName + randNum + "." + ext[ext.length - 1]);
//       }

// });

// const upload = multer({
//       storage: storage,
//       limits: {
//             /*fileSize  : 1024 * 1024 * 1,*/
//             files: 5
//       }
// });

/***************** Contoller Definition Part *******************/

const connectedTeachers = require('../../../controllers/group/student/connectedTeachers');

const connectedGroupList = require('../../../controllers/group/student/connectedGroupList')


/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.get('/teachersList/:studentId', checkAuth, connectedTeachers);

routes.get('/connectedGroupsList/:studentId', checkAuth, connectedGroupList);

/***************** ./ Grades Routes *******************/


module.exports = routes;