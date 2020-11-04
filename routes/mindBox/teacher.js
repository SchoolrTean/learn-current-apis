const express = require('express');
const routes = express.Router();
const path = require('path');

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
            // const folderName = './uploads/mindBox/teacher/' //+ fileName + randNum

            // try {
            //       if (!fs.existsSync(folderName)) {
            //             fs.mkdirSync(folderName)
            //             cb(null, folderName);
            //       }
            // } catch (err) {
            //       console.error(err)
            // }

            cb(null, './uploads/mindBox/teacher/');

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
      fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.bmp') {
                  return callback(new Error({
                        statusCode: "0",
                        message: "Only images are allowed...!!"
                  }))
            }
            callback(null, true)
      },
      limits: {
            files: 1
      }
});

/***************** Contoller Definition Part *******************/


const SaveMultipleChoiceQuestion = require('../../controllers/mindBox/teacher/multipleChoiceQuestion/save')

const GetMultipleChoiceQuestion = require('../../controllers/mindBox/teacher/multipleChoiceQuestion/getDetailsForEdit')

const UpdateMultipleChoiceQuestion = require('../../controllers/mindBox/teacher/multipleChoiceQuestion/edit')

const SaveMultipleChoiceQuestionAnswer = require('../../controllers/mindBox/teacher/multipleChoiceQuestion/saveAnswer')



const SaveDoubtAnswer = require('../../controllers/mindBox/teacher/doubt/saveAnswer');

const CorrectAnswer = require('../../controllers/mindBox/teacher/doubt/checkCorrectAnswer')



const FilterSubjectNames = require('../../controllers/mindBox/teacher/filter/filteredSubjectList')

const FilteredQuestionList = require('../../controllers/mindBox/teacher/filter/filteredQuestionList')



const DeleteQuestion = require('../../controllers/mindBox/teacher/delete/deleteQuestion')

const DeleteQuestionAnswer = require('../../controllers/mindBox/teacher/delete/deleteQuestionAnswer')



const LikeQuestion = require('../../controllers/mindBox/teacher/like/likeQuestion')

const LikeQuestionAnswer = require('../../controllers/mindBox/teacher/like/likeQuestionAnswer')



const UnReportQuestion = require('../../controllers/mindBox/teacher/unReport/unReportQuestion')

const UnReportQuestionAnswer = require('../../controllers/mindBox/teacher/unReport/unReportQuestionAnswer')



const UpdateTimeStamp = require('../../controllers/mindBox/teacher/timeStamp')

const QuestionList = require('../../controllers/mindBox/teacher/list')

const QuestionDetails = require('../../controllers/mindBox/teacher/singleQuestionDetails')


/***************** ./ Contoller Definition Part *******************/



/************************ Anouncements Routes ***********************/


routes.post('/saveMultipleChoiceQuestion', checkAuth, upload.single('mindBoxQuestionDocument'), SaveMultipleChoiceQuestion);

routes.get('/getMultipleChoiceQuestion/:teacherId/:groupId/:questionId', checkAuth, GetMultipleChoiceQuestion);

routes.patch('/updateMultipleChoiceQuestion/:teacherId/:groupId/:questionId', checkAuth, upload.single('mindBoxQuestionDocument'), UpdateMultipleChoiceQuestion);

routes.post('/saveMultipleChoiceAnswer', checkAuth, SaveMultipleChoiceQuestionAnswer);



routes.post('/saveDoubtAnswer', checkAuth, upload.single('mindBoxAnswerDocument'), SaveDoubtAnswer);

routes.patch('/correctAnswer/:teacherId/:groupId/:questionId/:answerId', checkAuth, CorrectAnswer);



routes.get('/filterSubjectNames/:teacherId', checkAuth, FilterSubjectNames);

routes.post('/filter/', checkAuth, FilteredQuestionList);



routes.delete('/question/:teacherId/:groupId/:questionId', checkAuth, DeleteQuestion);

routes.delete('/answer/:teacherId/:groupId/:questionId/:answerId', checkAuth, DeleteQuestionAnswer);



routes.patch('/likeQuestion/:teacherId/:groupId/:questionId', checkAuth, LikeQuestion);

routes.patch('/likeAnswer/:teacherId/:groupId/:questionId/:answerId', checkAuth, LikeQuestionAnswer);



routes.patch('/unReportQuestion/:teacherId/:groupId/:questionId', checkAuth, UnReportQuestion);

routes.patch('/unReportAnswer/:teacherId/:groupId/:questionId/:answerId', checkAuth, UnReportQuestionAnswer);



routes.patch('/updateTimeStamp/:teacherId', checkAuth, UpdateTimeStamp);

routes.get('/list/:teacherId/:loadMoreId?', checkAuth, QuestionList);

routes.get('/question/:teacherId/:groupId/:questionId', checkAuth, QuestionDetails);


/************************ ./Announcements Routes ***********************/




module.exports = routes;