const express = require('express');
const routes = express.Router();

const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            cb(null, './uploads/testPapers');
      },
      filename: function (req, file, cb) {
            let randNum = Math.round(Math.random() * (999999 - 111111));
            let ext = file.originalname.split('.');
            cb(null, fileName + randNum + "." + ext[1]);
      }

});

const upload = multer({
      storage: storage,
});


const checkAuth = require('../../middleware/auth')

/** ---------------------------- Controllers Definition --------------------------------*/
const SearchTopics = require('../../controllers/learn/searchTopics');



/** ---------------------------- Controllers Definition --------------------------------*/
routes.post("/searchTopics", checkAuth, SearchTopics);


module.exports = routes;