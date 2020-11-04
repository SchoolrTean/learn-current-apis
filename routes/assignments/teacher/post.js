const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../middleware/auth')

const multer = require('multer');
const fs = require('fs');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    // let randNum = Math.round(Math.random() * (999999 - 111111));
    // const folderName = './uploads/announcementDocuments/' + fileName + randNum

    // try {
    //   if (!fs.existsSync(folderName)) {
    //     fs.mkdirSync(folderName)
    //     cb(null, folderName);
    //   }
    // } catch (err) {
    //   console.error(err)
    // }
    cb(null, './uploads/post/');
  },
  filename: function (req, file, cb) {
    // let randNum = Math.round(Math.random() * (999999 - 111111));
    // let ext = file.originalname.split('.');
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

/***************** Contoller Definition Part *******************/

const postController = require('../../../controllers/assignment/teacher/post/postController');


/***************** ./ Contoller Definition Part *******************/



/************************ Anouncements Routes ***********************/

routes.post('/', checkAuth, upload.any('postDocument'), postController.savePost);

routes.get('/:teacherId/:classId/:postId', checkAuth, postController.getPost);

routes.patch('/:teacherId/:classId/:postId', upload.any('announcementDocument'), postController.updatePost);

routes.put('/:teacherId/:classId/:postId', upload.any('announcementDocument'), postController.forwardPost);

routes.get('/viewPost/:teacherId/:classId/:postId', checkAuth, postController.viewPost);

/************************ ./Announcements Routes ***********************/




module.exports = routes;