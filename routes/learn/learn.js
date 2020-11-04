const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth')

/** ---------------------------- Controllers Definition --------------------------------*/
const SubjectBookList = require('../../controllers/learn/subjectBookListController');

const BookChapterList = require('../../controllers/learn/bookChapterList');

const LibraryChapterPDFPage = require('../../controllers/learn/library/chapterPDFPage');

const LibraryChapterExercises = require('../../controllers/learn/library/chapterExercises');

const SaveExerciseAnswer = require('../../controllers/learn/library/saveExerciseAnswer');

// const LibraryChapterTests = require('../controllers/learn/library/chapterTests');

/** ---------------------------- Controllers Definition --------------------------------*/


routes.get("/subjectBookList/:userId/:syllabusId/:mediumId/:gradeId", checkAuth, SubjectBookList);

routes.get("/bookChapterList/:userId/:bookId", checkAuth, BookChapterList);

routes.get("/libraryChapterPdf/:userId/:chapterId", checkAuth, LibraryChapterPDFPage);

routes.get("/libraryChapterExercises/:userId/:chapterId/:ExerciseId?", checkAuth, LibraryChapterExercises);

routes.post("/saveUserExerciseAnswer", checkAuth, SaveExerciseAnswer);

// routes.get("/LibraryChapterTests/:userId/:chapterId", checkAuth, LibraryChapterTests);


module.exports = routes;