const express = require('express');
const routes = express.Router();



/************************ Controllers Declaration Section ***********************/
const Medium = require('../../../../controllers/admin/master/academics/mediumController');



/************************ Medium Routes ********************/
routes.post('/', Medium.insertMedium);

routes.get('/', Medium.getMediumList);

routes.get('/:mediumId', Medium.getMedium);

routes.patch('/:mediumId', Medium.updateMedium);

routes.delete('/:mediumId', Medium.deleteMedium);




module.exports = routes;