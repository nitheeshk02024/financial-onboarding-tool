const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const { validateInsuranceInput } = require('../middleware/validation');

router.get('/', insuranceController.getInsurancePlans);

module.exports = router;
