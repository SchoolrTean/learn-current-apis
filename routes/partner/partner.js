const express               = require('express');
const routes                = express.Router();



/************************ Controllers Declaration Section ***********************/
const partnerController        = require('../../controllers/partner/partnerController');



/**************************  Subject Chapter Routes  ***************************/

routes.post('/', partnerController.createPartner);


module.exports = routes;