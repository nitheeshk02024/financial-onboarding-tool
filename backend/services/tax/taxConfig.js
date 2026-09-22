module.exports = {
    SUPPORTED_COUNTRIES: {
        INDIA: 'India',
        USA: 'United States',
        UK: 'United Kingdom',
        CANADA: 'Canada',
        GERMANY: 'Germany'
    },
    COUNTRY_ALIASES: {
        'india': 'India',
        'in': 'India',
        'usa': 'United States',
        'us': 'United States',
        'united states': 'United States',
        'united states of america': 'United States',
        'uk': 'United Kingdom',
        'united kingdom': 'United Kingdom',
        'gb': 'United Kingdom',
        'great britain': 'United Kingdom',
        'canada': 'Canada',
        'ca': 'Canada',
        'germany': 'Germany',
        'de': 'Germany'
    },
    INDIA_TAX_CONFIG: {
        currency: 'INR',
        taxYear: 'AY 2026-27',
        regime: 'New Tax Regime',
        standardDeduction: 75000,
        section87ARebateMaxIncome: 1200000,
        cessRate: 0.04,
        slabs: [
            { min: 0, max: 400000, rate: 0.00 },
            { min: 400000, max: 800000, rate: 0.05 },
            { min: 800000, max: 1200000, rate: 0.10 },
            { min: 1200000, max: 1600000, rate: 0.15 },
            { min: 1600000, max: 2000000, rate: 0.20 },
            { min: 2000000, max: 2400000, rate: 0.25 },
            { min: 2400000, max: Infinity, rate: 0.30 }
        ],
        assumptions: [
            "Salaried employee standard deduction (₹75,000)",
            "New Tax Regime (AY 2026-27)",
            "Section 87A rebate & 4% Health and Education Cess"
        ],
        disclaimer: "Estimated calculation based on published tax rules. Actual tax may vary based on individual circumstances."
    },
    USA_TAX_CONFIG: {
        currency: 'USD',
        taxYear: '2026',
        filingStatus: 'Single',
        standardDeduction: 15000,
        slabs: [
            { min: 0, max: 11925, rate: 0.10 },
            { min: 11925, max: 48475, rate: 0.12 },
            { min: 48475, max: 103350, rate: 0.22 },
            { min: 103350, max: 197300, rate: 0.24 },
            { min: 197300, max: 250525, rate: 0.32 },
            { min: 250525, max: 626350, rate: 0.35 },
            { min: 626350, max: Infinity, rate: 0.37 }
        ],
        assumptions: [
            "Single filing status",
            "IRS 2026 Standard Deduction ($15,000)",
            "Federal individual income tax estimate only"
        ],
        disclaimer: "Estimated calculation based on published tax rules. Actual tax may vary based on individual circumstances."
    },
    UK_TAX_CONFIG: {
        currency: 'GBP',
        taxYear: '2026-27',
        region: 'England/Wales/Northern Ireland',
        personalAllowance: 12570,
        taperThreshold: 100000,
        slabs: [
            { min: 0, max: 37700, rate: 0.20 },
            { min: 37700, max: 112570, rate: 0.40 },
            { min: 112570, max: Infinity, rate: 0.45 }
        ],
        assumptions: [
            "Standard Personal Allowance (£12,570) with tapering above £100,000",
            "England / Wales / Northern Ireland tax bands",
            "Income tax estimate (excludes National Insurance Contributions)"
        ],
        disclaimer: "Estimated calculation based on published tax rules. Actual tax may vary based on individual circumstances."
    },
    CANADA_TAX_CONFIG: {
        currency: 'CAD',
        taxYear: '2026',
        taxScope: 'Federal income tax only',
        province: null,
        basicPersonalAmount: 15705,
        bpaCreditRate: 0.15,
        slabs: [
            { min: 0, max: 57375, rate: 0.15 },
            { min: 57375, max: 114750, rate: 0.205 },
            { min: 114750, max: 177882, rate: 0.26 },
            { min: 177882, max: 253414, rate: 0.29 },
            { min: 253414, max: Infinity, rate: 0.33 }
        ],
        assumptions: [
            "Federal income tax only (provincial/territorial taxes not included)",
            "Federal Basic Personal Amount ($15,705) non-refundable tax credit applied",
            "Individual income tax estimate"
        ],
        disclaimer: "Estimated calculation based on published tax rules. Actual tax may vary based on individual circumstances."
    },
    GERMANY_TAX_CONFIG: {
        currency: 'EUR',
        taxYear: '2026',
        grundfreibetrag: 12096,
        assumptions: [
            "Official BMF 2026 progressive tariff formula (Einkommensteuertarif 2026)",
            "Grundfreibetrag (€12,096) applied",
            "Single tax class (Steuerklasse I)",
            "Excludes social security contributions (Sozialabgaben) and church tax (Kirchensteuer)"
        ],
        disclaimer: "Estimated calculation based on published tax rules. Actual tax may vary based on individual circumstances."
    }
};
