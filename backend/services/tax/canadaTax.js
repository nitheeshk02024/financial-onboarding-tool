const { CANADA_TAX_CONFIG, SUPPORTED_COUNTRIES } = require('./taxConfig');

/**
 * Calculates progressive federal individual income tax for Canada (CRA Tax Year 2026, Federal Only).
 * @param {number} annualSalary - Gross annual income in CAD
 * @returns {object} Calculated Canada tax details
 */
exports.calculateCanadaTax = (annualSalary) => {
    const config = CANADA_TAX_CONFIG;
    
    // Progressive slab calculation on total income
    let rawTax = 0;
    for (const slab of config.slabs) {
        if (annualSalary > slab.min) {
            const taxableInSlab = Math.min(annualSalary, slab.max) - slab.min;
            rawTax += taxableInSlab * slab.rate;
        }
    }
    
    // Non-refundable Basic Personal Amount (BPA) tax credit
    const bpaCredit = config.basicPersonalAmount * config.bpaCreditRate;
    
    const estimatedTax = Math.round(Math.max(0, rawTax - bpaCredit));
    const effectiveTaxRate = Number(((estimatedTax / annualSalary) * 100).toFixed(2));
    const estimatedAnnualNetAfterTax = annualSalary - estimatedTax;
    
    return {
        country: SUPPORTED_COUNTRIES.CANADA,
        currency: config.currency,
        annualSalary,
        estimatedTax,
        effectiveTaxRate,
        estimatedAnnualNetAfterTax,
        taxYear: config.taxYear,
        taxScope: config.taxScope,
        province: config.province,
        assumptions: config.assumptions,
        disclaimer: config.disclaimer
    };
};
