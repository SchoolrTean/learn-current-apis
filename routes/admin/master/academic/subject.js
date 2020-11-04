const express = require('express');
const routes = express.Router();



/************************ Controllers Declaration Section ***********************/

const Subject = require('../../../../controllers/admin/master/academics/subject/subjectsController');





/************************ Subject Routes ********************/
routes.post('/', Subject.saveSubject);

routes.get('/', Subject.getSubjects);

routes.patch('/:subjectId', Subject.updateSubject);





module.exports = routes;