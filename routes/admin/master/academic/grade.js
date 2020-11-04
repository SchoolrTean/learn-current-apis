const express = require('express');
const routes = express.Router();



/************************ Controllers Declaration Section ***********************/

const SaveGrade = require('../../../../controllers/admin/master/academics/grade/saveGrade');

const GradeList = require('../../../../controllers/admin/master/academics/grade/gradeList');

const GradeDetails = require('../../../../controllers/admin/master/academics/grade/gradeDetails');

const UpdateGrade = require('../../../../controllers/admin/master/academics/grade/updateGrade');

const DeleteGrade = require('../../../../controllers/admin/master/academics/grade/deleteGrade');


/************************ Grades Routes ********************/
routes.post('/', SaveGrade);

routes.get('/', GradeList);

routes.get('/:gradeId', GradeDetails);

routes.patch('/:gradeId', UpdateGrade);

routes.delete('/:gradeId', DeleteGrade);



module.exports = routes;