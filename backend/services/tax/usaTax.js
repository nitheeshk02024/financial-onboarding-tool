const { USA_TAX_CONFIG, SUPPORTED_COUNTRIES } = require('./taxConfig');

/**
 * Calculates progressive federal individual income tax for the USA (Tax Year 2026, Single Filing Status).
 * @param {number} annualSalary - Gross annual income in USD
 * @returns {object} Calculated USA tax details
 */
exports.calculateUsaTax = (annualSalary) => {
    const config = USA_TAX_CONFIG;
    
    // Taxable income after Standard Deduction
    const taxableIncome = Math.max(0, annualSalary - config.standardDeduction);
    
    // Progressive slab calculation
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
        country: SUPPORTED_COUNTRIES.USA,
        currency: config.currency,
        annualSalary,
        estimatedTax,
        effectiveTaxRate,
        estimatedAnnualNetAfterTax,
        taxYear: config.taxYear,
        filingStatus: config.filingStatus,
        assumptions: config.assumptions,
        disclaimer: config.disclaimer
    };
};
