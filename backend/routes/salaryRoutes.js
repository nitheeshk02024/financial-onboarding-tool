const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { validateSalaryInput } = require('../middleware/validation');

router.get('/', salaryController.getSalaries);

module.exports = router;
