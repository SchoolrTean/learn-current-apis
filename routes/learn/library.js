const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth');



/** ---------------------------- Controllers Definition --------------------------------*/

const LibraryChapterPDFPage = require('../../controllers/learn/library/chapterPDFPage');

const LibraryChapterExercises = require('../../controllers/learn/library/chapterExercises');

const LibraryChapterTests = require('../../controllers/learn/library/chapterTests');


/** ---------------------------- Controllers Definition --------------------------------*/

routes.get("/ChapterPdf/:userId/:chapterId", checkAuth, LibraryChapterPDFPage);

routes.get("/exercises/:userId/:chapterId/:exerciseId?", checkAuth, LibraryChapterExercises);

routes.get("/tests/:userId/:chapterId/:testId?", checkAuth, LibraryChapterTests);



module.exports = routes;