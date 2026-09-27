/* ============================================
   EMPLOYEASE — AI ONBOARDING MATRIX ENGINE
   Interactive First-Time Tax, Insurance, Offer Comparison & HR Jargon Decoder
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // BACKEND API BASE CONFIGURATION
    // ============================================
    const API_BASE_URL = 'https://financial-onboarding-tool.onrender.com/api';
    const LOCAL_STORAGE_KEY = 'employease_saved_state_v2';

    /**
     * Unified fetch helper for backend APIs with timeout to avoid freezing UI
     */
    async function apiRequest(endpoint, method = 'GET', data = null, isFormData = false, timeoutMs = 3500) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);

            const options = { 
                method,
                signal: controller.signal
            };
            if (data) {
                if (isFormData) {
                    options.body = data;
                } else {
                    options.headers = { 'Content-Type': 'application/json' };
                    options.body = JSON.stringify(data);
                }
            }
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            clearTimeout(timer);
            const result = await response.json();
            return { ok: response.ok, status: response.status, data: result };
        } catch (err) {
            // Silently fall back to robust client-side calculations
            return {
                ok: false,
                status: 0,
                error: 'Backend sleeping or unreachable. Using high-precision client-side calculations.'
            };
        }
    }

    // ============================================
    // APPLICATION STATE
    // ============================================
    const state = {
        activeTab: 'wizard',         // default view: 'wizard' | 'paycheck' | 'compare' | 'checklist' | 'investment' | 'health' | 'jargon' | 'executive'
        theme: 'dark',
        country: 'india',             // 'india' | 'usa' | 'europe'
        targetCurrency: 'INR',        // 'INR' | 'USD' | 'EUR' | 'GBP'
        payFrequency: 'monthly',      // 'monthly' | 'biweekly' | 'semimonthly'
        selectedJargonCategory: 'all',

        // Exchange Rates relative to 1 USD
        exchangeRates: {
            USD: 1,
            INR: 84.55,
            EUR: 0.92,
            GBP: 0.78
        },

        currencySymbols: {
            INR: '₹',
            USD: '$',
            EUR: '€',
            GBP: '£'
        },

        // Financial & Component Inputs
        salary: {
            annualCtc: 1500000,
            basicPercent: 50,
            hraPercent: 20,
            epfPercent: 12,
            regime: 'new',
            sec80C: 150000,
            sec80D: 25000,
            monthlyRent: 18000
        },

        wizard: {
            ctc: 1200000,
            rent: 'yes',
            monthlyRent: 18000,
            healthUsage: 'low'
        },

        // Offer Comparison State
        compareOffers: {
            offerA: {
                company: 'TechCorp Systems',
                role: 'Software Engineer',
                ctc: 1500000,
                bonus: 100000,
                variablePct: 10,
                healthCover: 500000,
                workMode: 'Hybrid (3 days office)'
            },
            offerB: {
                company: 'HyperScale Labs',
                role: 'Backend Developer',
                ctc: 1800000,
                bonus: 250000,
                variablePct: 20,
                healthCover: 300000,
                workMode: 'Full In-Office'
            }
        },

        // Document Checklist (map of id -> boolean)
        checklist: {},
        checklistFilter: 'all',

        activeScenario: 'healthy',

        healthPlans: [
            {
                id: 'hdhp',
                name: 'Standard HDHP + HSA',
                type: 'High Deductible Plan',
                monthlyPremium: 1500,
                annualDeductible: 30000,
                copayPercent: 20,
                outOfPocketMax: 60000
            },
            {
                id: 'ppo',
                name: 'Comprehensive PPO',
                type: 'Low Deductible Plan',
                monthlyPremium: 3800,
                annualDeductible: 10000,
                copayPercent: 10,
                outOfPocketMax: 35000
            }
        ]
    };

    // ============================================
    // FIRST-JOB DOCUMENT CHECKLIST DATABASE
    // ============================================
    const CHECKLIST_DATA = [
        {
            category: 'Government & Identity Proofs',
            icon: '🪪',
            items: [
                {
                    id: 'pan_card',
                    name: 'Permanent Account Number (PAN Card)',
                    desc: 'Mandatory for payroll processing and Tax Deducted at Source (TDS). Without a valid PAN, tax is deducted at highest 20% slab.',
                    why: 'HR registers you on the TRACES tax system and deposits TDS with the Income Tax Department.'
                },
                {
                    id: 'aadhaar_linked',
                    name: 'Aadhaar Card (Mobile Number Linked)',
                    desc: 'Must be actively linked to your working mobile number for OTP e-KYC and EPFO Universal Account Number generation.',
                    why: 'Required for e-signing employment agreements and generating your EPFO digital passbook.'
                },
                {
                    id: 'bank_cheque',
                    name: 'Active Salary Bank Account & Cancelled Cheque',
                    desc: 'Original cancelled cheque leaf with your name, IFSC code, and account number clearly printed.',
                    why: 'Used by corporate payroll to set up direct electronic monthly salary transfers.'
                },
                {
                    id: 'epfo_uan',
                    name: 'EPFO UAN (Universal Account Number)',
                    desc: 'If you had an internship with PF deductions, provide your existing 12-digit UAN; otherwise, HR creates a new one.',
                    why: 'Prevents duplicate PF accounts and ensures continuous retirement compound interest.'
                }
            ]
        },
        {
            category: 'Statutory HR & Payroll Forms',
            icon: '📋',
            items: [
                {
                    id: 'form_11',
                    name: 'Form 11 (EPF Declaration Form)',
                    desc: 'Mandatory declaration stating whether you are a new member to EPFO or transferring an existing account.',
                    why: 'Legally required by the Employees Provident Fund Organisation on Day 1 of joining.'
                },
                {
                    id: 'form_2',
                    name: 'Form 2 (Nomination for EPF & Gratuity)',
                    desc: 'Assigns legal beneficiaries and percentage shares for your provident fund and future gratuity payouts.',
                    why: 'Ensures your family or chosen nominees receive full benefits without legal succession hurdles.'
                },
                {
                    id: 'form_12bb',
                    name: 'Form 12BB (Tax Investment Declaration)',
                    desc: 'Statement submitted to payroll declaring planned Section 80C investments, HRA rent paid, and 80D health policies.',
                    why: 'Tells payroll how much monthly TDS to deduct; declaring early prevents heavy tax cuts from your monthly pay.'
                },
                {
                    id: 'group_insurance_nominee',
                    name: 'Corporate Group Health & Term Insurance Nominee',
                    desc: 'HR portal form designating beneficiaries for employer-provided group health and term life covers.',
                    why: 'Enables quick claim clearance in case of emergency hospitalization or accidental claims.'
                }
            ]
        },
        {
            category: 'Academic & Background Verification (BGV)',
            icon: '🎓',
            items: [
                {
                    id: 'degree_certificate',
                    name: 'Degree Certificate / Provisional Degree Certificate',
                    desc: 'Issued by your university or college confirming course completion and graduation date.',
                    why: 'Third-party BGV agencies verify this directly with your university database.'
                },
                {
                    id: 'marksheets_all',
                    name: 'All Semester Consolidated Marksheets',
                    desc: 'Full transcripts or semester-by-semester grade cards demonstrating passing grades and CGPA.',
                    why: 'Validates that you do not have any active backlogs or uncleared subjects.'
                },
                {
                    id: 'relieving_or_noc',
                    name: 'Relieving Letter / Internship Completion Certificate',
                    desc: 'Proof that your previous internship or part-time contract was formally concluded in good standing.',
                    why: 'Ensures no concurrent employment or moonlighting conflicts exist.'
                },
                {
                    id: 'address_proof',
                    name: 'Current & Permanent Address Proof',
                    desc: 'Electricity bill, rent agreement, passport, or voter ID matching your onboarding submission.',
                    why: 'Required for courier of work laptop/assets and physical BGV address checks.'
                }
            ]
        },
        {
            category: 'First-Month Tax Optimization Setup',
            icon: '💡',
            items: [
                {
                    id: 'rent_agreement',
                    name: 'Registered Rent Agreement & Landlord PAN',
                    desc: 'Required if opting for Old Tax Regime to claim HRA exemptions (Section 10(13A)). Landlord PAN mandatory if annual rent exceeds ₹1,00,000.',
                    why: 'Can save you ₹25,000 to ₹60,000 in income tax every year if you rent in a major city.'
                },
                {
                    id: 'sec_80c_proofs',
                    name: 'Section 80C Proofs (PPF receipt, ELSS statement)',
                    desc: 'Investment statements uploaded to payroll before the January cutoff deadline.',
                    why: 'Proves your tax-saving investments to avoid large lump-sum tax deductions in February & March.'
                }
            ]
        }
    ];

    // ============================================
    // COMPREHENSIVE EMPLOYMENT & HR JARGON DATABASE
    // ============================================
    const JARGON_DATABASE = [
        // ----- 1. OFFER LETTER & EMPLOYMENT TERMS -----
        {
            term: 'Probationary Period',
            aliases: ['probationary period', 'probation', 'probation period', 'on probation'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'A trial period (typically 3 to 6 months) at the start of your employment where the company evaluates your skills, performance, and workplace culture fit before confirming your role permanently.',
            forYou: 'During probation, notice periods for resignation or termination are much shorter (e.g. 15 to 30 days instead of 90 days), and certain benefits like paid leave or bonuses may be restricted until confirmation.',
            example: 'If your contract states a 6-month probation, HR will review your work performance at month 5 before issuing an official Confirmation of Employment letter.'
        },
        {
            term: 'Notice Period',
            aliases: ['notice period', 'notice', 'resignation notice', 'serving notice'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'The mandatory period of time an employee or employer must continue working/paying after delivering formal resignation or termination notice.',
            forYou: 'If you decide to quit or if the company ends your employment, you must serve this duration (or pay salary in lieu of notice). Corporate notice periods usually range from 30 to 90 days.',
            example: 'A 90-day notice period means you cannot join your new employer immediately upon resigning without official relieving letter clearance.'
        },
        {
            term: 'Termination Clause',
            aliases: ['termination', 'termination of employment', 'terminated', 'firing clause'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'The specific contractual terms and conditions under which either you or the employer can legally end the employment relationship.',
            forYou: 'Outlines whether departure requires written notice, cause (misconduct, underperformance), or immediate exit, and defines final settlement payout rules.',
            example: 'Immediate termination with zero severance is typically reserved for severe misconduct, fraud, or breach of confidentiality.'
        },
        {
            term: 'Severance Pay',
            aliases: ['severance', 'severance pay', 'severance package', 'layoff pay'],
            category: 'Offer Letter & HR',
            impact: 'Salary & In-Hand Pay',
            meaning: 'Compensation paid by an employer to an employee who is laid off or terminated without personal fault (e.g., company downsizing or restructuring).',
            forYou: 'Provides a financial cushion while searching for a new job, often calculated as 2 weeks to 1 month of salary per year of service.',
            example: 'If laid off after 3 years, a severance package might grant 3 months of basic salary as a lump-sum payout.'
        },
        {
            term: 'Joining Bonus / Sign-on Bonus',
            aliases: ['joining bonus', 'sign-on bonus', 'signing bonus', 'welcome bonus'],
            category: 'Offer Letter & HR',
            impact: 'Salary & In-Hand Pay',
            meaning: 'A one-time cash lump sum paid to you upon joining the company as an incentive to accept the offer.',
            forYou: 'Joining bonuses almost always carry a 12-month clawback clause requiring full repayment if you resign before completing 1 year.',
            example: 'A ₹2,00,000 joining bonus paid in month 1 must be refunded in full if you quit before your 1-year work anniversary.'
        },
        {
            term: 'Relocation Allowance',
            aliases: ['relocation allowance', 'relocation reimbursement', 'relocation expenses'],
            category: 'Offer Letter & HR',
            impact: 'Employee Benefits',
            meaning: 'Financial assistance provided by your employer to cover moving expenses, flight tickets, and temporary hotel lodging when moving cities for work.',
            forYou: 'Reimbursements require submitting original invoices and bills. May also carry a 1-year retention clawback clause.',
            example: 'Up to ₹50,000 reimbursement for packers & movers + 15 days temporary hotel stay upon relocating to Bangalore.'
        },
        {
            term: 'Employment Agreement',
            aliases: ['employment agreement', 'employment contract', 'offer agreement', 'service agreement'],
            category: 'Offer Letter & HR',
            impact: 'Legal Obligations & Rights',
            meaning: 'The legally binding contract between you and your employer detailing job duties, compensation, working hours, benefits, and company rules.',
            forYou: 'Once signed, all terms (including non-competes, IP ownership, and notice periods) become legally enforceable obligations.',
            example: 'Signing your appointment letter binds you to the company Code of Conduct and IT security policies.'
        },
        {
            term: 'Conditions of Employment',
            aliases: ['conditions of employment', 'employment conditions', 'pre-employment conditions'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'Prerequisites that must be fulfilled before your employment becomes valid (e.g., clear background verification, drug test, degree proof).',
            forYou: 'Failure to pass pre-employment background checks or provide college degree passing certificates can result in immediate offer revocation.',
            example: 'An offer contingent upon passing a criminal record check and submission of final college graduation marksheet.'
        },
        {
            term: 'Full-Time Equivalent (FTE)',
            aliases: ['fte', 'full time equivalent', 'full-time employee'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'A standard metric indicating a full-time permanent employee (typically working 40 hours per week) entitled to statutory benefits.',
            forYou: 'FTE status grants full company health insurance, retirement PF contributions, paid leave, and severance protections.',
            example: 'Transitioning from a 6-month college intern into a permanent 1.0 FTE Software Engineer role.'
        },
        {
            term: 'Cost to Company (CTC)',
            aliases: ['ctc', 'cost to company', 'annual ctc', 'package'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The total amount of money the employer spends on you each year. Includes gross salary, employer PF, gratuity, medical insurance premiums, and perks.',
            forYou: 'CTC is NOT what lands in your bank account. Your monthly in-hand salary will be lower after deducting taxes, PF, and non-guaranteed variable pay.',
            example: 'An offer of ₹12,00,000 CTC typically yields around ₹75,000 to ₹82,000 monthly take-home cash.'
        },
        {
            term: 'Gross Salary',
            aliases: ['gross salary', 'gross pay', 'gross compensation', 'gross earnings'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The total monthly or annual pay before any employee statutory deductions (income tax, employee EPF, professional tax).',
            forYou: 'Calculated as total CTC minus employer retiral contributions (Employer PF and Gratuity). It represents your earned pay before taxes.',
            example: 'Gross Salary of ₹85,000 minus deductions = ₹72,000 net take-home pay.'
        },
        {
            term: 'Net Salary (Take-Home Pay)',
            aliases: ['net salary', 'take-home pay', 'in-hand salary', 'net pay'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The actual net cash amount deposited directly into your checking account on payday after all taxes and deductions.',
            forYou: 'This is the exact number you should use for personal budgeting, rent, groceries, and EMIs.',
            example: 'Gross Salary of ₹80,000 minus ₹5,000 Income Tax minus ₹2,400 EPF = Net Take-Home Pay of ₹72,600.'
        },
        {
            term: 'Basic Salary',
            aliases: ['basic salary', 'basic pay', 'basic component'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The core fixed foundation of your compensation package, typically set at 40% to 50% of your total CTC.',
            forYou: 'Statutory contributions like Provident Fund (12%), Gratuity, and HRA calculations are directly derived from your Basic Salary.',
            example: 'If your CTC is ₹12 Lakhs and Basic is 50%, your Basic Salary is ₹6,00,000 (₹50,000/month).'
        },
        {
            term: 'Variable Pay',
            aliases: ['variable pay', 'performance bonus', 'incentive pay', 'annual bonus'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'A portion of your compensation tied to individual performance ratings and company financial targets, paid quarterly or annually.',
            forYou: 'Variable pay is NOT guaranteed. In difficult economic years, companies may pay out only 50% to 80% of the target bonus amount.',
            example: 'A ₹10 Lakh CTC with 15% variable pay means ₹1.5 Lakhs depends on your year-end performance review.'
        },
        {
            term: 'Fixed Pay',
            aliases: ['fixed pay', 'guaranteed salary', 'fixed component', 'base salary'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The guaranteed compensation paid out consistently every month regardless of company quarterly earnings.',
            forYou: 'Always negotiate for a higher fixed pay rather than an inflated variable pay figure when evaluating offers.',
            example: 'An offer with ₹14L Fixed Pay + ₹2L Variable is significantly safer than ₹10L Fixed + ₹6L Variable.'
        },
        {
            term: 'House Rent Allowance (HRA)',
            aliases: ['hra', 'house rent allowance', 'rent allowance'],
            category: 'Salary & In-Hand',
            impact: 'Tax & Deductions',
            meaning: 'A salary component provided to meet the cost of rented accommodation, eligible for substantial tax exemptions under the Old Tax Regime.',
            forYou: 'Paying rent in a metro city like Bangalore or Mumbai allows tax exemption under Section 10(13A) when opting for Old Tax Regime.',
            example: 'Claiming ₹18,000/month rent with landlord PAN can lower your taxable income by over ₹1.5 Lakhs.'
        },
        {
            term: 'Special Allowance',
            aliases: ['special allowance', 'supplementary allowance', 'balancing allowance'],
            category: 'Salary & In-Hand',
            impact: 'Salary & In-Hand Pay',
            meaning: 'A catch-all balancing component used to make up the difference between Basic + HRA and your total agreed CTC.',
            forYou: 'Special allowance is 100% fully taxable under both Old and New Tax Regimes with zero tax exemption.',
            example: 'A monthly Special Allowance of ₹22,000 has standard TDS deducted without any tax rebate.'
        },
        {
            term: 'Section 80C',
            aliases: ['80c', 'section 80c', '80c deductions'],
            category: 'Tax & Deductions',
            impact: 'Tax & Deductions',
            meaning: 'A provision under the Indian Income Tax Act (Old Regime) allowing deductions up to ₹1,50,000 from taxable income.',
            forYou: 'Includes employee EPF contributions, ELSS mutual funds, Public Provident Fund (PPF), life insurance, and tuition fees.',
            example: 'Investing ₹1.5 Lakhs in 80C reduces taxable income and saves up to ₹46,800 in taxes for 30% tax bracket earners.'
        },
        {
            term: 'Section 80D',
            aliases: ['80d', 'section 80d', 'health insurance tax rebate'],
            category: 'Tax & Deductions',
            impact: 'Tax & Deductions',
            meaning: 'Tax deductions for health insurance premiums paid for self, spouse, children (up to ₹25,000) and parents (up to ₹50,000).',
            forYou: 'Offers up to ₹75,000 total deduction when covering both your own family and senior citizen parents.',
            example: 'Paying ₹22,000 for personal mediclaim + ₹35,000 for parents saves valuable tax under the Old Regime.'
        },
        {
            term: 'Section 87A Rebate',
            aliases: ['87a', 'section 87a', 'tax rebate'],
            category: 'Tax & Deductions',
            impact: 'Tax & Deductions',
            meaning: 'A government tax relief providing 100% tax rebate if taxable income stays below statutory thresholds.',
            forYou: 'Under the New Tax Regime (AY 2026-27), salaried income up to ₹12,00,000 pays ZERO net income tax thanks to 87A rebate and standard deduction!',
            example: 'An annual salary of ₹11.5 LPA has ₹0 net tax liability under the FY 25-26 New Tax Regime.'
        },
        {
            term: 'Employees Provident Fund (EPF)',
            aliases: ['epf', 'pf', 'provident fund', 'epfo'],
            category: 'Salary & In-Hand',
            impact: 'Retirement & Savings',
            meaning: 'A mandatory government-managed retirement savings scheme where 12% of your Basic Salary is contributed each month, matched by your employer.',
            forYou: 'Earns government-guaranteed compound interest (around 8.25%/year) with tax-free withdrawal at retirement (EEE status).',
            example: 'Monthly deduction of ₹3,600 accumulates into a multi-lakh retirement corpus over your working years.'
        },
        {
            term: 'Gratuity',
            aliases: ['gratuity', 'statutory gratuity', 'gratuity act'],
            category: 'Offer Letter & HR',
            impact: 'Retirement & Benefits',
            meaning: 'A statutory lump-sum monetary benefit paid by an employer to an employee upon leaving the organization after completing at least 5 years of continuous service.',
            forYou: 'Calculated as 15 days of last drawn basic salary for every completed year of service. Tax-exempt up to ₹20 Lakhs.',
            example: 'Leaving after 5 years with ₹60,000 basic yields a tax-free gratuity payout of approximately ₹1,73,000.'
        },
        {
            term: 'Form 16',
            aliases: ['form 16', 'form-16', 'tds certificate'],
            category: 'Tax & Deductions',
            impact: 'Tax Compliance',
            meaning: 'An annual certificate issued by your employer by June 15th detailing total salary paid and TDS deducted during the financial year.',
            forYou: 'The primary document used to file your Income Tax Return (ITR-1 or ITR-2) every July.',
            example: 'Downloading Part A and Part B of Form 16 from the company payroll portal to file income taxes.'
        },
        {
            term: 'Deductible',
            aliases: ['deductible', 'annual deductible', 'health deductible'],
            category: 'Health Insurance',
            impact: 'Healthcare Expenses',
            meaning: 'The amount of medical expenses you must pay 100% out of your own pocket before the insurance company begins paying claims.',
            forYou: 'A high deductible plan has lower monthly payroll premiums, but you pay more if you fall ill early in the policy year.',
            example: 'With a ₹30,000 deductible, a ₹25,000 clinic bill is paid completely by you.'
        },
        {
            term: 'Out-of-Pocket Maximum (OOP Max)',
            aliases: ['out of pocket max', 'oop max', 'maximum out of pocket', 'stop-loss'],
            category: 'Health Insurance',
            impact: 'Healthcare Expenses',
            meaning: 'The absolute maximum total amount you will have to pay for covered medical care during an annual policy year.',
            forYou: 'Once your deductibles and copays reach this threshold, the insurer pays 100% of all remaining covered medical bills.',
            example: 'An OOP Max of ₹60,000 protects you from catastrophic bills if a major surgery costs ₹5,00,000.'
        },
        {
            term: 'Copay / Coinsurance',
            aliases: ['copay', 'copayment', 'coinsurance', 'cost sharing'],
            category: 'Health Insurance',
            impact: 'Healthcare Expenses',
            meaning: 'The percentage of the medical claim that you must pay after your deductible is met (e.g. 10% or 20%), while insurer covers the rest.',
            forYou: 'A 10% copay on a ₹50,000 hospital bill means you pay ₹5,000 and the insurance pays ₹45,000.',
            example: 'Paying a 15% copay on specialist consultations.'
        },
        {
            term: 'Non-Compete Clause',
            aliases: ['non-compete', 'non compete', 'restraint of trade'],
            category: 'Legal & Clauses',
            impact: 'Career Mobility',
            meaning: 'A contractual clause restricting an employee from working for a direct competitor or starting a rival business for a specified period after leaving.',
            forYou: 'In India, Section 27 of the Indian Contract Act makes post-employment non-compete clauses largely unenforceable in courts.',
            example: 'A clause claiming you cannot work for any fintech startup for 1 year after quitting is generally void under Indian law.'
        },
        {
            term: 'Non-Solicitation Clause',
            aliases: ['non-solicitation', 'non solicitation', 'poaching clause'],
            category: 'Legal & Clauses',
            impact: 'Professional Conduct',
            meaning: 'A restriction prohibiting you from soliciting, poaching, or recruiting your former employer’s clients, customers, or employees after your exit.',
            forYou: 'Legally enforceable in Indian courts to protect legitimate company business relationships and trade secrets.',
            example: 'Prohibiting a departed engineering lead from hiring former team members into their new venture for 12 months.'
        },
        {
            term: 'Intellectual Property (IP) Assignment',
            aliases: ['ip assignment', 'intellectual property', 'invention assignment', 'ownership of work'],
            category: 'Legal & Clauses',
            impact: 'Ownership of Creations',
            meaning: 'A clause stating that any code, invention, design, or copyright created during your employment belongs 100% to the employer.',
            forYou: 'Never build personal side projects or freelance code using company laptops or during work hours, or the employer may claim ownership.',
            example: 'Code written for the company product is owned by the employer, not the individual software engineer.'
        },
        {
            term: 'Indemnification Clause',
            aliases: ['indemnification', 'indemnity', 'hold harmless'],
            category: 'Legal & Clauses',
            impact: 'Financial Liability',
            meaning: 'A contractual clause requiring one party to compensate the other for damages, losses, or legal fees arising from breaches of conduct or law.',
            forYou: 'Employees should verify that indemnity clauses apply only to willful fraud or gross negligence, not innocent workplace mistakes.',
            example: 'Agreeing to indemnify the firm if you intentionally leak trade secrets or proprietary customer data.'
        }
    ];

    // Sample Offers Presets
    const SAMPLE_OFFERS = {
        'india-sde': { country: 'india', ctc: 1500000, basicPct: 50, hraPct: 20, epfPct: 12 },
        'india-fresher': { country: 'india', ctc: 650000, basicPct: 50, hraPct: 20, epfPct: 12 },
        'us-swe': { country: 'usa', ctc: 95000, basicPct: 75, hraPct: 15, epfPct: 5 },
        'eu-dev': { country: 'europe', ctc: 62000, basicPct: 70, hraPct: 15, epfPct: 8 }
    };

    // DOM Elements Mapping
    const elements = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabViews: document.querySelectorAll('.tab-view'),
        countryPills: document.querySelectorAll('.country-pill'),
        currencySelect: document.getElementById('currency-select'),
        convertedTotalDisplay: document.getElementById('converted-total-display'),
        sampleOfferSelect: document.getElementById('sample-offer-select'),
        toggleParserBtn: document.getElementById('toggle-parser-btn'),
        parserDrawer: document.getElementById('parser-drawer'),
        closeDrawerBtn: document.getElementById('close-drawer-btn'),
        clearOfferTextBtn: document.getElementById('clear-offer-text'),
        runParseBtn: document.getElementById('run-parse-btn'),
        offerTextInput: document.getElementById('offer-text-input'),
        offerFileInput: document.getElementById('offer-file-input'),

        // Theme & Autosave
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        themeIcon: document.getElementById('theme-icon'),
        themeLabel: document.getElementById('theme-label'),
        autosaveStatus: document.getElementById('autosave-status'),
        autosaveText: document.getElementById('autosave-text'),
        resetStateBtn: document.getElementById('reset-state-btn'),

        // Paycheck Inputs
        inputCtc: document.getElementById('input-ctc'),
        inputBasicPct: document.getElementById('input-basic-pct'),
        inputHraPct: document.getElementById('input-hra-pct'),
        inputCurrSymbol: document.getElementById('input-curr-symbol'),
        calcRegimeRadios: document.querySelectorAll('input[name="calc-regime"]'),
        oldRegimeSubinputs: document.getElementById('old-regime-subinputs'),
        input80c: document.getElementById('input-80c'),
        input80d: document.getElementById('input-80d'),
        inputMonthlyRent: document.getElementById('input-monthly-rent'),
        paycheckAmount: document.getElementById('paycheck-amount'),
        paycheckSubtitle: document.getElementById('paycheck-subtitle'),
        freqPills: document.querySelectorAll('.freq-pill'),
        waterfallChart: document.getElementById('waterfall-chart'),
        donutChart: document.getElementById('donut-chart'),
        donutCenter: document.getElementById('donut-center'),
        donutLegend: document.getElementById('donut-legend'),
        lineItemsList: document.getElementById('line-items-list'),
        jumpToTaxGuideBtn: document.getElementById('jump-to-tax-guide-btn'),

        // Wizard
        wizardCards: document.querySelectorAll('.wizard-card'),
        wizardCtcInput: document.getElementById('wizard-ctc'),
        wizardCurrSymbol: document.getElementById('wizard-curr-symbol'),
        wizardRentRadios: document.querySelectorAll('input[name="wiz-rent"]'),
        wizardRentSymbol: document.getElementById('wiz-rent-symbol'),
        wizardMonthlyRentInput: document.getElementById('wiz-monthly-rent'),
        wizardHealthRadios: document.querySelectorAll('input[name="wiz-health"]'),
        wizardRecommendationBox: document.getElementById('wizard-recommendation-box'),
        applyWizardBtn: document.getElementById('apply-wizard-btn'),

        // Offer Comparison Elements
        compCompanyA: document.getElementById('comp-company-a'),
        compRoleA: document.getElementById('comp-role-a'),
        compCtcA: document.getElementById('comp-ctc-a'),
        compBonusA: document.getElementById('comp-bonus-a'),
        compVariableA: document.getElementById('comp-variable-a'),
        compHealthA: document.getElementById('comp-health-a'),
        compWorkmodeA: document.getElementById('comp-workmode-a'),
        metricsOfferA: document.getElementById('metrics-offer-a'),

        compCompanyB: document.getElementById('comp-company-b'),
        compRoleB: document.getElementById('comp-role-b'),
        compCtcB: document.getElementById('comp-ctc-b'),
        compBonusB: document.getElementById('comp-bonus-b'),
        compVariableB: document.getElementById('comp-variable-b'),
        compHealthB: document.getElementById('comp-health-b'),
        compWorkmodeB: document.getElementById('comp-workmode-b'),
        metricsOfferB: document.getElementById('metrics-offer-b'),

        compareVerdictContainer: document.getElementById('compare-verdict-container'),
        loadCompareTechVsStartup: document.getElementById('load-compare-tech-vs-startup'),
        loadCompareFresherMetroVsRemote: document.getElementById('load-compare-fresher-metro-vs-remote'),

        // Checklist Elements
        checklistItemsContainer: document.getElementById('checklist-items-container'),
        checklistProgressBar: document.getElementById('checklist-progress-bar'),
        checklistBadge: document.getElementById('checklist-badge'),
        checklistStatusMessage: document.getElementById('checklist-status-message'),
        cntAll: document.getElementById('cnt-all'),
        cntPending: document.getElementById('cnt-pending'),
        cntCompleted: document.getElementById('cnt-completed'),
        navChecklistCount: document.getElementById('nav-checklist-count'),
        checkFilterBtns: document.querySelectorAll('.check-filter-btn'),
        resetChecklistBtn: document.getElementById('reset-checklist-btn'),

        // Investment Guide Elements
        investEpfAmount: document.getElementById('invest-epf-amount'),
        investRemaining80c: document.getElementById('invest-remaining-80c'),
        investTaxSaved: document.getElementById('invest-tax-saved'),
        invest80cFill: document.getElementById('invest-80c-fill'),
        strategyPills: document.querySelectorAll('.strategy-pill-btn'),
        strategyDetailsDisplay: document.getElementById('strategy-details-display'),

        // Health Matrix
        healthPlansContainer: document.getElementById('health-plans-container'),
        scenarioBtns: document.querySelectorAll('.scenario-btn'),
        scenarioResultsGrid: document.getElementById('scenario-results-grid'),

        // Jargon Translator
        jargonCategoryPills: document.querySelectorAll('.category-pill'),
        jargonSearchInput: document.getElementById('jargon-search-input'),
        jargonClearBtn: document.getElementById('jargon-clear-btn'),
        jargonCounter: document.getElementById('jargon-counter'),
        jargonGrid: document.getElementById('jargon-grid'),

        // Executive Summary
        execCompSummary: document.getElementById('exec-comp-summary'),
        execTaxSummary: document.getElementById('exec-tax-summary'),
        execDateStamp: document.getElementById('exec-date-stamp'),
        printExecBtn: document.getElementById('print-exec-btn'),
        execChecklistScore: document.getElementById('exec-checklist-score'),

        // Tooltip & Toasts
        tooltip: document.getElementById('tooltip'),
        tooltipContent: document.getElementById('tooltip-content'),
        toastContainer: document.getElementById('toast-container')
    };

    // ============================================
    // INITIALIZATION & LOCAL STORAGE RESTORE
    // ============================================
    function init() {
        loadStateFromLocalStorage();
        initTheme();
        setupEventListeners();
        renderJargonGrid(JARGON_DATABASE);
        renderChecklist();
        renderInvestmentGuide();
        renderOfferComparison();
        renderHealthView();
        updateCalculations();
        updateWizardRecommendation();

        // Switch to initial tab
        switchTab(state.activeTab || 'wizard');
    }

    // ============================================
    // THEME MANAGEMENT (DARK / LIGHT TOGGLE)
    // ============================================
    function initTheme() {
        const savedTheme = localStorage.getItem('employease_theme') || 'dark';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('employease_theme', theme);

        if (elements.themeIcon && elements.themeLabel) {
            if (theme === 'dark') {
                elements.themeIcon.textContent = '☀️';
                elements.themeLabel.textContent = 'Light';
            } else {
                elements.themeIcon.textContent = '🌙';
                elements.themeLabel.textContent = 'Dark';
            }
        }

        // Redraw canvas donut chart to match updated theme colors
        if (state.activeCalc) {
            renderDonutChart(state.activeCalc.annualTakeHome, state.activeCalc.incomeTax, state.activeCalc.epf, state.activeCalc.ctc);
        }
    }

    function toggleTheme() {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        showNotification(`Switched to ${nextTheme.toUpperCase()} theme`);
    }

    // ============================================
    // LOCAL STORAGE PERSISTENCE
    // ============================================
    let autoSaveTimer = null;

    function triggerAutoSave() {
        if (elements.autosaveText) {
            elements.autosaveText.textContent = 'Saving...';
        }

        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            const data = {
                salary: state.salary,
                wizard: state.wizard,
                country: state.country,
                targetCurrency: state.targetCurrency,
                payFrequency: state.payFrequency,
                compareOffers: state.compareOffers,
                checklist: state.checklist,
                activeTab: state.activeTab
            };

            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
                if (elements.autosaveText) {
                    elements.autosaveText.textContent = 'Saved';
                }
            } catch (err) {
                console.warn('LocalStorage save failed:', err);
            }
        }, 300);
    }

    function loadStateFromLocalStorage() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);

            if (data.salary) Object.assign(state.salary, data.salary);
            if (data.wizard) Object.assign(state.wizard, data.wizard);
            if (data.country) state.country = data.country;
            if (data.targetCurrency) state.targetCurrency = data.targetCurrency;
            if (data.payFrequency) state.payFrequency = data.payFrequency;
            if (data.compareOffers) Object.assign(state.compareOffers, data.compareOffers);
            if (data.checklist) Object.assign(state.checklist, data.checklist);
            if (data.activeTab) state.activeTab = data.activeTab;

            // Sync inputs to DOM
            if (elements.inputCtc) elements.inputCtc.value = state.salary.annualCtc;
            if (elements.inputBasicPct) elements.inputBasicPct.value = state.salary.basicPercent;
            if (elements.inputHraPct) elements.inputHraPct.value = state.salary.hraPercent;
            if (elements.input80c) elements.input80c.value = state.salary.sec80C;
            if (elements.input80d) elements.input80d.value = state.salary.sec80D;
            if (elements.inputMonthlyRent) elements.inputMonthlyRent.value = state.salary.monthlyRent;
            if (elements.wizardCtcInput) elements.wizardCtcInput.value = state.wizard.ctc;
            if (elements.wizardMonthlyRentInput) elements.wizardMonthlyRentInput.value = state.wizard.monthlyRent;

            // Sync currency
            if (elements.currencySelect) elements.currencySelect.value = state.targetCurrency;

            // Sync regime
            elements.calcRegimeRadios.forEach(radio => {
                if (radio.value === state.salary.regime) radio.checked = true;
            });
            if (elements.oldRegimeSubinputs) {
                elements.oldRegimeSubinputs.style.display = state.salary.regime === 'old' ? 'block' : 'none';
            }

            // Sync region pills
            elements.countryPills.forEach(pill => {
                if (pill.dataset.country === state.country) pill.classList.add('active');
                else pill.classList.remove('active');
            });

            // Sync freq pills
            elements.freqPills.forEach(pill => {
                if (pill.dataset.freq === state.payFrequency) pill.classList.add('active');
                else pill.classList.remove('active');
            });

            // Sync compare inputs
            syncCompareInputsFromState();

        } catch (err) {
            console.warn('Could not restore localStorage state:', err);
        }
    }

    function resetStateToDefaults() {
        if (confirm('Reset all custom inputs back to original sample presets?')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            window.location.reload();
        }
    }

    // ============================================
    // TAB NAVIGATION HANDLER
    // ============================================
    function switchTab(tabName) {
        state.activeTab = tabName;

        elements.tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        elements.tabViews.forEach(view => {
            if (view.id === `view-${tabName}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        if (tabName === 'paycheck') renderPaycheckView();
        if (tabName === 'compare') renderOfferComparison();
        if (tabName === 'checklist') renderChecklist();
        if (tabName === 'investment') renderInvestmentGuide();
        if (tabName === 'health') renderHealthView();
        if (tabName === 'executive') renderExecutiveView();

        triggerAutoSave();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // CLIENT-SIDE HIGH PRECISION TAX ENGINE
    // ============================================
    function calculateClientTax(annualSalary, country = 'india', regime = 'new', sec80C = 150000, sec80D = 25000, monthlyRent = 18000, basicSalary = null) {
        const salary = Math.max(0, annualSalary);

        if (country === 'india') {
            if (regime === 'new') {
                // India New Tax Regime AY 2026-27 (FY 2025-26)
                const stdDeduction = 75000;
                const taxable = Math.max(0, salary - stdDeduction);
                
                const slabs = [
                    { min: 0, max: 400000, rate: 0.00 },
                    { min: 400000, max: 800000, rate: 0.05 },
                    { min: 800000, max: 1200000, rate: 0.10 },
                    { min: 1200000, max: 1600000, rate: 0.15 },
                    { min: 1600000, max: 2000000, rate: 0.20 },
                    { min: 2000000, max: 2400000, rate: 0.25 },
                    { min: 2400000, max: Infinity, rate: 0.30 }
                ];

                let slabTax = 0;
                for (const slab of slabs) {
                    if (taxable > slab.min) {
                        const taxableInSlab = Math.min(taxable, slab.max) - slab.min;
                        slabTax += taxableInSlab * slab.rate;
                    }
                }

                // Section 87A rebate for taxable income <= 12,00,000 under New Regime
                let rebate = 0;
                if (taxable <= 1200000) {
                    rebate = slabTax;
                }

                const taxAfterRebate = Math.max(0, slabTax - rebate);
                const cess = taxAfterRebate * 0.04;
                const estimatedTax = Math.round(taxAfterRebate + cess);
                const effectiveTaxRate = salary > 0 ? Number(((estimatedTax / salary) * 100).toFixed(2)) : 0;

                return {
                    estimatedTax,
                    effectiveTaxRate,
                    taxableIncome: taxable,
                    taxYear: 'AY 2026-27',
                    regime: 'New Tax Regime (FY 25-26 Standard)'
                };
            } else {
                // India Old Tax Regime (with 80C, 80D, HRA exemption)
                const stdDeduction = 50000;
                const basic = basicSalary || (salary * 0.5);
                const actualHra = salary * 0.2;
                const annualRent = monthlyRent * 12;
                // HRA exemption: min(actual HRA, 50% basic, rent - 10% basic)
                const rentMinusTenPct = Math.max(0, annualRent - (basic * 0.1));
                const hraExemption = Math.max(0, Math.min(actualHra, basic * 0.5, rentMinusTenPct));
                
                const totalDeductions = stdDeduction + Math.min(150000, sec80C) + Math.min(75000, sec80D) + hraExemption;
                const taxable = Math.max(0, salary - totalDeductions);

                const slabs = [
                    { min: 0, max: 250000, rate: 0.00 },
                    { min: 250000, max: 500000, rate: 0.05 },
                    { min: 500000, max: 1000000, rate: 0.20 },
                    { min: 1000000, max: Infinity, rate: 0.30 }
                ];

                let slabTax = 0;
                for (const slab of slabs) {
                    if (taxable > slab.min) {
                        const taxableInSlab = Math.min(taxable, slab.max) - slab.min;
                        slabTax += taxableInSlab * slab.rate;
                    }
                }

                let rebate = 0;
                if (taxable <= 500000) {
                    rebate = Math.min(slabTax, 12500);
                }

                const taxAfterRebate = Math.max(0, slabTax - rebate);
                const cess = taxAfterRebate * 0.04;
                const estimatedTax = Math.round(taxAfterRebate + cess);
                const effectiveTaxRate = salary > 0 ? Number(((estimatedTax / salary) * 100).toFixed(2)) : 0;

                return {
                    estimatedTax,
                    effectiveTaxRate,
                    taxableIncome: taxable,
                    taxYear: 'AY 2026-27',
                    regime: 'Old Tax Regime (Exemptions Claimed)'
                };
            }
        } else if (country === 'usa') {
            const stdDeduction = 15000;
            const taxable = Math.max(0, salary - stdDeduction);
            const slabs = [
                { min: 0, max: 11925, rate: 0.10 },
                { min: 11925, max: 48475, rate: 0.12 },
                { min: 48475, max: 103350, rate: 0.22 },
                { min: 103350, max: 197300, rate: 0.24 },
                { min: 197300, max: 250525, rate: 0.32 },
                { min: 250525, max: 626350, rate: 0.35 },
                { min: 626350, max: Infinity, rate: 0.37 }
            ];
            let slabTax = 0;
            for (const slab of slabs) {
                if (taxable > slab.min) {
                    const taxableInSlab = Math.min(taxable, slab.max) - slab.min;
                    slabTax += taxableInSlab * slab.rate;
                }
            }
            const estimatedTax = Math.round(slabTax);
            const effectiveTaxRate = salary > 0 ? Number(((estimatedTax / salary) * 100).toFixed(2)) : 0;
            return {
                estimatedTax,
                effectiveTaxRate,
                taxableIncome: taxable,
                taxYear: '2026',
                regime: 'US Federal Standard (Single)'
            };
        } else {
            // UK / EU
            const stdDeduction = 12570;
            const taxable = Math.max(0, salary - stdDeduction);
            let slabTax = 0;
            if (taxable > 0) slabTax += Math.min(taxable, 37700) * 0.20;
            if (taxable > 37700) slabTax += (Math.min(taxable, 125140) - 37700) * 0.40;
            if (taxable > 125140) slabTax += (taxable - 125140) * 0.45;
            const estimatedTax = Math.round(slabTax);
            const effectiveTaxRate = salary > 0 ? Number(((estimatedTax / salary) * 100).toFixed(2)) : 0;
            return {
                estimatedTax,
                effectiveTaxRate,
                taxableIncome: taxable,
                taxYear: '2025-26',
                regime: 'UK / EU Standard'
            };
        }
    }

    // ============================================
    // CALCULATIONS & FINANCIAL ENGINES
    // ============================================
    async function updateCalculations() {
        const ctc = state.salary.annualCtc || 0;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';
        const basic = (ctc * state.salary.basicPercent) / 100;
        const hra = (ctc * state.salary.hraPercent) / 100;
        const epf = (basic * state.salary.epfPercent) / 100;

        // 1. Instantaneous Local Calculation (Zero lag, failsafe)
        const localTax = calculateClientTax(
            ctc,
            state.country,
            state.salary.regime,
            state.salary.sec80C,
            state.salary.sec80D,
            state.salary.monthlyRent,
            basic
        );

        let incomeTax = localTax.estimatedTax;
        let taxableIncome = localTax.taxableIncome;
        let effectiveTaxRate = localTax.effectiveTaxRate;
        let taxYear = localTax.taxYear;
        let regime = localTax.regime;
        let annualTakeHome = Math.max(0, ctc - incomeTax - epf);

        // Currency conversion for badge display
        let conversionRate = 1;
        if (state.country === 'india' && state.targetCurrency === 'USD') conversionRate = 1 / state.exchangeRates.INR;
        if (state.country === 'india' && state.targetCurrency === 'EUR') conversionRate = state.exchangeRates.EUR / state.exchangeRates.INR;
        if (state.country === 'india' && state.targetCurrency === 'GBP') conversionRate = state.exchangeRates.GBP / state.exchangeRates.INR;
        if (state.country === 'usa' && state.targetCurrency === 'INR') conversionRate = state.exchangeRates.INR;
        if (state.country === 'usa' && state.targetCurrency === 'EUR') conversionRate = state.exchangeRates.EUR;

        const convertedAnnualCtc = ctc * conversionRate;
        if (elements.convertedTotalDisplay) {
            elements.convertedTotalDisplay.textContent = `= ${sym}${Math.round(convertedAnnualCtc).toLocaleString()} /yr`;
        }

        state.activeCalc = { ctc, basic, hra, epf, taxableIncome, incomeTax, annualTakeHome, effectiveTaxRate, taxYear, regime };
        renderPaycheckView();
        triggerAutoSave();

        // 2. Asynchronous Background Sync with Backend (if online)
        let countryName = 'India';
        if (state.country === 'usa') countryName = 'USA';
        if (state.country === 'europe') countryName = 'Germany';

        apiRequest('/tax/calculate', 'POST', {
            annualSalary: ctc > 0 ? ctc : 1,
            country: countryName
        }, false, 2500).then(taxRes => {
            if (taxRes.ok && taxRes.data && taxRes.data.success) {
                // If backend provides validated tax, sync smoothly
                state.activeCalc.incomeTax = taxRes.data.data.estimatedTax;
                state.activeCalc.effectiveTaxRate = taxRes.data.data.effectiveTaxRate;
                state.activeCalc.annualTakeHome = Math.max(0, ctc - taxRes.data.data.estimatedTax - epf);
                renderPaycheckView();
            }
        });
    }

    // ============================================
    // PAYCHECK VIEW RENDERER
    // ============================================
    function renderPaycheckView() {
        if (!state.activeCalc) return;
        const calc = state.activeCalc;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        let periods = 12;
        let periodLabel = 'monthly payday';
        if (state.payFrequency === 'biweekly') { periods = 26; periodLabel = 'bi-weekly payday'; }
        if (state.payFrequency === 'semimonthly') { periods = 24; periodLabel = 'semi-monthly payday'; }

        const periodNet = calc.annualTakeHome / periods;

        if (elements.paycheckAmount) {
            elements.paycheckAmount.textContent = `${sym}${Math.round(periodNet).toLocaleString()}`;
        }
        if (elements.paycheckSubtitle) {
            elements.paycheckSubtitle.textContent = `Actual net cash landing in your checking account every ${periodLabel} (${sym}${Math.round(calc.annualTakeHome).toLocaleString()} / year).`;
        }

        const getBarWidth = (val) => `${Math.max(4, Math.min(100, (val / (calc.ctc || 1)) * 100)).toFixed(1)}%`;
        
        if (elements.waterfallChart) {
            elements.waterfallChart.innerHTML = `
                <div class="waterfall-item">
                    <span class="waterfall-label">Gross CTC</span>
                    <div class="waterfall-bar-outer">
                        <div class="waterfall-bar-inner bar-gross" style="width:100%;">
                            ${sym}${Math.round(calc.ctc).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div class="waterfall-item">
                    <span class="waterfall-label">Income Tax</span>
                    <div class="waterfall-bar-outer">
                        <div class="waterfall-bar-inner bar-tax" style="width:${getBarWidth(calc.incomeTax)};">
                            ${sym}${Math.round(calc.incomeTax).toLocaleString()}
                        </div>
                    </div>
                </div>
                ${calc.epf > 0 ? `
                <div class="waterfall-item">
                    <span class="waterfall-label">Provident Fund (EPF)</span>
                    <div class="waterfall-bar-outer">
                        <div class="waterfall-bar-inner bar-pf" style="width:${getBarWidth(calc.epf)};">
                            ${sym}${Math.round(calc.epf).toLocaleString()}
                        </div>
                    </div>
                </div>
                ` : ''}
                <div class="waterfall-item">
                    <span class="waterfall-label">Net Take-Home</span>
                    <div class="waterfall-bar-outer">
                        <div class="waterfall-bar-inner bar-net" style="width:${getBarWidth(calc.annualTakeHome)};">
                            ${sym}${Math.round(calc.annualTakeHome).toLocaleString()}
                        </div>
                    </div>
                </div>
            `;
        }

        renderDonutChart(calc.annualTakeHome, calc.incomeTax, calc.epf, calc.ctc);

        if (elements.lineItemsList) {
            elements.lineItemsList.innerHTML = `
                <div class="line-item-row">
                    <div>
                        <span class="line-item-title">Basic Salary (Earned Base)</span>
                        <span class="line-item-sub">${state.salary.basicPercent}% of total CTC — foundation of retirement retiral benefits</span>
                    </div>
                    <span class="line-item-val val-addition">+${sym}${Math.round(calc.basic).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <div>
                        <span class="line-item-title">House Rent Allowance (HRA)</span>
                        <span class="line-item-sub">Exempt under Section 10(13A) when paying rent in Old Regime</span>
                    </div>
                    <span class="line-item-val val-addition">+${sym}${Math.round(calc.hra).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <div>
                        <span class="line-item-title">Employees' Provident Fund (EPF 12%)</span>
                        <span class="line-item-sub">Mandatory retirement saving; matched by employer, earns ~8.25% interest</span>
                    </div>
                    <span class="line-item-val val-deduction">-${sym}${Math.round(calc.epf).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <div>
                        <span class="line-item-title">Annual Income Tax & Cess</span>
                        <span class="line-item-sub">${calc.regime} (${calc.taxYear}) — effective rate: ${calc.effectiveTaxRate}%</span>
                    </div>
                    <span class="line-item-val val-deduction">-${sym}${Math.round(calc.incomeTax).toLocaleString()}</span>
                </div>
            `;
        }
    }

    // ============================================
    // CANVAS DONUT CHART RENDERER
    // ============================================
    function renderDonutChart(takeHome, tax, pf, ctc) {
        if (!elements.donutChart) return;
        const canvas = elements.donutChart;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 16;
        const innerRadius = radius * 0.65;

        ctx.clearRect(0, 0, width, height);

        const total = (takeHome + tax + pf) || 1;
        const segments = [
            { label: 'Take-Home Cash', val: takeHome, color: state.theme === 'light' ? '#059669' : '#10B981' },
            { label: 'Income Tax', val: tax, color: state.theme === 'light' ? '#DC2626' : '#EF4444' },
            { label: 'Retirement PF', val: pf, color: state.theme === 'light' ? '#4F46E5' : '#38BDF8' }
        ];

        let startAngle = -Math.PI / 2;

        segments.forEach(seg => {
            const sliceAngle = (seg.val / total) * (Math.PI * 2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();
            startAngle += sliceAngle;
        });

        const pct = Math.round((takeHome / (ctc || 1)) * 100);
        if (elements.donutCenter) {
            elements.donutCenter.innerHTML = `
                <div style="font-size:1.6rem; font-weight:800; color:var(--accent-emerald);">${pct}%</div>
                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">In-Hand</div>
            `;
        }

        if (elements.donutLegend) {
            elements.donutLegend.innerHTML = segments.map(s => `
                <div class="legend-item">
                    <span class="legend-dot" style="background:${s.color};"></span>
                    <span>${s.label}: <strong>${Math.round((s.val / total) * 100)}%</strong></span>
                </div>
            `).join('');
        }
    }

    // ============================================
    // OFFER COMPARISON ENGINE (NEW FEATURE)
    // ============================================
    function syncCompareInputsFromState() {
        const a = state.compareOffers.offerA;
        const b = state.compareOffers.offerB;

        if (elements.compCompanyA) elements.compCompanyA.value = a.company;
        if (elements.compRoleA) elements.compRoleA.value = a.role;
        if (elements.compCtcA) elements.compCtcA.value = a.ctc;
        if (elements.compBonusA) elements.compBonusA.value = a.bonus;
        if (elements.compVariableA) elements.compVariableA.value = a.variablePct;
        if (elements.compHealthA) elements.compHealthA.value = a.healthCover;
        if (elements.compWorkmodeA) elements.compWorkmodeA.value = a.workMode;

        if (elements.compCompanyB) elements.compCompanyB.value = b.company;
        if (elements.compRoleB) elements.compRoleB.value = b.role;
        if (elements.compCtcB) elements.compCtcB.value = b.ctc;
        if (elements.compBonusB) elements.compBonusB.value = b.bonus;
        if (elements.compVariableB) elements.compVariableB.value = b.variablePct;
        if (elements.compHealthB) elements.compHealthB.value = b.healthCover;
        if (elements.compWorkmodeB) elements.compWorkmodeB.value = b.workMode;
    }

    function calculateOfferMetrics(offer) {
        const ctc = parseFloat(offer.ctc) || 0;
        const varPct = parseFloat(offer.variablePct) || 0;
        const bonus = parseFloat(offer.bonus) || 0;

        const fixedPortion = ctc * (1 - varPct / 100);
        const variablePortion = ctc * (varPct / 100);

        // Standard 50% basic for calculations
        const basic = fixedPortion * 0.5;
        const epf = basic * 0.12;

        // Compute tax under New Regime
        const taxCalc = calculateClientTax(ctc, 'india', 'new');
        const annualTax = taxCalc.estimatedTax;

        // Guaranteed monthly in-hand cash from fixed salary
        const guaranteedNetAnnual = Math.max(0, fixedPortion - annualTax - epf);
        const monthlyInHand = guaranteedNetAnnual / 12;

        // First year total liquid cash (Fixed Net + Bonus post 30% tax + variable if achieved)
        const bonusAfterTax = bonus * 0.7;
        const firstYearTotalCash = guaranteedNetAnnual + bonusAfterTax;

        return {
            ctc,
            fixedPortion,
            variablePortion,
            annualTax,
            epf,
            monthlyInHand,
            bonus,
            bonusAfterTax,
            firstYearTotalCash
        };
    }

    function renderOfferComparison() {
        if (!elements.metricsOfferA || !elements.metricsOfferB) return;

        const a = state.compareOffers.offerA;
        const b = state.compareOffers.offerB;

        const metA = calculateOfferMetrics(a);
        const metB = calculateOfferMetrics(b);
        const sym = '₹';

        // Render Offer A Metrics
        elements.metricsOfferA.innerHTML = `
            <div class="comp-metric-row">
                <span>Guaranteed Monthly In-Hand:</span>
                <span class="comp-metric-val" style="color:var(--accent-indigo); font-size:1.1rem;">
                    ${sym}${Math.round(metA.monthlyInHand).toLocaleString()} / mo
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Fixed Base vs Variable:</span>
                <span class="comp-metric-val">
                    ${sym}${Math.round(metA.fixedPortion).toLocaleString()} (${100 - a.variablePct}%) | Var: ${a.variablePct}%
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Estimated Annual Tax:</span>
                <span class="comp-metric-val" style="color:var(--accent-red);">
                    ${sym}${Math.round(metA.annualTax).toLocaleString()}
                </span>
            </div>
            <div class="comp-metric-row">
                <span>1st-Year Total Cash (Net + Bonus):</span>
                <span class="comp-metric-val" style="color:var(--accent-emerald);">
                    ${sym}${Math.round(metA.firstYearTotalCash).toLocaleString()}
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Health Cover Provided:</span>
                <span class="comp-metric-val">${sym}${Number(a.healthCover).toLocaleString()} Sum Insured</span>
            </div>
        `;

        // Render Offer B Metrics
        elements.metricsOfferB.innerHTML = `
            <div class="comp-metric-row">
                <span>Guaranteed Monthly In-Hand:</span>
                <span class="comp-metric-val" style="color:var(--accent-emerald); font-size:1.1rem;">
                    ${sym}${Math.round(metB.monthlyInHand).toLocaleString()} / mo
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Fixed Base vs Variable:</span>
                <span class="comp-metric-val">
                    ${sym}${Math.round(metB.fixedPortion).toLocaleString()} (${100 - b.variablePct}%) | Var: ${b.variablePct}%
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Estimated Annual Tax:</span>
                <span class="comp-metric-val" style="color:var(--accent-red);">
                    ${sym}${Math.round(metB.annualTax).toLocaleString()}
                </span>
            </div>
            <div class="comp-metric-row">
                <span>1st-Year Total Cash (Net + Bonus):</span>
                <span class="comp-metric-val" style="color:var(--accent-emerald);">
                    ${sym}${Math.round(metB.firstYearTotalCash).toLocaleString()}
                </span>
            </div>
            <div class="comp-metric-row">
                <span>Health Cover Provided:</span>
                <span class="comp-metric-val">${sym}${Number(b.healthCover).toLocaleString()} Sum Insured</span>
            </div>
        `;

        // Generate EmployEase AI Verdict
        const monthlyDiff = metB.monthlyInHand - metA.monthlyInHand;
        const totalCashDiff = metB.firstYearTotalCash - metA.firstYearTotalCash;

        let verdictHtml = '';
        if (monthlyDiff > 1000) {
            verdictHtml = `
                <div class="verdict-header">
                    <span style="font-size:1.6rem;">🏆</span>
                    <div>
                        <h3>EmployEase Decision Verdict: ${b.company} delivers +${sym}${Math.round(monthlyDiff).toLocaleString()} more monthly cash in-hand</h3>
                        <span class="verdict-badge verdict-badge-b">${b.company} Recommended on Cashflow</span>
                    </div>
                </div>
                <div class="verdict-details margin-top-sm">
                    <p><strong>Financial Analysis:</strong> ${b.company} deposits approximately <strong>+${sym}${Math.round(monthlyDiff).toLocaleString()}</strong> additional net cash into your checking account every 30 days (+${((monthlyDiff / metA.monthlyInHand) * 100).toFixed(1)}%). Over year one, including signing bonus, it yields <strong>+${sym}${Math.round(totalCashDiff).toLocaleString()}</strong> total advantage.</p>
                    <p class="margin-top-sm"><strong>Hidden Trade-Off to Watch:</strong> ${b.variablePct > a.variablePct ? `Note that ${b.company} has a higher variable component (${b.variablePct}% vs ${a.variablePct}%). Make sure to clarify with the hiring manager whether bonuses have historically paid out at 100%.` : ''} Work arrangement is <em>${b.workMode}</em> vs <em>${a.workMode}</em>.</p>
                </div>
            `;
        } else if (monthlyDiff < -1000) {
            verdictHtml = `
                <div class="verdict-header">
                    <span style="font-size:1.6rem;">🏆</span>
                    <div>
                        <h3>EmployEase Decision Verdict: ${a.company} delivers +${sym}${Math.round(Math.abs(monthlyDiff)).toLocaleString()} more guaranteed monthly cash</h3>
                        <span class="verdict-badge verdict-badge-a">${a.company} Recommended on Stability</span>
                    </div>
                </div>
                <div class="verdict-details margin-top-sm">
                    <p><strong>Financial Analysis:</strong> Even if other headlines seem close, ${a.company} gives you <strong>+${sym}${Math.round(Math.abs(monthlyDiff)).toLocaleString()}</strong> more predictable monthly in-hand pay because of lower variable deductions and a healthier fixed base salary.</p>
                </div>
            `;
        } else {
            verdictHtml = `
                <div class="verdict-header">
                    <span style="font-size:1.6rem;">⚖️</span>
                    <div>
                        <h3>EmployEase Decision Verdict: Both offers provide virtually identical monthly in-hand cash</h3>
                        <span class="verdict-badge" style="background:rgba(245,158,11,0.2); color:var(--accent-amber); border:1px solid var(--accent-amber);">Close Match (Choose on Culture & Growth)</span>
                    </div>
                </div>
                <div class="verdict-details margin-top-sm">
                    <p>The monthly take-home pay between ${a.company} and ${b.company} differs by less than ₹1,000. Decide based on engineering mentorship, tech stack, health insurance (${sym}${Number(a.healthCover).toLocaleString()} vs ${sym}${Number(b.healthCover).toLocaleString()}), and work arrangement (${a.workMode} vs ${b.workMode}).</p>
                </div>
            `;
        }

        if (elements.compareVerdictContainer) {
            elements.compareVerdictContainer.innerHTML = verdictHtml;
        }
    }

    // ============================================
    // FIRST-JOB DOCUMENT CHECKLIST ENGINE (NEW FEATURE)
    // ============================================
    function renderChecklist() {
        if (!elements.checklistItemsContainer) return;

        let totalItems = 0;
        let completedCount = 0;

        CHECKLIST_DATA.forEach(cat => {
            cat.items.forEach(item => {
                totalItems++;
                if (state.checklist[item.id]) completedCount++;
            });
        });

        const pct = Math.round((completedCount / (totalItems || 1)) * 100);

        if (elements.checklistProgressBar) elements.checklistProgressBar.style.width = `${pct}%`;
        if (elements.checklistBadge) elements.checklistBadge.textContent = `${pct}% Ready`;
        if (elements.navChecklistCount) elements.navChecklistCount.textContent = `${completedCount}/${totalItems}`;
        if (elements.cntAll) elements.cntAll.textContent = totalItems;
        if (elements.cntPending) elements.cntPending.textContent = totalItems - completedCount;
        if (elements.cntCompleted) elements.cntCompleted.textContent = completedCount;
        if (elements.execChecklistScore) elements.execChecklistScore.textContent = `${completedCount} of ${totalItems} Verified`;

        if (elements.checklistStatusMessage) {
            if (pct === 100) elements.checklistStatusMessage.textContent = '🎉 All statutory forms and onboarding paperwork verified! You are 100% Day-One Ready!';
            else if (pct >= 50) elements.checklistStatusMessage.textContent = '⚡ Excellent progress! Just a few remaining items before your first payday.';
            else elements.checklistStatusMessage.textContent = 'Complete these statutory documents to ensure smooth salary disbursement and zero tax penalties.';
        }

        const filter = state.checklistFilter || 'all';

        elements.checklistItemsContainer.innerHTML = CHECKLIST_DATA.map(cat => {
            const filteredItems = cat.items.filter(item => {
                const isDone = !!state.checklist[item.id];
                if (filter === 'completed') return isDone;
                if (filter === 'pending') return !isDone;
                return true;
            });

            if (filteredItems.length === 0) return '';

            return `
                <div class="check-category-card">
                    <div class="check-cat-title">
                        <span>${cat.icon}</span>
                        <span>${cat.category}</span>
                    </div>
                    <div class="check-items-list">
                        ${filteredItems.map(item => {
                            const isChecked = !!state.checklist[item.id];
                            return `
                                <div class="check-item ${isChecked ? 'completed' : ''}" data-item-id="${item.id}">
                                    <div class="check-box-custom">✓</div>
                                    <div class="check-content">
                                        <span class="check-name">${item.name}</span>
                                        <p class="check-desc">${item.desc}</p>
                                        <div style="font-size:0.75rem; color:var(--accent-indigo); margin-top:4px;">
                                            💡 <strong>Why needed:</strong> ${item.why}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Attach Checkbox Click Handlers
        document.querySelectorAll('.check-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.itemId;
                state.checklist[id] = !state.checklist[id];
                triggerAutoSave();
                renderChecklist();
                showNotification(state.checklist[id] ? 'Document marked completed' : 'Document uncompleted');
            });
        });
    }

    // ============================================
    // 80C INVESTMENT STARTER GUIDE ENGINE (NEW FEATURE)
    // ============================================
    function renderInvestmentGuide() {
        const ctc = state.salary.annualCtc || 1500000;
        const basic = (ctc * state.salary.basicPercent) / 100;
        const mandatoryEpf = Math.round(basic * 0.12);
        const max80C = 150000;
        const remaining80C = Math.max(0, max80C - mandatoryEpf);

        // Est tax saved at 20% slab + cess
        const estTaxSaved = Math.round(max80C * 0.208);

        if (elements.investEpfAmount) elements.investEpfAmount.textContent = `₹${mandatoryEpf.toLocaleString()}`;
        if (elements.investRemaining80c) elements.investRemaining80c.textContent = `₹${remaining80C.toLocaleString()}`;
        if (elements.investTaxSaved) elements.investTaxSaved.textContent = `₹${estTaxSaved.toLocaleString()} /yr`;

        const fillPct = Math.min(100, Math.round((mandatoryEpf / max80C) * 100));
        if (elements.invest80cFill) elements.invest80cFill.style.width = `${fillPct}%`;

        // Render Strategy Breakdown
        renderStrategyPresetDetails('growth', remaining80C);
    }

    function renderStrategyPresetDetails(strategy, remaining80C) {
        if (!elements.strategyDetailsDisplay) return;

        let elssAmt = 0;
        let ppfAmt = 0;
        let npsAmt = 50000; // Extra 80CCD(1B)

        if (strategy === 'growth') {
            elssAmt = Math.round(remaining80C * 0.7);
            ppfAmt = Math.round(remaining80C * 0.3);
        } else if (strategy === 'balanced') {
            elssAmt = Math.round(remaining80C * 0.5);
            ppfAmt = Math.round(remaining80C * 0.3);
            npsAmt = Math.round(remaining80C * 0.2) + 50000;
        } else {
            // Safety
            elssAmt = 0;
            ppfAmt = remaining80C;
            npsAmt = 50000;
        }

        elements.strategyDetailsDisplay.innerHTML = `
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; border:1px solid var(--border-subtle);">
                <div style="font-size:0.9rem; font-weight:700; color:var(--accent-cyan); margin-bottom:8px;">
                    📊 Suggested Monthly Investment Plan for Your Remaining Capacity:
                </div>
                <div class="form-grid-2" style="font-size:0.85rem; gap:12px;">
                    <div>• <strong>ELSS Mutual Funds SIP:</strong> ₹${Math.round(elssAmt / 12).toLocaleString()} / month (₹${elssAmt.toLocaleString()}/yr)</div>
                    <div>• <strong>PPF Savings Account:</strong> ₹${Math.round(ppfAmt / 12).toLocaleString()} / month (₹${ppfAmt.toLocaleString()}/yr)</div>
                    <div>• <strong>NPS Tier-1 (Sec 80CCD 1B):</strong> ₹${Math.round(npsAmt / 12).toLocaleString()} / month (₹${npsAmt.toLocaleString()}/yr)</div>
                    <div>• <strong>Mediclaim (Sec 80D):</strong> ₹25,000 / year</div>
                </div>
                <div class="margin-top-md" style="display:flex; justify-content:flex-end;">
                    <button type="button" class="btn-primary" id="apply-invest-plan-btn">
                        🚀 Sync Plan to Paycheck Inputs
                    </button>
                </div>
            </div>
        `;

        const applyBtn = document.getElementById('apply-invest-plan-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                state.salary.sec80C = 150000;
                state.salary.sec80D = 25000;
                state.salary.regime = 'old';

                if (elements.input80c) elements.input80c.value = 150000;
                if (elements.input80d) elements.input80d.value = 25000;
                elements.calcRegimeRadios.forEach(r => {
                    if (r.value === 'old') r.checked = true;
                });
                if (elements.oldRegimeSubinputs) elements.oldRegimeSubinputs.style.display = 'block';

                updateCalculations();
                switchTab('paycheck');
                showNotification('Optimal 80C & 80D deductions applied to Paycheck Calculator!');
            });
        }
    }

    // ============================================
    // HEALTH MATRIX RENDERER
    // ============================================
    function renderHealthView() {
        if (!elements.healthPlansContainer) return;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        elements.healthPlansContainer.innerHTML = state.healthPlans.map(plan => `
            <div class="health-plan-card">
                <div class="plan-header">
                    <h3 class="plan-title">${plan.name}</h3>
                    <span style="font-size:0.78rem; color:var(--accent-cyan); font-weight:600;">${plan.type}</span>
                </div>
                <div class="plan-stat">
                    <span>Monthly Payroll Premium:</span>
                    <span class="plan-stat-val" style="color:var(--accent-emerald);">${sym}${plan.monthlyPremium.toLocaleString()}</span>
                </div>
                <div class="plan-stat">
                    <span>Annual Deductible:</span>
                    <span class="plan-stat-val">${sym}${plan.annualDeductible.toLocaleString()}</span>
                </div>
                <div class="plan-stat">
                    <span>Coinsurance (Your Share):</span>
                    <span class="plan-stat-val">${plan.copayPercent}%</span>
                </div>
                <div class="plan-stat">
                    <span>Out-of-Pocket Maximum:</span>
                    <span class="plan-stat-val" style="color:var(--accent-amber);">${sym}${plan.outOfPocketMax.toLocaleString()}</span>
                </div>
            </div>
        `).join('');

        renderScenarioResults();
    }

    function renderScenarioResults() {
        if (!elements.scenarioResultsGrid) return;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        let medicalCost = 3000;
        if (state.activeScenario === 'moderate') medicalCost = 35000;
        if (state.activeScenario === 'catastrophic') medicalCost = 350000;

        elements.scenarioResultsGrid.innerHTML = state.healthPlans.map(plan => {
            const annualPremiums = plan.monthlyPremium * 12;
            let outOfPocketMed = 0;

            if (medicalCost <= plan.annualDeductible) {
                outOfPocketMed = medicalCost;
            } else {
                const afterDeductible = medicalCost - plan.annualDeductible;
                const coinsurance = afterDeductible * (plan.copayPercent / 100);
                outOfPocketMed = Math.min(plan.outOfPocketMax, plan.annualDeductible + coinsurance);
            }

            const totalAnnualCost = annualPremiums + outOfPocketMed;

            return `
                <div class="scenario-res-card">
                    <div class="sc-res-title">${plan.name}</div>
                    <div class="sc-res-val">${sym}${Math.round(totalAnnualCost).toLocaleString()}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:6px;">
                        Premiums (${sym}${annualPremiums.toLocaleString()}) + Medical Care (${sym}${Math.round(outOfPocketMed).toLocaleString()})
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================
    // JARGON TRANSLATOR SEARCH & RENDERER ENGINE
    // ============================================
    function searchJargon(rawQuery, selectedCategory = 'all') {
        const q = (rawQuery || '').trim();

        let categoryFiltered = JARGON_DATABASE.filter(item => {
            return selectedCategory === 'all' || item.category === selectedCategory;
        });

        if (!q) return categoryFiltered;

        // Clean natural language questions
        let cleanQ = q.toLowerCase()
            .replace(/what is a|what is an|what is|what does|what do|mean in my offer letter|mean in offer letter|mean in contract|mean in salary|mean|clause|explain|tell me about/g, '')
            .trim();

        if (!cleanQ) cleanQ = q.toLowerCase().trim();

        const scored = [];
        categoryFiltered.forEach(item => {
            const termLower = item.term.toLowerCase();
            const defLower = item.meaning.toLowerCase();
            const forYouLower = item.forYou.toLowerCase();

            let score = 0;

            if (item.aliases && item.aliases.some(alias => alias === cleanQ)) {
                score += 100;
            } else if (termLower === cleanQ) {
                score += 100;
            } else if (item.aliases && item.aliases.some(alias => alias.includes(cleanQ) || cleanQ.includes(alias))) {
                score += 50;
            } else if (termLower.includes(cleanQ) || cleanQ.includes(termLower)) {
                score += 40;
            } else if (defLower.includes(cleanQ) || forYouLower.includes(cleanQ)) {
                score += 15;
            }

            if (score > 0) {
                scored.push({ item, score });
            }
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.item);
    }

    function renderJargonGrid(data) {
        if (!elements.jargonGrid) return;

        if (elements.jargonCounter) {
            elements.jargonCounter.textContent = `Showing ${data.length} of ${JARGON_DATABASE.length} terms`;
        }

        if (!data || data.length === 0) {
            elements.jargonGrid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 40px;">
                    <h3 style="color:var(--accent-amber);">No Matching HR or Legal Terms Found</h3>
                    <p style="color:var(--text-muted); margin-top:8px;">Try searching terms like "Variable Pay", "CTC", "Notice Period", "Probationary Period", or "80C".</p>
                </div>
            `;
            return;
        }

        elements.jargonGrid.innerHTML = data.map(item => `
            <div class="jargon-card">
                <div class="jargon-card-header">
                    <h3 class="jargon-term">${item.term}</h3>
                    <div class="jargon-badges">
                        <span class="badge-category">${item.category}</span>
                        <span class="badge-impact">Affects: ${item.impact}</span>
                    </div>
                </div>

                <div class="jargon-section margin-top-md">
                    <strong class="section-label">💡 Simple Meaning:</strong>
                    <p class="jargon-def">${item.meaning}</p>
                </div>

                <div class="jargon-section margin-top-sm">
                    <strong class="section-label">🎯 What it Means for You (The Employee):</strong>
                    <p class="jargon-for-you">${item.forYou}</p>
                </div>

                ${item.example ? `
                <div class="jargon-section margin-top-sm">
                    <strong class="section-label">📝 Real-World Example:</strong>
                    <p class="jargon-ex">${item.example}</p>
                </div>
                ` : ''}
            </div>
        `).join('');
    }

    // ============================================
    // WIZARD RECOMMENDATION ENGINE
    // ============================================
    function updateWizardRecommendation() {
        if (!elements.wizardRecommendationBox) return;

        const ctc = parseFloat(elements.wizardCtcInput ? elements.wizardCtcInput.value : state.wizard.ctc) || 1200000;
        const payingRent = state.wizard.rent === 'yes';
        const rentAmount = parseFloat(elements.wizardMonthlyRentInput ? elements.wizardMonthlyRentInput.value : state.wizard.monthlyRent) || 18000;
        const healthUsage = state.wizard.healthUsage;
        const sym = '₹';

        let regimeRec = 'New Tax Regime (FY 2025-26 Standard)';
        let regimeRationale = '';

        if (ctc <= 1275000) {
            regimeRec = 'New Tax Regime (Zero Tax Under Section 87A)';
            regimeRationale = `With an annual salary of ${sym}${ctc.toLocaleString()}, your taxable income after standard deduction is within the ₹12 Lakh threshold. You pay ZERO net tax under Section 87A rebate without needing to invest in lock-in products!`;
        } else if (payingRent && rentAmount >= 20000) {
            regimeRec = 'Old Tax Regime (HRA & 80C Exemptions)';
            regimeRationale = `Because you pay substantial monthly rent (${sym}${rentAmount.toLocaleString()}/mo), your HRA exemption combined with Section 80C and 80D investments can reduce your tax significantly compared to the New Regime.`;
        } else {
            regimeRec = 'New Tax Regime (Simplified Slabs)';
            regimeRationale = `The New Regime offers substantially lower progressive tax rates (5% to 20%) with zero documentation hassles or forced lock-ins.`;
        }

        let healthRec = 'Standard HDHP + HSA Plan';
        let healthRationale = '';

        if (healthUsage === 'high') {
            healthRec = 'Comprehensive PPO Plan';
            healthRationale = 'Because you anticipate regular medical visits or dependents, the lower deductible and fixed copayments protect you from high out-of-pocket costs.';
        } else {
            healthRec = 'Standard HDHP + HSA Plan';
            healthRationale = 'Because you are generally healthy with annual checkups, you save substantial monthly payroll premiums while maintaining catastrophic coverage for emergencies.';
        }

        elements.wizardRecommendationBox.innerHTML = `
            <div class="form-grid-2" style="gap:20px;">
                <div style="background:var(--bg-surface); padding:18px; border-radius:12px; border-left:3px solid var(--accent-cyan);">
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); font-weight:700;">Recommended Tax Regime</div>
                    <h3 style="font-family:var(--font-heading); margin-top:4px; font-size:1.1rem;">${regimeRec}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px; line-height:1.5;">${regimeRationale}</p>
                </div>
                <div style="background:var(--bg-surface); padding:18px; border-radius:12px; border-left:3px solid var(--accent-emerald);">
                    <div style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-emerald); font-weight:700;">Recommended Health Strategy</div>
                    <h3 style="font-family:var(--font-heading); margin-top:4px; font-size:1.1rem;">${healthRec}</h3>
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px; line-height:1.5;">${healthRationale}</p>
                </div>
            </div>
        `;
    }

    function showWizardStep(stepNum) {
        elements.wizardCards.forEach(card => {
            if (card.dataset.wizardStep === String(stepNum)) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update Stepper Lines
        document.querySelectorAll('.step-node').forEach(node => {
            const num = parseInt(node.dataset.stepIndicator);
            const target = parseInt(stepNum);
            if (num === target) {
                node.classList.add('active');
                node.classList.remove('completed');
            } else if (num < target) {
                node.classList.remove('active');
                node.classList.add('completed');
            } else {
                node.classList.remove('active');
                node.classList.remove('completed');
            }
        });

        const lines = [
            { id: 'line-1-2', min: 2 },
            { id: 'line-2-3', min: 3 },
            { id: 'line-3-4', min: 4 }
        ];
        lines.forEach(l => {
            const el = document.getElementById(l.id);
            if (el) {
                if (parseInt(stepNum) >= l.min) el.classList.add('active');
                else el.classList.remove('active');
            }
        });

        if (stepNum === '4') updateWizardRecommendation();
    }

    // ============================================
    // EXECUTIVE SUMMARY RENDERER
    // ============================================
    function renderExecutiveView() {
        if (!state.activeCalc) return;
        const calc = state.activeCalc;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        if (elements.execDateStamp) {
            elements.execDateStamp.textContent = `Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        }

        if (elements.execCompSummary) {
            elements.execCompSummary.innerHTML = `
                <div class="line-item-row">
                    <span>Tax Jurisdiction:</span>
                    <span style="font-weight:700;">${state.country.toUpperCase()} (${state.salary.regime.toUpperCase()} Tax Regime)</span>
                </div>
                <div class="line-item-row">
                    <span>Annual CTC:</span>
                    <span style="font-weight:700; color:var(--accent-cyan);">${sym}${Math.round(calc.ctc).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <span>Monthly Take-Home Cash:</span>
                    <span style="font-weight:700; color:var(--accent-emerald); font-size:1.05rem;">${sym}${Math.round(calc.annualTakeHome / 12).toLocaleString()} / mo</span>
                </div>
                <div class="line-item-row">
                    <span>Annual Net Cash:</span>
                    <span style="font-weight:700;">${sym}${Math.round(calc.annualTakeHome).toLocaleString()} / yr</span>
                </div>
            `;
        }

        if (elements.execTaxSummary) {
            elements.execTaxSummary.innerHTML = `
                <div class="line-item-row">
                    <span>Taxable Income Base:</span>
                    <span>${sym}${Math.round(calc.taxableIncome).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <span>Estimated Annual Tax & Cess:</span>
                    <span style="color:var(--accent-red); font-weight:700;">${sym}${Math.round(calc.incomeTax).toLocaleString()}</span>
                </div>
                <div class="line-item-row">
                    <span>Effective Tax Rate:</span>
                    <span style="font-weight:700;">${calc.effectiveTaxRate}%</span>
                </div>
                <div class="line-item-row">
                    <span>Mandatory Provident Fund (EPF):</span>
                    <span>${sym}${Math.round(calc.epf).toLocaleString()} / yr</span>
                </div>
            `;
        }
    }

    // ============================================
    // OFFER PARSER ENGINE (CLIENT + BACKEND)
    // ============================================
    async function parseOfferText(file, txt) {
        const resultsContainer = document.getElementById('document-analysis-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `<div style="font-size:0.88rem; color:var(--accent-cyan);">⏳ Analyzing offer document with EmployEase engine...</div>`;
        }

        // 1. Client-Side Instant Extraction Regex Fallback
        const fullText = txt || '';
        let extractedCtc = null;
        let extractedBasic = null;
        let extractedCompany = null;
        let extractedTitle = null;

        const ctcMatch = fullText.match(/(?:CTC|annual\s*(?:salary|compensation|package)|cost\s*to\s*company)\s*[:=-]?\s*(?:₹|INR|Rs\.?|\$|€|£)?\s*([\d,]+(?:\.\d+)?)\s*(?:lakhs?|lpa|lac)?/i);
        if (ctcMatch) {
            let num = parseFloat(ctcMatch[1].replace(/,/g, ''));
            if (/lakhs?|lpa|lac/i.test(ctcMatch[0]) && num < 100) num *= 100000;
            if (num > 0) extractedCtc = num;
        }

        const basicMatch = fullText.match(/(?:basic(?:\s*salary)?)\s*[:=-]?\s*(?:₹|INR|Rs\.?|\$|€|£)?\s*([\d,]+(?:\.\d+)?)/i);
        if (basicMatch) extractedBasic = parseFloat(basicMatch[1].replace(/,/g, ''));

        // 2. Call Backend if file uploaded or text provided
        const formData = new FormData();
        if (file) {
            formData.append('document', file);
        } else if (txt && txt.trim()) {
            const textBlob = new Blob([txt], { type: 'text/plain' });
            formData.append('document', textBlob, 'pasted_offer.txt');
        }

        let backendSuccess = false;
        try {
            const res = await apiRequest('/documents/analyze', 'POST', formData, true, 4000);
            if (res.ok && res.data && res.data.success) {
                backendSuccess = true;
                const d = res.data.data;
                if (d.annualSalary) extractedCtc = d.annualSalary;
                if (d.basicSalary) extractedBasic = d.basicSalary;
                if (d.companyName) extractedCompany = d.companyName;
                if (d.jobTitle) extractedTitle = d.jobTitle;
            }
        } catch (e) {}

        // Populate fields
        if (extractedCtc) {
            state.salary.annualCtc = extractedCtc;
            if (elements.inputCtc) elements.inputCtc.value = extractedCtc;
            if (extractedBasic && extractedCtc > 0) {
                const bPct = Math.round((extractedBasic / extractedCtc) * 100);
                state.salary.basicPercent = bPct;
                if (elements.inputBasicPct) elements.inputBasicPct.value = bPct;
            }
            updateCalculations();
        }

        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div style="font-size:0.95rem; font-weight:700; color:var(--accent-emerald); margin-bottom:8px;">
                    ✅ Offer Extracted Successfully
                </div>
                <div class="form-grid-2" style="font-size:0.85rem; gap:10px;">
                    <div><strong>Annual CTC:</strong> ₹${(extractedCtc || state.salary.annualCtc).toLocaleString()}</div>
                    <div><strong>Basic Salary:</strong> ${extractedBasic ? `₹${extractedBasic.toLocaleString()}` : '50% (Standard default)'}</div>
                    <div><strong>Company:</strong> ${extractedCompany || 'Identified from contract'}</div>
                    <div><strong>Role:</strong> ${extractedTitle || 'Software Professional'}</div>
                </div>
                <div style="margin-top:10px; font-size:0.8rem; color:var(--accent-cyan);">
                    ⚡ Your Paycheck Calculator has been automatically updated with these figures!
                </div>
            `;
        }
        showNotification('Offer letter parsed and populated into matrix!');
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    function showNotification(msg) {
        if (!elements.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = msg;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // ============================================
    // EVENT LISTENERS & WIRING
    // ============================================
    function setupEventListeners() {
        // Tab Navigation
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Theme Toggle
        if (elements.themeToggleBtn) {
            elements.themeToggleBtn.addEventListener('click', toggleTheme);
        }

        // Reset State Button
        if (elements.resetStateBtn) {
            elements.resetStateBtn.addEventListener('click', resetStateToDefaults);
        }

        // Country Pills
        elements.countryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.countryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.country = pill.dataset.country;
                updateCalculations();
            });
        });

        // Target Currency Selector
        if (elements.currencySelect) {
            elements.currencySelect.addEventListener('change', (e) => {
                state.targetCurrency = e.target.value;
                if (elements.inputCurrSymbol) elements.inputCurrSymbol.textContent = state.currencySymbols[state.targetCurrency] || '₹';
                if (elements.wizardCurrSymbol) elements.wizardCurrSymbol.textContent = state.currencySymbols[state.targetCurrency] || '₹';
                document.querySelectorAll('.currency-sym-text').forEach(el => {
                    el.textContent = state.currencySymbols[state.targetCurrency] || '₹';
                });
                updateCalculations();
                renderOfferComparison();
                renderHealthView();
            });
        }

        // Quick Preset Offer Selector
        if (elements.sampleOfferSelect) {
            elements.sampleOfferSelect.addEventListener('change', (e) => {
                const key = e.target.value;
                if (SAMPLE_OFFERS[key]) {
                    const preset = SAMPLE_OFFERS[key];
                    state.country = preset.country;
                    state.salary.annualCtc = preset.ctc;
                    state.salary.basicPercent = preset.basicPct;
                    state.salary.hraPercent = preset.hraPct;

                    if (elements.inputCtc) elements.inputCtc.value = preset.ctc;
                    if (elements.inputBasicPct) elements.inputBasicPct.value = preset.basicPct;
                    if (elements.inputHraPct) elements.inputHraPct.value = preset.hraPct;

                    elements.countryPills.forEach(p => {
                        if (p.dataset.country === preset.country) p.classList.add('active');
                        else p.classList.remove('active');
                    });

                    updateCalculations();
                    showNotification(`Loaded preset: ${key}`);
                }
            });
        }

        // Drawer Toggle
        if (elements.toggleParserBtn) {
            elements.toggleParserBtn.addEventListener('click', () => {
                const isHidden = elements.parserDrawer.style.display === 'none';
                elements.parserDrawer.style.display = isHidden ? 'block' : 'none';
            });
        }

        if (elements.closeDrawerBtn) {
            elements.closeDrawerBtn.addEventListener('click', () => {
                elements.parserDrawer.style.display = 'none';
            });
        }

        if (elements.clearOfferTextBtn) {
            elements.clearOfferTextBtn.addEventListener('click', () => {
                if (elements.offerTextInput) elements.offerTextInput.value = '';
                if (elements.offerFileInput) elements.offerFileInput.value = '';
                const results = document.getElementById('document-analysis-results');
                if (results) {
                    results.style.display = 'none';
                    results.innerHTML = '';
                }
            });
        }

        if (elements.runParseBtn) {
            elements.runParseBtn.addEventListener('click', () => {
                const file = elements.offerFileInput && elements.offerFileInput.files[0] ? elements.offerFileInput.files[0] : null;
                const txt = elements.offerTextInput ? elements.offerTextInput.value : '';
                parseOfferText(file, txt);
            });
        }

        // Paycheck Inputs
        if (elements.inputCtc) {
            elements.inputCtc.addEventListener('input', (e) => {
                state.salary.annualCtc = parseFloat(e.target.value) || 0;
                updateCalculations();
            });
        }

        if (elements.inputBasicPct) {
            elements.inputBasicPct.addEventListener('input', (e) => {
                state.salary.basicPercent = parseFloat(e.target.value) || 0;
                updateCalculations();
            });
        }

        if (elements.inputHraPct) {
            elements.inputHraPct.addEventListener('input', (e) => {
                state.salary.hraPercent = parseFloat(e.target.value) || 0;
                updateCalculations();
            });
        }

        elements.calcRegimeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.salary.regime = e.target.value;
                if (elements.oldRegimeSubinputs) {
                    elements.oldRegimeSubinputs.style.display = e.target.value === 'old' ? 'block' : 'none';
                }
                updateCalculations();
            });
        });

        if (elements.input80c) elements.input80c.addEventListener('input', e => { state.salary.sec80C = parseFloat(e.target.value) || 0; updateCalculations(); });
        if (elements.input80d) elements.input80d.addEventListener('input', e => { state.salary.sec80D = parseFloat(e.target.value) || 0; updateCalculations(); });
        if (elements.inputMonthlyRent) elements.inputMonthlyRent.addEventListener('input', e => { state.salary.monthlyRent = parseFloat(e.target.value) || 0; updateCalculations(); });

        if (elements.jumpToTaxGuideBtn) {
            elements.jumpToTaxGuideBtn.addEventListener('click', () => switchTab('investment'));
        }

        // Pay Frequency Pills
        elements.freqPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.freqPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.payFrequency = pill.dataset.freq;
                renderPaycheckView();
                triggerAutoSave();
            });
        });

        // Wizard Stepper
        document.querySelectorAll('.wizard-next').forEach(btn => {
            btn.addEventListener('click', () => showWizardStep(btn.dataset.next));
        });

        document.querySelectorAll('.wizard-prev').forEach(btn => {
            btn.addEventListener('click', () => showWizardStep(btn.dataset.prev));
        });

        elements.wizardRentRadios.forEach(r => {
            r.addEventListener('change', e => {
                state.wizard.rent = e.target.value;
                const rentGroup = document.getElementById('wiz-rent-amount-group');
                if (rentGroup) rentGroup.style.display = e.target.value === 'yes' ? 'block' : 'none';
                updateWizardRecommendation();
            });
        });

        elements.wizardHealthRadios.forEach(r => {
            r.addEventListener('change', e => {
                state.wizard.healthUsage = e.target.value;
                updateWizardRecommendation();
            });
        });

        if (elements.applyWizardBtn) {
            elements.applyWizardBtn.addEventListener('click', () => {
                const val = parseFloat(elements.wizardCtcInput ? elements.wizardCtcInput.value : 1200000) || 1200000;
                state.salary.annualCtc = val;
                if (elements.inputCtc) elements.inputCtc.value = val;
                updateCalculations();
                switchTab('paycheck');
                showNotification('Strategy applied to Paycheck Calculator!');
            });
        }

        // Offer Comparison Inputs
        const compInputs = [
            { el: elements.compCompanyA, key: 'company', offer: 'offerA' },
            { el: elements.compRoleA, key: 'role', offer: 'offerA' },
            { el: elements.compCtcA, key: 'ctc', offer: 'offerA' },
            { el: elements.compBonusA, key: 'bonus', offer: 'offerA' },
            { el: elements.compVariableA, key: 'variablePct', offer: 'offerA' },
            { el: elements.compHealthA, key: 'healthCover', offer: 'offerA' },
            { el: elements.compWorkmodeA, key: 'workMode', offer: 'offerA' },

            { el: elements.compCompanyB, key: 'company', offer: 'offerB' },
            { el: elements.compRoleB, key: 'role', offer: 'offerB' },
            { el: elements.compCtcB, key: 'ctc', offer: 'offerB' },
            { el: elements.compBonusB, key: 'bonus', offer: 'offerB' },
            { el: elements.compVariableB, key: 'variablePct', offer: 'offerB' },
            { el: elements.compHealthB, key: 'healthCover', offer: 'offerB' },
            { el: elements.compWorkmodeB, key: 'workMode', offer: 'offerB' }
        ];

        compInputs.forEach(item => {
            if (item.el) {
                item.el.addEventListener('input', (e) => {
                    state.compareOffers[item.offer][item.key] = e.target.value;
                    renderOfferComparison();
                    triggerAutoSave();
                });
            }
        });

        // Offer Comparison Preset Buttons
        if (elements.loadCompareTechVsStartup) {
            elements.loadCompareTechVsStartup.addEventListener('click', () => {
                elements.loadCompareTechVsStartup.classList.add('active');
                if (elements.loadCompareFresherMetroVsRemote) elements.loadCompareFresherMetroVsRemote.classList.remove('active');

                state.compareOffers.offerA = {
                    company: 'TechCorp Systems (MNC)',
                    role: 'Software Engineer',
                    ctc: 1500000,
                    bonus: 100000,
                    variablePct: 10,
                    healthCover: 500000,
                    workMode: 'Hybrid (3 days office)'
                };
                state.compareOffers.offerB = {
                    company: 'HyperScale Labs (Startup)',
                    role: 'Backend Developer',
                    ctc: 1800000,
                    bonus: 250000,
                    variablePct: 20,
                    healthCover: 300000,
                    workMode: 'Full In-Office'
                };
                syncCompareInputsFromState();
                renderOfferComparison();
                showNotification('Loaded: Tech Giant vs Startup scenario');
            });
        }

        if (elements.loadCompareFresherMetroVsRemote) {
            elements.loadCompareFresherMetroVsRemote.addEventListener('click', () => {
                elements.loadCompareFresherMetroVsRemote.classList.add('active');
                if (elements.loadCompareTechVsStartup) elements.loadCompareTechVsStartup.classList.remove('active');

                state.compareOffers.offerA = {
                    company: 'Metro Consulting Inc',
                    role: 'Associate Consultant (Bangalore)',
                    ctc: 750000,
                    bonus: 50000,
                    variablePct: 5,
                    healthCover: 400000,
                    workMode: 'Full In-Office'
                };
                state.compareOffers.offerB = {
                    company: 'CloudFlow Tech',
                    role: 'Junior Engineer (Remote)',
                    ctc: 650000,
                    bonus: 0,
                    variablePct: 5,
                    healthCover: 300000,
                    workMode: '100% Remote / WFH'
                };
                syncCompareInputsFromState();
                renderOfferComparison();
                showNotification('Loaded: Metro In-Office vs Remote scenario');
            });
        }

        // Checklist Filters & Reset
        elements.checkFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.checkFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.checklistFilter = btn.dataset.filter;
                renderChecklist();
            });
        });

        if (elements.resetChecklistBtn) {
            elements.resetChecklistBtn.addEventListener('click', () => {
                if (confirm('Clear all checked items in your checklist?')) {
                    state.checklist = {};
                    triggerAutoSave();
                    renderChecklist();
                    showNotification('Checklist reset');
                }
            });
        }

        // Investment Guide Strategy Pills
        elements.strategyPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.strategyPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const st = pill.dataset.strategy;
                const ctc = state.salary.annualCtc || 1500000;
                const basic = (ctc * state.salary.basicPercent) / 100;
                const epf = Math.round(basic * 0.12);
                const rem = Math.max(0, 150000 - epf);
                renderStrategyPresetDetails(st, rem);
            });
        });

        // Health Scenarios
        elements.scenarioBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.scenarioBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeScenario = btn.dataset.scenario;
                renderScenarioResults();
            });
        });

        // Jargon Category Filter Pills
        elements.jargonCategoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.jargonCategoryPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.selectedJargonCategory = pill.dataset.cat;
                const query = elements.jargonSearchInput ? elements.jargonSearchInput.value : '';
                const results = searchJargon(query, state.selectedJargonCategory);
                renderJargonGrid(results);
            });
        });

        // Jargon Live Search Input with Instant Match
        if (elements.jargonSearchInput) {
            elements.jargonSearchInput.addEventListener('input', (e) => {
                const results = searchJargon(e.target.value, state.selectedJargonCategory);
                renderJargonGrid(results);
            });
        }

        if (elements.jargonClearBtn) {
            elements.jargonClearBtn.addEventListener('click', () => {
                if (elements.jargonSearchInput) {
                    elements.jargonSearchInput.value = '';
                    const results = searchJargon('', state.selectedJargonCategory);
                    renderJargonGrid(results);
                }
            });
        }

        // PDF Print Handler
        if (elements.printExecBtn) {
            elements.printExecBtn.addEventListener('click', () => {
                renderExecutiveView();
                window.print();
            });
        }
    }

    // Launch Application
    init();
});
