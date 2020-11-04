const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth')



/** ---------------------------- Controllers Definition --------------------------------*/
const SubjectBookList = require('../../controllers/learn/subjectBookListController');

const BookChapterList = require('../../controllers/learn/bookChapterList');

const RevisionExercisesList = require('../../controllers/learn/revisionExercises');

const TestRevision = require('../../controllers/learn/testRevision');

const TestPaperList = require('../../controllers/learn/testPaperList');

const SamplePaperList = require('../../controllers/learn/samplePaperList');

/** ---------------------------- Controllers Definition --------------------------------*/




routes.get("/list/:userId/:syllabusId/:mediumId/:gradeId", checkAuth, SubjectBookList);

routes.get("/chapterList/:userId/:bookId", checkAuth, BookChapterList);

routes.get("/revisionExercises/:userId/:bookId/:chapterId?", checkAuth, RevisionExercisesList);

routes.get("/testRevision/:userId/:bookId/:chapterId?", checkAuth, TestRevision);

routes.get("/testPaper/:userId/:subjectId", checkAuth, TestPaperList);

routes.get("/samplePaper/:userId/:subjectId", checkAuth, SamplePaperList);





module.exports = routes;