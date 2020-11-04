const express = require('express');
const routes = express.Router();




/************************ Controllers Declaration Section ***********************/
const Syllabus = require('../../../../controllers/admin/master/academics/syllabusController');



/************************ Syllabus Routes ********************/
routes.post('/', Syllabus.saveSyllabus);

routes.get('/', Syllabus.getSyllabusList);

routes.get('/:syllabusId', Syllabus.getSyllabus);

routes.patch('/:syllabusId', Syllabus.updateSyllabus);

routes.delete('/:syllabusId', Syllabus.deleteSyllabus);




module.exports = routes;