const insuranceService = require('../services/insuranceService');

exports.getInsurancePlans = async (req, res) => {
    try {
        const plans = await insuranceService.getAllInsurancePlans();
        res.json({ status: 'success', data: plans });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};

exports.simulateInsurancePlan = async (req, res) => {
    try {
        const { plan, estimatedMedicalExpenses, scenario } = req.body;
        const result = insuranceService.simulateInsurancePlan({ plan, estimatedMedicalExpenses, scenario });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'An internal server error occurred while simulating insurance plan.'
        });
    }
};

exports.compareInsurancePlans = async (req, res) => {
    try {
        const { plans, estimatedMedicalExpenses, scenario } = req.body;
        const result = insuranceService.compareInsurancePlans({ plans, estimatedMedicalExpenses, scenario });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'An internal server error occurred while comparing insurance plans.'
        });
    }
};
