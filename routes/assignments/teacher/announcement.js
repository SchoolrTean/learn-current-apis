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
    cb(null, './uploads/announcementDocuments/');
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

const announcementController = require('../../../controllers/assignment/teacher/announcement/announcementController');


/***************** ./ Contoller Definition Part *******************/



/************************ Anouncements Routes ***********************/

routes.post('/', checkAuth, upload.any('announcementDocument'), announcementController.saveAnnouncement);

routes.get('/:teacherId/:groupId/:announcementId', checkAuth, announcementController.getAnnouncement);

routes.patch('/:teacherId/:groupId/:announcementId', upload.any('announcementDocument'), announcementController.updateAnnouncement);

routes.put('/:teacherId/:groupId/:announcementId', upload.any('announcementDocument'), announcementController.forwardAnnouncement);

/*routes.get('/:teacherId/:grade/:section/:date', announcementController.getLastFiveAnnouncements);

routes.get('/:teacherId/:announcementId', announcementController.getAnnouncement);

routes.patch('/:teacherId/:announcementId', upload.any('announcementDocument') , announcementController.updateAnnouncement);

routes.delete('/:teacherId/:announcementId', announcementController.deleteAnnouncement);*/

/************************ ./Announcements Routes ***********************/




module.exports = routes;