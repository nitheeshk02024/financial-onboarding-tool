const { UK_TAX_CONFIG, SUPPORTED_COUNTRIES } = require('./taxConfig');

/**
 * Calculates progressive individual income tax for the UK (HMRC Tax Year 2026-27, England/Wales/NI).
 * @param {number} annualSalary - Gross annual income in GBP
 * @returns {object} Calculated UK tax details
 */
exports.calculateUkTax = (annualSalary) => {
    const config = UK_TAX_CONFIG;
    
    // Personal Allowance Tapering: £1 reduced for every £2 of income above £100,000
    let personalAllowance = config.personalAllowance;
    if (annualSalary > config.taperThreshold) {
        const excess = annualSalary - config.taperThreshold;
        const reduction = Math.floor(excess / 2);
        personalAllowance = Math.max(0, personalAllowance - reduction);
    }
    
    // Taxable income after personal allowance
    const taxableIncome = Math.max(0, annualSalary - personalAllowance);
    
    // Progressive slab calculation on taxable income
    let estimatedTax = 0;
    for (const slab of config.slabs) {
        if (taxableIncome > slab.min) {
            const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
            estimatedTax += taxableInSlab * slab.rate;
        }
    }
    
    estimatedTax = Math.round(estimatedTax);
    const effectiveTaxRate = Number(((estimatedTax / annualSalary) * 100).toFixed(2));
    const estimatedAnnualNetAfterTax = annualSalary - estimatedTax;
    
    return {
        country: SUPPORTED_COUNTRIES.UK,
        currency: config.currency,
        annualSalary,
        estimatedTax,
        effectiveTaxRate,
        estimatedAnnualNetAfterTax,
        taxYear: config.taxYear,
        region: config.region,
        assumptions: config.assumptions,
        disclaimer: config.disclaimer
    };
};
