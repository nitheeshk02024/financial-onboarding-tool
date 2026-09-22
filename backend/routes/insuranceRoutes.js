const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const { validateInsuranceSimulation, validateInsuranceComparison } = require('../middleware/validation');

router.get('/', insuranceController.getInsurancePlans);
router.post('/simulate', validateInsuranceSimulation, insuranceController.simulateInsurancePlan);
router.post('/compare', validateInsuranceComparison, insuranceController.compareInsurancePlans);

module.exports = router;
