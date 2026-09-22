exports.validateSalaryInput = (req, res, next) => {
    const { annualCtc } = req.body;
    if (annualCtc !== undefined && (typeof annualCtc !== 'number' || annualCtc < 0)) {
        return res.status(400).json({ status: 'error', message: 'annualCtc must be a positive number' });
    }
    next();
};

exports.validateInsuranceInput = (req, res, next) => {
    const { monthlyPremium, copayPercent } = req.body;
    if (monthlyPremium !== undefined && monthlyPremium < 0) {
        return res.status(400).json({ status: 'error', message: 'monthlyPremium must be >= 0' });
    }
    if (copayPercent !== undefined && (copayPercent < 0 || copayPercent > 100)) {
        return res.status(400).json({ status: 'error', message: 'copayPercent must be between 0 and 100' });
    }
    next();
};
