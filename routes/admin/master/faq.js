const express = require('express');
const routes = express.Router();


const multer = require('multer');

let fileName = new Date().toISOString()
fileName = fileName.replace(/\./g, '');
fileName = fileName.replace(/:/g, '');
fileName = fileName.replace(/-/g, '');

const storage = multer.diskStorage({

      destination: function (req, file, cb) {
            cb(null, './uploads/faq');
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




/************************ Controllers Declaration Section ***********************/
const SaveFAQ = require('../../../controllers/admin/master/faq/saveFaq');

const GetFAQ = require('../../../controllers/admin/master/faq/getFaq');

const UpdateFAQ = require('../../../controllers/admin/master/faq/updateFaq');



/************************ Book Routes ********************/
let uploadFaq = upload.fields([{
      name: 'questionImage',
      maxCount: 1
}, {
      name: 'answerImage',
      maxCount: 4
}])
routes.post('/', uploadFaq, SaveFAQ);

routes.get('/', GetFAQ);

routes.patch('/:faqId', uploadFaq, UpdateFAQ);

// routes.delete('/:bookId', Book.deleteBook);



module.exports = routes;