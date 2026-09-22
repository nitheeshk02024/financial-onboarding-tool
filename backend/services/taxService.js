const taxConfig = require('./tax/taxConfig');
const { calculateIndiaTax } = require('./tax/indiaTax');
const { calculateUsaTax } = require('./tax/usaTax');
const { calculateUkTax } = require('./tax/ukTax');
const { calculateCanadaTax } = require('./tax/canadaTax');
const { calculateGermanyTax } = require('./tax/germanyTax');

/**
 * Main tax service dispatcher for multi-country calculations.
 * @param {object} param0
 * @param {number} param0.annualSalary
 * @param {string} param0.country
 * @returns {object} calculation result
 */
exports.calculateTax = async ({ annualSalary, country }) => {
    if (!country || typeof country !== 'string') {
        return {
            success: false,
            message: "Tax calculation for this country is not yet implemented."
        };
    }

    const normalizedCountry = country.trim().toLowerCase();
    const resolvedCountry = taxConfig.COUNTRY_ALIASES[normalizedCountry];

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.INDIA) {
        const data = calculateIndiaTax(annualSalary);
        return {
            success: true,
            data
        };
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.USA) {
        return calculateUsaTax();
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.UK) {
        return calculateUkTax();
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.CANADA) {
        return calculateCanadaTax();
    }

    if (resolvedCountry === taxConfig.SUPPORTED_COUNTRIES.GERMANY) {
        return calculateGermanyTax();
    }

    return {
        success: false,
        message: "Tax calculation for this country is not yet implemented."
    };
};
