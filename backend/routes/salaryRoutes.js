const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { validateSalaryCalculation } = require('../middleware/validation');

router.get('/', salaryController.getSalaries);
router.post('/calculate', validateSalaryCalculation, salaryController.calculateSalary);

module.exports = router;
