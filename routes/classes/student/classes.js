const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');

const multer = require('multer');
const fs = require('fs');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

// const storage = multer.diskStorage({

//       destination: function (req, file, cb) {

//             let randNum = Math.round(Math.random() * (999999 - 111111));
//             const folderName = './uploads/savedHomeWorkFiles/' + fileName + randNum

//             try {
//                   if (!fs.existsSync(folderName)) {
//                         fs.mkdirSync(folderName)
//                         cb(null, folderName);
//                   }
//             } catch (err) {
//                   console.error(err)
//             }

//       },
//       filename: function (req, file, cb) {

//             cb(null, file.originalname);

//       }

// });

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            cb(null, './uploads/savedHomeWorkFiles/');
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
const GetSubjectList = require('../../../controllers/classes/student/getSubjectList');

const MyActivity = require('../../../controllers/classes/student/myActivity');

const SubjectWiseAssignmentList = require('../../../controllers/classes/student/subjectWiseAssignmentList');

const SubjectWiseClassList = require('../../../controllers/classes/student/subjectWiseClassList');

const AllAssignmentList = require('../../../controllers/classes/student/allAssignmentList');

const AllClassList = require('../../../controllers/classes/student/allClassList');



const ViewWorkSheet = require('../../../controllers/classes/student/view/workSheet');

const SaveWorkSheetAnswer = require('../../../controllers/classes/student/saveWorkSheetUserAnswer');



const ViewHomework = require('../../../controllers/classes/student/view/homeWork');

const ViewProjectWork = require('../../../controllers/classes/student/view/projectWork');

const ViewAnnouncement = require('../../../controllers/classes/student/view/announcement');

const ViewTest = require('../../../controllers/classes/student/view/test');

const ViewClass = require('../../../controllers/classes/student/view/class');

const ViewPost = require('../../../controllers/classes/student/view/post');



const StudentAssignmentFiles = require('../../../controllers/classes/student/saveStudentAssignmentFiles');

const SubmitAssignment = require('../../../controllers/classes/student/submitAssignment');

/***************** ./ Contoller Definition Part *******************/



/***************** Group Routes *******************/
routes.get('/subjectList/:studentId', checkAuth, GetSubjectList)

routes.get('/myActivity/:studentId/:activityId', checkAuth, MyActivity)

routes.patch('/assignmentList/:studentId/:lastAssignmentId?', checkAuth, SubjectWiseAssignmentList)

routes.patch('/classList/:studentId/:lastClassId?', checkAuth, SubjectWiseClassList)

routes.get('/allAssignmentList/:studentId/:lastAssignmentId?', checkAuth, AllAssignmentList)

routes.get('/allClassList/:studentId/:lastClassId?', checkAuth, AllClassList)



routes.get('/viewWorkSheet/:studentId/:homeWorkId/:workSheetId', checkAuth, ViewWorkSheet)

routes.post('/saveWorkSheetAnswer', checkAuth, upload.any('homeWorkWorkSheetAnswerDocuments'), SaveWorkSheetAnswer)



routes.get('/viewHomeWork/:studentId/:classId/:homeWorkId', checkAuth, ViewHomework)

routes.get('/viewProjectWork/:studentId/:classId/:projectWorkId', checkAuth, ViewProjectWork)

routes.get('/viewAnnouncement/:studentId/:classId/:announcementId', checkAuth, ViewAnnouncement)

routes.get('/viewTest/:studentId/:classId/:testId', checkAuth, ViewTest)

routes.get('/viewClass/:studentId/:classId/:scheduledClassId', checkAuth, ViewClass)

routes.get('/viewPost/:studentId/:classId/:postId', checkAuth, ViewPost)



routes.post('/saveHomeWorkFiles', checkAuth, upload.any('homeWorkSubmissionDocuments'), StudentAssignmentFiles)

routes.patch('/submitHomeWorks/:studentId/:classId/:assignmentId', checkAuth, upload.any('homeWorkSubmissionDocuments'), SubmitAssignment)


/***************** ./ Group Routes *******************/


module.exports = routes;