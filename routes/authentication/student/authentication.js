const express = require('express');
const routes = express.Router();
const fs = require('fs');

const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {

            let randNum = Math.round(Math.random() * (999999 - 111111));
            const folderName = './uploads/studentProfilePics/' + fileName + randNum

            try {
                  if (!fs.existsSync(folderName)) {
                        fs.mkdirSync(folderName)
                        cb(null, folderName);
                  }
            } catch (err) {
                  console.error(err)
            }

      },
      filename: function (req, file, cb) {

            cb(null, file.originalname);

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


const signIn = require('../../../controllers/authentication/student/signIn');

const password = require('../../../controllers/authentication/student/password');

/** ---------------------------- Controllers Definition --------------------------------*/

routes.post("/signIn", signIn);

routes.post("/forgotPassword", password.forgot);

routes.post("/resetPassword", password.reset);

module.exports = routes;