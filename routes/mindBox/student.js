const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth')

const multer = require('multer');
const fs = require('fs');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            // let randNum = Math.round(Math.random() * (999999 - 111111));
            // const folderName = './uploads/mindBox/student/'; //+ fileName + randNum

            // try {

            //       if (!fs.existsSync(folderName)) {
            //             fs.mkdirSync(folderName)
            //             cb(null, folderName);
            //       }

            // } catch (err) {
            //       console.error(err)
            // }

            cb(null, './uploads/mindBox/student/');
      },
      filename: function (req, file, cb) {
            let randNum = Math.round(Math.random() * (999999 - 111111));
            let ext = file.originalname.split('.');
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

const GroupSubjectNamesList = require('../../controllers/mindBox/student/groupSubjectNames');


const SaveMultipleChoiceQuestion = require('../../controllers/mindBox/student/multipleChoiceQuestion/save');

const GetMultipleChoiceQuestion = require('../../controllers/mindBox/student/multipleChoiceQuestion/getDetailsForEdit');

const UpdateMultipleChoiceQuestion = require('../../controllers/mindBox/student/multipleChoiceQuestion/edit');

const SaveMultipleChoiceQuestionAnswer = require('../../controllers/mindBox/student/multipleChoiceQuestion/saveAnswer');



const SaveDoubt = require('../../controllers/mindBox/student/doubt/save');

const GetDoubt = require('../../controllers/mindBox/student/doubt/getDetailsForEdit');

const UpdateDoubt = require('../../controllers/mindBox/student/doubt/edit');


const SaveDoubtAnswer = require('../../controllers/mindBox/student/doubt/saveAnswer');

const GetDoubtAnswer = require('../../controllers/mindBox/student/doubt/getAnswerDetailsForEdit');

const UpdateUserAnswer = require('../../controllers/mindBox/student/doubt/editAnswer');



const QuestionList = require('../../controllers/mindBox/student/list');

const UpdateMindBoxTimeStamp = require('../../controllers/mindBox/student/timeStamp');

const SingleQuestionDetails = require('../../controllers/mindBox/student/singleQuestionDetails');



const LikeQuestion = require('../../controllers/mindBox/student/like/likeQuestion');

const LikeAnswer = require('../../controllers/mindBox/student/like/likeQuestionAnswer');



const ReportQuestion = require('../../controllers/mindBox/student/report/reportQuestion');

const ReportAnswer = require('../../controllers/mindBox/student/report/reportQuestionAnswer');



const DeleteQuestion = require('../../controllers/mindBox/student/delete/deleteQuestion');

const DeleteQuestionAnswer = require('../../controllers/mindBox/student/delete/deleteQuestionAnswer');



const FilteredSubjectNamesList = require('../../controllers/mindBox/student/filter/filteredSubjectNamesList');

const FilteredQuestionList = require('../../controllers/mindBox/student/filter/filteredQuestionList');


/***************** ./ Contoller Definition Part *******************/



/************************ Anouncements Routes ***********************/
routes.get('/groupSubjectList/:studentId', checkAuth, GroupSubjectNamesList);



routes.post('/saveMultipleChoiceQuestion', checkAuth, upload.single('mindBoxQuestionDocument'), SaveMultipleChoiceQuestion);

routes.get('/getMultipleChoiceQuestion/:studentId/:groupId/:questionId', checkAuth, GetMultipleChoiceQuestion);

routes.patch('/updateMultipleChoiceQuestion/:studentId/:groupId/:questionId', checkAuth, upload.single('mindBoxQuestionDocument'), UpdateMultipleChoiceQuestion);

routes.post('/saveMultipleChoiceAnswer', checkAuth, SaveMultipleChoiceQuestionAnswer);



routes.post('/saveDoubt', checkAuth, upload.single('mindBoxQuestionDocument'), SaveDoubt);

routes.get('/getDoubt/:studentId/:groupId/:questionId', checkAuth, GetDoubt);

routes.patch('/updateDoubt/:studentId/:groupId/:questionId', checkAuth, upload.single('mindBoxQuestionDocument'), UpdateDoubt);

routes.post('/saveDoubtAnswer', checkAuth, upload.single('mindBoxAnswerDocument'), SaveDoubtAnswer);

routes.get('/getDoubtAnswer/:studentId/:groupId/:questionId/:answerId', checkAuth, GetDoubtAnswer);

routes.patch('/UpdateDoubtAnswer/:studentId/:groupId/:questionId/:answerId', checkAuth, upload.single('mindBoxAnswerDocument'), UpdateUserAnswer);



routes.get('/list/:studentId/:loadMoreId?', checkAuth, QuestionList);

routes.patch('/updateTimeStamp/:studentId', checkAuth, UpdateMindBoxTimeStamp);

routes.get('/question/:studentId/:groupId/:questionId', checkAuth, SingleQuestionDetails);



routes.patch('/likeQuestion/:studentId/:groupId/:questionId', checkAuth, LikeQuestion);

routes.patch('/likeAnswer/:studentId/:groupId/:questionId/:answerId', checkAuth, LikeAnswer);



routes.patch('/reportQuestion/:studentId/:groupId/:questionId', checkAuth, ReportQuestion);

routes.patch('/reportAnswer/:studentId/:groupId/:questionId/:answerId', checkAuth, ReportAnswer);



routes.delete('/question/:studentId/:groupId/:questionId/', checkAuth, DeleteQuestion);

routes.delete('/answer/:studentId/:groupId/:questionId/:answerId', checkAuth, DeleteQuestionAnswer);



routes.get('/filter/subject/subjectNames/:studentId', checkAuth, FilteredSubjectNamesList);

routes.post('/filteredList', checkAuth, FilteredQuestionList);

/************************ ./Announcements Routes ***********************/




module.exports = routes;