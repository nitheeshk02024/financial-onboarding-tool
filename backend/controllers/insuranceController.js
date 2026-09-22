const insuranceService = require('../services/insuranceService');

exports.getInsurancePlans = async (req, res) => {
    try {
        const plans = await insuranceService.getAllInsurancePlans();
        res.json({ status: 'success', data: plans });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
