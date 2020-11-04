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



let uploadExerciseDocuments = upload.fields([{
    name: 'questionImage',
    maxCount: 1
}, {
    name: 'answer1Image',
    maxCount: 1
}, {
    name: 'answer2Image',
    maxCount: 1
}, {
    name: 'answer3Image',
    maxCount: 1
}, {
    name: 'answer4Image',
    maxCount: 1
}, {
    name: 'answer5Image',
    maxCount: 1
}])



/***************** Contoller Definition Part *******************/

const SaveTestPaperQuestion = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/question/saveTestPaperQuestion');

const TestPaperQuestionList = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/question/testPaperQuestionList');

const GetTestPaperQuestion = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/question/getTestPaperQuestion');

const EditTestPaperQuestion = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/question/editTestPaperQuestion');

const DeleteTestPaperQuestion = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/question/deleteTestPaperQuestion');



const SaveTestPaper = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/saveTestPaper');

const GetTestPaperList = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/getTestPaperList');

const GetTestPaper = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/getTestPaper');

const UpdateTestPaper = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/editTestPaper');

const DeleteTestPaper = require('../../../controllers/sidemenu/teacher/questionBank/testPaper/deleteTestPaper');



/** Work Sheet */

const SaveWorkSheetQuestion = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/question/saveWorkSheetQuestion');

const WorkSheetQuestionList = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/question/workSheetQuestionList');

const GetWorkSheetQuestion = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/question/getWorkSheetQuestion');

const EditWorkSheetQuestion = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/question/editWorkSheetQuestion');

const DeleteWorkSheetQuestion = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/question/deleteWorkSheetQuestion');



const SaveWorkSheet = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/saveWorkSheet');

const GetWorkSheetList = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/getWorkSheetList');

const GetWorkSheet = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/getWorkSheet');

const UpdateWorkSheet = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/editWorkSheet');

const DeleteWorkSheet = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/deleteWorkSheet');



const ViewStudentSubmittedWorkSheet = require('../../../controllers/sidemenu/teacher/questionBank/workSheet/viewStudentSubmittedWorksheet');



const GetChapterList = require('../../../controllers/sidemenu/teacher/questionBank/getChapterListBasedOnSubjectName');

const GetTopicList = require('../../../controllers/sidemenu/teacher/questionBank/getTopicsBasedOnChapterId');

const GetExerciseList = require('../../../controllers/sidemenu/teacher/questionBank/getExercisesBasedOnChapterId');

// const editTeacherProfile = require('../../../controllers/sidemenu/teacher/profile/edit');

// const editMobileNo = require('../../../controllers/sidemenu/teacher/profile/editMobileno');

// const changeMobileno = require('../../../controllers/sidemenu/teacher/profile/changeMobileno');

// const changePassword = require('../../../controllers/sidemenu/teacher/profile/changePassword');

/***************** ./ Contoller Definition Part *******************/



/***************** Grades Routes *******************/

routes.post('/saveTestPaperQuestion', checkAuth, uploadExerciseDocuments, SaveTestPaperQuestion);

routes.patch('/getQuestionList/:teacherId/:classId', checkAuth, TestPaperQuestionList);

routes.get('/getQuestion/:teacherId/:questionId', checkAuth, GetTestPaperQuestion);

routes.patch('/updateQuestion/:teacherId/:classId/:questionId', checkAuth, EditTestPaperQuestion);

routes.delete('/deleteQuestion/:teacherId/:classId/:questionId', checkAuth, DeleteTestPaperQuestion);


routes.post('/saveTestPaper', checkAuth, SaveTestPaper);

routes.get('/getTestPaperList/:teacherId', checkAuth, GetTestPaperList);

routes.get('/getTestPaper/:teacherId/:classId/:testPaperId',checkAuth, GetTestPaper)

routes.patch('/updateTestPaper/:teacherId/:classId/:testPaperId',checkAuth, UpdateTestPaper)

routes.delete('/deleteTestPaper/:teacherId/:classId/:testPaperId', checkAuth, DeleteTestPaper);



/**Work Sheet */

routes.post('/saveWorkSheetQuestion', checkAuth, uploadExerciseDocuments, SaveWorkSheetQuestion);

routes.patch('/getWorkSheetQuestionList/:teacherId/:classId', checkAuth, WorkSheetQuestionList);

routes.get('/getWorkSheetQuestion/:teacherId/:questionId', checkAuth, GetWorkSheetQuestion);

routes.patch('/updateWorkSheetQuestion/:teacherId/:classId/:questionId', checkAuth, EditWorkSheetQuestion);

routes.delete('/deleteWorkSheetQuestion/:teacherId/:classId/:questionId', checkAuth, DeleteWorkSheetQuestion);



routes.post('/saveWorkSheet', checkAuth, SaveWorkSheet);

routes.get('/getWorkSheetList/:teacherId', checkAuth, GetWorkSheetList);

routes.get('/getWorkSheet/:teacherId/:classId/:workSheetId',checkAuth, GetWorkSheet)

routes.patch('/updateWorkSheet/:teacherId/:classId/:workSheetId',checkAuth, UpdateWorkSheet)

routes.delete('/deleteWorkSheet/:teacherId/:classId/:workSheetId', checkAuth, DeleteWorkSheet);



/**APi is used to show submitted workSheet */
routes.get('/viewStudentSubmittedWorkSheet/:teacherId/:classId/:workSheetId/:studentId/:assignmentId', checkAuth, ViewStudentSubmittedWorkSheet);



routes.patch("/getChapterList/:teacherId", checkAuth, GetChapterList);

routes.get("/getTopicList/:teacherId/:chapterId", checkAuth, GetTopicList);

routes.get("/getExerciseList/:teacherId/:chapterId", checkAuth, GetExerciseList);


// routes.patch('/profile/editMobileNo/:teacherId', checkAuth, editMobileNo);

// routes.patch('/profile/changeMobileno/:teacherId', checkAuth, changeMobileno);

// routes.patch('/profile/changePassword/:teacherId', checkAuth, changePassword);


/***************** ./ Grades Routes *******************/


module.exports = routes;