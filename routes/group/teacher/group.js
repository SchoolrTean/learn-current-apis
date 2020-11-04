const express = require('express');
const routes = express.Router();

const checkAuth = require('../../../controllers/authentication/auth');

const multer = require('multer');
const fs = require('fs');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {

            let randNum = Math.round(Math.random() * (999999 - 111111));
            const folderName = './uploads/groupPics/' + fileName + randNum

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

/***************** Contoller Definition Part *******************/

const create = require('../../../controllers/group/teacher/createGroup');

const addGroupSubject = require('../../../controllers/group/teacher/subject/addGroupSubjects');

const groupSubjectList = require('../../../controllers/group/teacher/subject/groupSubjectList');

const editGroupSubjectList = require('../../../controllers/group/teacher/subject/editGroupSubjects');

const groupWiseStudentList = require('../../../controllers/group/teacher/student/groupWiseStudentList');

const searchTeacherMobileno = require('../../../controllers/group/teacher/searchTeacherMobileno');

const groupList = require('../../../controllers/group/teacher/groupList');

const groupDetails = require('../../../controllers/group/teacher/groupDetails');

const editGroup = require('../../../controllers/group/teacher/editGroup');

const refreshGroup = require('../../../controllers/group/teacher/refreshGroup');

const transferGroup = require('../../../controllers/group/teacher/transferGroup');


/***************** ./ Contoller Definition Part *******************/



/***************** Group Routes *******************/

routes.post('/create', checkAuth, upload.single('groupPic'), create);

routes.patch('/edit/:teacherId/:groupId', checkAuth, upload.single('groupPic'), editGroup);

routes.get('/list/:teacherId', checkAuth, groupList);

routes.get('/details/:teacherId/:groupId', checkAuth, groupDetails);

routes.patch('/searchTeacherMobileno/:teacherId', checkAuth, searchTeacherMobileno);

routes.patch('/refresh/:teacherId/:groupId', refreshGroup);

routes.patch('/transfer/:teacherId/:groupId', transferGroup);

routes.get('/allGroupsStudentList/:teacherId/:groupId', checkAuth, groupWiseStudentList);




routes.post('/addSubject', checkAuth, addGroupSubject);

routes.post('/subjectList', checkAuth, groupSubjectList);

routes.get('/subjectList/edit/:teacherId/:groupId', checkAuth, editGroupSubjectList);



/***************** ./ Group Routes *******************/


module.exports = routes;