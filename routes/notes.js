const express = require('express');
const routes = express.Router();

const checkAuth = require('../middleware/auth')

const multer = require('multer');


let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {

            cb(null, './uploads/notes/');

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



/** ---------------------------- Controllers Definition --------------------------------*/
const SaveNote = require('../controllers/notes/saveNote');

const NoteList = require('../controllers/notes/getNoteList');

const NoteDetails = require('../controllers/notes/getNote');

const UpdateNote = require('../controllers/notes/upadateNote');

const DeleteNote = require('../controllers/notes/deleteNote');

const SaveNoteImage = require('../controllers/notes/saveNoteImage');


/** ---------------------------- Controllers Definition --------------------------------*/


routes.post("/save", checkAuth, upload.any('notesDocument'), SaveNote);

routes.get("/list/:userId", checkAuth, NoteList);

routes.get("/details/:userId/:noteId", checkAuth, NoteDetails);

routes.patch("/edit/:userId/:noteId", checkAuth, upload.any('notesDocument'), UpdateNote);

routes.delete("/delete/:userId/:noteId", checkAuth, DeleteNote);

routes.post("/saveImage", checkAuth, upload.single('notesDocument'), SaveNoteImage);


module.exports = routes;