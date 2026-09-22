const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const { validateTaxInput } = require('../middleware/validation');

router.post('/calculate', validateTaxInput, taxController.calculateTax);

module.exports = router;
