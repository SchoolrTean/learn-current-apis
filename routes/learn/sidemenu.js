const express = require('express');
const routes = express.Router();

const checkAuth = require('../../middleware/auth')

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
            files: 3
      }
});



/** ---------------------------- Controllers Definition --------------------------------*/
const ViewProfile = require('../../controllers/sidemenu/viewProfile');

const EditProfile = require('../../controllers/sidemenu/editProfile');

const ChangeProfilePic = require('../../controllers/sidemenu/changeProfilePic');

const ChangePassword = require('../../controllers/sidemenu/changePassword');

const FaqList = require('../../controllers/sidemenu/faq');

const SaveUserRequest = require('../../controllers/sidemenu/saveUserRequest');

const UserRequestList = require('../../controllers/sidemenu/userRequestList');


/** ---------------------------- Controllers Definition --------------------------------*/

routes.get("/profile/:userId", checkAuth, ViewProfile);

routes.patch("/profile/:userId", checkAuth, EditProfile);

routes.post("/changeProfilePic", checkAuth, upload.single('profilePic'), ChangeProfilePic);

routes.post("/changePassword", checkAuth, ChangePassword);

routes.get("/faqList/:userId", checkAuth, FaqList);

routes.post("/saveUserRequest", checkAuth, upload.any('requestDocuments'), SaveUserRequest);

routes.get("/userRequests/:userId", checkAuth, UserRequestList);




module.exports = routes;