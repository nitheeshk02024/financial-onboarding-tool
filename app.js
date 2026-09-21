/* ============================================
   EMPLOYEASE — AI ONBOARDING MATRIX ENGINE
   Interactive First-Time Tax, Insurance & HR Jargon Decoder
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // APPLICATION STATE
    // ============================================
    const state = {
        activeTab: 'jargon',         // default view: 'jargon' | 'wizard' | 'paycheck' | 'health' | 'executive'
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
            meaning: 'The prerequisite rules and requirements that an employee must meet and maintain to obtain and hold their job.',
            forYou: 'Includes passing medical checks, maintaining valid work visas/permits, and adhering to office arrangements (e.g. 5 days in-office).',
            example: 'Your offer remains contingent upon maintaining valid work authorization or passing background verification.'
        },
        {
            term: 'Background Verification (BGV)',
            aliases: ['background verification', 'bgv', 'background check', 'reference check'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'A screening process where a third-party agency verifies your past work history, educational degrees, criminal record, and address history.',
            forYou: 'Any discrepancy between your resume and past company records (like fake experience letters or undisclosed employment gaps) can lead to offer revocation or immediate termination.',
            example: 'Submitting Form 26AS, relieving letters, and university degree transcripts for third-party verification.'
        },
        {
            term: 'Confirmation of Employment',
            aliases: ['confirmation of employment', 'employment confirmation', 'confirmation letter'],
            category: 'Offer Letter & HR',
            impact: 'Employment Conditions',
            meaning: 'The formal written notification issued by HR signifying successful completion of probation and transition to permanent full-time status.',
            forYou: 'Unlocks full benefits, standard notice periods, annual appraisal eligibility, and higher loan approval eligibility from banks.',
            example: 'Receiving your formal confirmation letter at month 6 with permanent designation.'
        },

        // ----- 2. SALARY / COMPENSATION TERMS -----
        {
            term: 'CTC (Cost to Company)',
            aliases: ['ctc', 'cost to company', 'annual ctc', 'package', 'total ctc'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The total annual expenditure an employer incurs on an employee. Includes your fixed salary, variable bonuses, employer PF, gratuity, and health insurance premiums.',
            forYou: 'CTC is NOT what lands in your bank account. Your monthly in-hand salary will be lower after deducting taxes, PF, and non-guaranteed variable pay.',
            example: 'On a CTC of ₹12 Lakhs, your monthly take-home might be ₹75,000 to ₹82,000 depending on deductions and variable pay payout.'
        },
        {
            term: 'Gross Salary',
            aliases: ['gross salary', 'gross pay', 'gross compensation'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The total monthly or annual pay before any employee statutory deductions (income tax, employee EPF, professional tax).',
            forYou: 'Calculated as total CTC minus employer retiral contributions (Employer PF and Gratuity). It represents your earned pay before taxes.',
            example: 'Gross Salary = Basic Salary + HRA + Special Allowance + Performance Bonus.'
        },
        {
            term: 'Net Salary / Take-Home Pay',
            aliases: ['net salary', 'take-home pay', 'in-hand salary', 'net pay', 'take home'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The actual net cash amount deposited directly into your checking account on payday after all taxes and deductions.',
            forYou: 'This is your true spending money available for rent, groceries, loan EMIs, and personal savings.',
            example: 'Gross Salary of ₹80,000 minus ₹5,000 Income Tax minus ₹2,400 EPF = Net Take-Home Pay of ₹72,600.'
        },
        {
            term: 'Fixed Pay',
            aliases: ['fixed pay', 'fixed salary', 'base salary', 'guaranteed pay'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The guaranteed base component of your salary received every single month regardless of company revenue or individual targets.',
            forYou: 'A higher fixed pay proportion provides financial security and predictable monthly cash flow.',
            example: 'In a ₹10 LPA CTC with 90% fixed pay, ₹9 Lakhs is guaranteed fixed income split into 12 monthly paychecks.'
        },
        {
            term: 'Variable Pay',
            aliases: ['variable pay', 'variable salary', 'variable component', 'performance component'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The non-guaranteed portion of your compensation tied to individual targets, team goals, or company profitability.',
            forYou: 'You should NOT assume the full variable amount is guaranteed. If targets are missed or company revenue drops, variable payout can be zero or partial.',
            example: 'If your CTC is ₹8 LPA and ₹1 LPA is variable pay, your guaranteed fixed income is only ₹7 LPA.'
        },
        {
            term: 'Performance Bonus',
            aliases: ['performance bonus', 'annual bonus', 'performance incentive'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'An additional financial reward paid annually or quarterly based on achieving specific performance appraisal targets (KPIs).',
            forYou: 'Usually paid at management discretion after annual performance reviews.',
            example: 'Receiving a 110% bonus payout for exceeding annual individual targets.'
        },
        {
            term: 'Incentive',
            aliases: ['incentive', 'sales incentive', 'commission'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'Performance-based rewards awarded for achieving short-term sales quotas, deal closures, or project milestones.',
            forYou: 'Common in sales and consulting roles; payouts fluctuate monthly or quarterly based on performance.',
            example: 'Earning ₹15,000 sales commission for every deal closed above quarterly target.'
        },
        {
            term: 'Remuneration',
            aliases: ['remuneration', 'pay package', 'compensation package'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The formal legal term for the total monetary and non-monetary rewards provided to an employee for their services.',
            forYou: 'Encompasses fixed salary, bonuses, stock options (ESOPs), medical insurance, and perks.',
            example: 'Your total remuneration package includes basic pay, medical cover, and annual ESOP grants.'
        },
        {
            term: 'Emoluments',
            aliases: ['emoluments', 'salary emoluments'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'A formal term for all salaries, fees, allowances, or profits arising from holding an office or employment.',
            forYou: 'Refers to total gross cash pay items listed on your official payslips and Form 16.',
            example: 'The appointment letter details monthly emoluments including Basic, HRA, and Special Allowance.'
        },
        {
            term: 'Allowances',
            aliases: ['allowances', 'special allowance', 'conveyance allowance', 'medical allowance'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'Specific monetary amounts paid above basic salary to meet specific expense needs (HRA, LTA, Special Allowance).',
            forYou: 'Some allowances (like HRA) offer tax exemptions, while others (like Special Allowance) are fully taxable.',
            example: 'Special Allowance is used by HR to balance the total CTC package.'
        },
        {
            term: 'Perquisites (Perks)',
            aliases: ['perquisites', 'perks', 'fringe benefits'],
            category: 'Salary & Compensation',
            impact: 'Employee Benefits & Tax',
            meaning: 'Non-cash benefits or privileges provided with a role, such as company cars, free housing, or gym memberships.',
            forYou: 'Tax regulations treat certain perquisites as taxable income based on government valuation rules.',
            example: 'Company-provided accommodation or driver is taxed as a perquisite on your Form 16.'
        },
        {
            term: 'Reimbursements',
            aliases: ['reimbursements', 'expense reimbursement', 'claimable expenses'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'Payments made by the company to repay you for official business expenses incurred out of pocket.',
            forYou: 'Reimbursements (like travel or client dinners) are non-taxable provided valid bills are submitted.',
            example: 'Claiming ₹4,500 reimbursement for official travel expenses.'
        },
        {
            term: 'Statutory Deductions',
            aliases: ['statutory deductions', 'mandatory deductions', 'statutory compliance'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'Compulsory deductions mandated by government tax and labor laws, including Income Tax (TDS), EPF, and Professional Tax.',
            forYou: 'These deductions are legally mandatory; your employer cannot waive or skip them.',
            example: 'Monthly payslip showing mandatory deductions for TDS, EPF (12%), and Professional Tax (₹200).'
        },
        {
            term: 'Salary Structure',
            aliases: ['salary structure', 'pay structure', 'ctc breakup'],
            category: 'Salary & Compensation',
            impact: 'Salary & In-Hand Pay',
            meaning: 'The detailed line-item breakdown of your CTC into Basic, HRA, Allowances, Deductions, and Retirals.',
            forYou: 'A tax-optimized salary structure maximizes tax-free allowances and boosts monthly take-home pay.',
            example: 'Reviewing your CTC breakup annexure attached to your offer letter.'
        },

        // ----- 3. LEGAL / CONTRACT TERMS -----
        {
            term: 'Confidentiality Clause',
            aliases: ['confidentiality', 'confidentiality clause', 'confidential information', 'secrecy'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A legal obligation prohibiting you from disclosing company trade secrets, customer databases, internal code, or financials to third parties.',
            forYou: 'Applies during and after employment. Sharing source code or financial metrics on social media can trigger immediate termination and lawsuits.',
            example: 'Protecting company client databases and unreleased software designs.'
        },
        {
            term: 'Non-Disclosure Agreement (NDA)',
            aliases: ['non-disclosure agreement', 'nda', 'secrecy agreement'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A formal legal agreement binding you to keep sensitive company or client information strictly confidential.',
            forYou: 'You cannot discuss client projects or proprietary algorithms with friends, family, or future employers.',
            example: 'Signing an NDA before starting work on a confidential client project.'
        },
        {
            term: 'Non-Compete Clause',
            aliases: ['non-compete', 'non-compete clause', 'non compete', 'covenant not to compete'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A clause restricting an employee from working for direct competitors or starting a competing business for a specified duration after leaving.',
            forYou: 'In India, post-employment non-competes are generally legally unenforceable under Section 27 of the Contract Act, but companies still enforce strict non-competes during active employment.',
            example: 'A clause stating you cannot join a rival tech firm for 6 months after resigning.'
        },
        {
            term: 'Non-Solicitation Clause',
            aliases: ['non-solicitation', 'non solicitation', 'non-solicit', 'poaching clause'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A clause prohibiting former employees from poaching company clients, vendors, or former colleagues to join a new company.',
            forYou: 'If you leave to join a new startup, you cannot actively convince your former colleagues or clients to move with you for a specified timeframe (e.g. 1 year).',
            example: 'A former manager getting sued for poaching 5 senior engineers from their previous employer.'
        },
        {
            term: 'Intellectual Property (IP) Assignment',
            aliases: ['intellectual property', 'ip clause', 'ip assignment', 'inventions clause'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A clause specifying that all inventions, software code, patents, and designs created by you during your employment belong 100% to the company.',
            forYou: 'Code or side-projects created using company laptops or during work hours automatically belong to your employer.',
            example: 'Software written for a company web app belongs to the company, not the developer.'
        },
        {
            term: 'Indemnification / Indemnity Clause',
            aliases: ['indemnification', 'indemnity', 'indemnify', 'indemnity clause'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'A legal obligation where one party promises to compensate/reimburse the other for financial losses, legal costs, or damages caused by wrongful acts or policy breaches.',
            forYou: 'If your intentional illegal action (e.g. software piracy or data theft) causes the company to get sued, an indemnity clause allows the company to recover legal expenses from you.',
            example: 'Holding the company harmless if your illegal actions trigger a third-party lawsuit.'
        },
        {
            term: 'Breach of Contract',
            aliases: ['breach of contract', 'contract breach', 'breach'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'Failing to perform any duty or obligation specified in your signed employment contract without a valid legal excuse.',
            forYou: 'Breaching contract terms (like absconding without serving notice) can lead to legal notices, withholding of relieving letters, or claims for damages.',
            example: 'Leaving the company overnight without submitting a formal resignation letter.'
        },
        {
            term: 'Governing Law',
            aliases: ['governing law', 'applicable law'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'Specifies which state or country laws will be used to interpret and enforce the employment contract in legal disputes.',
            forYou: 'Determines the legal framework governing your employment rights.',
            example: 'This agreement shall be governed by and construed in accordance with the laws of India.'
        },
        {
            term: 'Jurisdiction',
            aliases: ['jurisdiction', 'court jurisdiction'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'Designates the specific court location where legal proceedings must take place if a lawsuit is filed.',
            forYou: 'If a legal dispute arises, legal proceedings must be filed in the designated court city (e.g. Bangalore courts).',
            example: 'The courts at Bangalore, Karnataka shall have exclusive jurisdiction over all disputes.'
        },
        {
            term: 'Discretionary',
            aliases: ['discretionary', 'at company discretion', 'management discretion'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'Gives management full legal right to decide whether or not to grant a benefit, bonus, or policy exception without employee entitlement.',
            forYou: 'Discretionary benefits (like annual bonuses or remote work) are not guaranteed rights; management can alter or cancel them anytime.',
            example: 'Annual bonus payouts remain at the sole discretion of management.'
        },
        {
            term: 'Condition Precedent',
            aliases: ['condition precedent', 'contingent offer'],
            category: 'Legal & Contracts',
            impact: 'Employment Conditions',
            meaning: 'A prerequisite condition that must be completely satisfied before the employment agreement comes into legal effect.',
            forYou: 'Your job offer is not final until conditions (like background verification or passing medical checks) are satisfied.',
            example: 'This offer is a Condition Precedent upon receiving clean background check results.'
        },
        {
            term: 'Subject to Applicable Laws',
            aliases: ['subject to applicable laws', 'applicable laws'],
            category: 'Legal & Contracts',
            impact: 'Legal Obligations & Rights',
            meaning: 'Means contract terms are subject to local labor laws and government regulations, which override internal company policies if a conflict arises.',
            forYou: 'Company policies cannot legally violate statutory labor standards or minimum wage laws.',
            example: 'Maternity leave rules are subject to the government Maternity Benefit Act.'
        },

        // ----- 4. EMPLOYEE BENEFITS & RETIREMENT -----
        {
            term: 'Provident Fund (EPF / PF)',
            aliases: ['provident fund', 'pf', 'epf', 'employee provident fund'],
            category: 'Employee Benefits',
            impact: 'Retirement & Savings',
            meaning: 'A mandatory government-backed retirement savings scheme in India where 12% of basic salary is contributed monthly by both employee and employer.',
            forYou: 'Earns tax-free compound interest (around 8.25%/yr). The employee portion is tax-deductible under Section 80C.',
            example: 'Saving ₹3,600 monthly into your EPF account with a matching ₹3,600 employer contribution.'
        },
        {
            term: 'Gratuity',
            aliases: ['gratuity', 'gratuity pay', 'payment of gratuity'],
            category: 'Employee Benefits',
            impact: 'Retirement & Benefits',
            meaning: 'A lump-sum statutory benefit paid by an employer to employees who complete at least 5 years of continuous service in the organization.',
            forYou: 'Calculated as 15 days of last drawn basic salary for every year worked. It is a reward for long-term loyalty.',
            example: 'Receiving a tax-exempt gratuity lump sum of ₹3.5 Lakhs after 6 years of continuous service.'
        },
        {
            term: 'Health Insurance Premium',
            aliases: ['health insurance', 'premium', 'group medical cover', 'gmc', 'medical insurance'],
            category: 'Employee Benefits',
            impact: 'Employee Benefits',
            meaning: 'Corporate group health insurance coverage provided by the employer to cover hospitalization expenses for you and dependents.',
            forYou: 'Employer-paid premiums are a valuable pre-tax benefit. You should verify sum insured limits (e.g. ₹5 Lakhs cover).',
            example: 'Group Medical Coverage (GMC) covering hospitalization up to ₹5,00,000 annually.'
        },
        {
            term: 'Deductible',
            aliases: ['deductible', 'annual deductible'],
            category: 'Employee Benefits',
            impact: 'Employee Benefits',
            meaning: 'The initial out-of-pocket amount you must pay for medical services before health insurance starts paying.',
            forYou: 'With a ₹20,000 deductible, you pay the first ₹20,000 of medical bills yourself before insurance coverage kicks in.',
            example: 'Paying the initial ₹10,000 hospital bill yourself before the insurance policy starts paying.'
        },
        {
            term: 'Co-pay / Co-insurance',
            aliases: ['co-pay', 'copay', 'coinsurance', 'co-insurance'],
            category: 'Employee Benefits',
            impact: 'Employee Benefits',
            meaning: 'Your percentage share (e.g. 15%) of covered healthcare costs after meeting your annual deductible.',
            forYou: 'Lower copay percentage means insurance pays a higher portion of your medical claims.',
            example: 'If a medical bill is ₹50,000 and copay is 10%, you pay ₹5,000 and insurance pays ₹45,000.'
        },
        {
            term: 'Out-of-Pocket Maximum',
            aliases: ['out-of-pocket maximum', 'out of pocket max', 'oop max'],
            category: 'Employee Benefits',
            impact: 'Employee Benefits',
            meaning: 'The absolute maximum limit on what you will pay out of your own pocket for covered medical care in a plan year.',
            forYou: 'Once reached, insurance pays 100% of covered medical costs, protecting you from financial ruin.',
            example: 'If your OOP Max is ₹50,000, insurance pays 100% of all eligible medical costs after your total payments hit ₹50,000.'
        },
        {
            term: 'Beneficiary',
            aliases: ['beneficiary', 'nominee'],
            category: 'Employee Benefits',
            impact: 'Retirement & Benefits',
            meaning: 'The person designated by you to receive your employee insurance payouts, provident fund, or gratuity in the event of your death.',
            forYou: 'Always ensure your EPF and corporate insurance nominee details are updated in HR portals.',
            example: 'Naming your spouse or parent as the 100% beneficiary for EPF and group term life insurance.'
        },
        {
            term: 'Employer Contribution',
            aliases: ['employer contribution', 'company contribution'],
            category: 'Employee Benefits',
            impact: 'Retirement & Savings',
            meaning: 'The money contributed by your employer towards your benefits (such as Employer EPF 12% contribution or 401k matching) above your basic salary.',
            forYou: 'Form part of your CTC package and build long-term retirement wealth.',
            example: 'Employer contributing ₹3,600 monthly to match your EPF savings.'
        }
    ];

    // Sample Offers Presets
    const SAMPLE_OFFERS = {
        'india-sde': { country: 'india', ctc: 1500000, basicPct: 50, hraPct: 20, epfPct: 12 },
        'india-fresher': { country: 'india', ctc: 650000, basicPct: 50, hraPct: 20, epfPct: 12 },
        'us-swe': { country: 'usa', ctc: 95000, basicPct: 75, hraPct: 15, epfPct: 5 },
        'eu-dev': { country: 'europe', ctc: 62000, basicPct: 70, hraPct: 15, epfPct: 8 }
    };

    // DOM Elements
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

        // Wizard
        wizardCards: document.querySelectorAll('.wizard-card'),
        wizardCtcInput: document.getElementById('wizard-ctc'),
        wizardRecommendationBox: document.getElementById('wizard-recommendation-box'),
        applyWizardBtn: document.getElementById('apply-wizard-btn'),

        // Health Matrix
        healthPlansContainer: document.getElementById('health-plans-container'),
        scenarioBtns: document.querySelectorAll('.scenario-btn'),
        scenarioResultsGrid: document.getElementById('scenario-results-grid'),

        // Jargon Translator
        jargonCategoryPills: document.querySelectorAll('.category-pill'),
        jargonSearchInput: document.getElementById('jargon-search-input'),
        jargonGrid: document.getElementById('jargon-grid'),

        // Executive
        execCompSummary: document.getElementById('exec-comp-summary'),
        execTaxSummary: document.getElementById('exec-tax-summary'),
        execDateStamp: document.getElementById('exec-date-stamp'),
        printExecBtn: document.getElementById('print-exec-btn'),

        // Tooltip
        tooltip: document.getElementById('tooltip'),
        tooltipContent: document.getElementById('tooltip-content')
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        setupEventListeners();
        setupParticleCanvas();
        renderJargonGrid(JARGON_DATABASE);
        updateCalculations();
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
        if (tabName === 'health') renderHealthView();
        if (tabName === 'executive') renderExecutiveView();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================
    // CALCULATIONS & FINANCIAL ENGINES
    // ============================================
    function updateCalculations() {
        const ctc = state.salary.annualCtc || 0;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';
        const basic = (ctc * state.salary.basicPercent) / 100;
        const hra = (ctc * state.salary.hraPercent) / 100;
        const epf = (basic * state.salary.epfPercent) / 100;

        let incomeTax = 0;
        let taxableIncome = ctc;

        if (state.country === 'india') {
            if (state.salary.regime === 'new') {
                const stdDeduction = 75000;
                taxableIncome = Math.max(0, ctc - stdDeduction);
                if (taxableIncome <= 700000) {
                    incomeTax = 0;
                } else {
                    if (taxableIncome > 300000) incomeTax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
                    if (taxableIncome > 700000) incomeTax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
                    if (taxableIncome > 1000000) incomeTax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
                    if (taxableIncome > 1200000) incomeTax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
                    if (taxableIncome > 1500000) incomeTax += (taxableIncome - 1500000) * 0.30;
                    incomeTax *= 1.04;
                }
            } else {
                const stdDeduction = 50000;
                const sec80C = Math.min(150000, state.salary.sec80C || 0);
                const sec80D = Math.min(75000, state.salary.sec80D || 0);
                const annualRent = (state.salary.monthlyRent || 0) * 12;
                const hraExemption = Math.min(hra, Math.max(0, annualRent - 0.1 * basic), 0.5 * basic);
                
                taxableIncome = Math.max(0, ctc - stdDeduction - sec80C - sec80D - hraExemption);
                if (taxableIncome <= 500000) {
                    incomeTax = 0;
                } else {
                    if (taxableIncome > 250000) incomeTax += (Math.min(taxableIncome, 500000) - 250000) * 0.05;
                    if (taxableIncome > 500000) incomeTax += (Math.min(taxableIncome, 1000000) - 500000) * 0.20;
                    if (taxableIncome > 1000000) incomeTax += (taxableIncome - 1000000) * 0.30;
                    incomeTax *= 1.04;
                }
            }
        } else if (state.country === 'usa') {
            const stdDeduction = 14600;
            const contrib401k = ctc * 0.05;
            taxableIncome = Math.max(0, ctc - stdDeduction - contrib401k);
            let fedTax = 0;
            if (taxableIncome > 11600) fedTax += (Math.min(taxableIncome, 47150) - 11600) * 0.12;
            if (taxableIncome > 47150) fedTax += (taxableIncome - 47150) * 0.22;
            const fica = ctc * 0.0765;
            incomeTax = fedTax + fica + (ctc * 0.05);
        } else {
            incomeTax = ctc > 11000 ? (ctc - 11000) * 0.30 : 0;
        }

        const annualTakeHome = Math.max(0, ctc - incomeTax - epf);

        let conversionRate = 1;
        if (state.country === 'india' && state.targetCurrency === 'USD') conversionRate = 1 / state.exchangeRates.INR;
        if (state.country === 'india' && state.targetCurrency === 'EUR') conversionRate = state.exchangeRates.EUR / state.exchangeRates.INR;
        if (state.country === 'usa' && state.targetCurrency === 'INR') conversionRate = state.exchangeRates.INR;
        if (state.country === 'usa' && state.targetCurrency === 'EUR') conversionRate = state.exchangeRates.EUR;

        const convertedAnnualCtc = ctc * conversionRate;
        elements.convertedTotalDisplay.textContent = `= ${sym}${Math.round(convertedAnnualCtc).toLocaleString()} /yr`;

        state.activeCalc = { ctc, basic, hra, epf, taxableIncome, incomeTax, annualTakeHome };
        renderPaycheckView();
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

        elements.paycheckAmount.textContent = `${sym}${Math.round(periodNet).toLocaleString()}`;
        elements.paycheckSubtitle.textContent = `Actual net cash landing in your checking account every ${periodLabel} (${sym}${Math.round(calc.annualTakeHome).toLocaleString()}/year).`;

        const getBarWidth = (val) => `${Math.max(4, Math.min(100, (val / (calc.ctc || 1)) * 100)).toFixed(1)}%`;
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
                <span class="waterfall-label">Provident Fund</span>
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

        renderDonutChart(calc.annualTakeHome, calc.incomeTax, calc.epf, calc.ctc);

        elements.lineItemsList.innerHTML = `
            <div class="line-item-row">
                <div>
                    <span class="line-item-title">Gross Salary (CTC)</span>
                    <span class="line-item-sub">Total compensation promised by employer</span>
                </div>
                <span class="line-item-val val-addition">${sym}${Math.round(calc.ctc).toLocaleString()}</span>
            </div>
            <div class="line-item-row">
                <div>
                    <span class="line-item-title">Income Tax & Cess</span>
                    <span class="line-item-sub">Direct tax based on taxable income of ${sym}${Math.round(calc.taxableIncome).toLocaleString()}</span>
                </div>
                <span class="line-item-val val-deduction">− ${sym}${Math.round(calc.incomeTax).toLocaleString()}</span>
            </div>
            ${calc.epf > 0 ? `
            <div class="line-item-row">
                <div>
                    <span class="line-item-title">Provident Fund (EPF)</span>
                    <span class="line-item-sub">Mandatory 12% basic salary saved in your retirement account</span>
                </div>
                <span class="line-item-val val-deduction">− ${sym}${Math.round(calc.epf).toLocaleString()}</span>
            </div>
            ` : ''}
            <div class="line-item-row" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2);">
                <div>
                    <span class="line-item-title" style="color:var(--accent-emerald);">Net Take-Home Pay</span>
                    <span class="line-item-sub">Cash received in your bank account annually</span>
                </div>
                <span class="line-item-val" style="color:var(--accent-emerald); font-size:1.1rem;">${sym}${Math.round(calc.annualTakeHome).toLocaleString()} / yr</span>
            </div>
        `;
    }

    function renderDonutChart(takeHome, tax, pf, ctc) {
        const canvas = elements.donutChart;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        const innerRadius = radius - 30;

        const data = [
            { label: 'In-Hand Pay', value: takeHome, color: '#10b981' },
            { label: 'Income Tax', value: tax, color: '#ef4444' },
            { label: 'Retirement (PF)', value: pf, color: '#8b5cf6' }
        ].filter(d => d.value > 0);

        const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
        ctx.clearRect(0, 0, width, height);

        let startAngle = -Math.PI / 2;
        data.forEach(slice => {
            const sliceAngle = (slice.value / total) * (Math.PI * 2);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
            startAngle += sliceAngle;
        });

        const pct = Math.round((takeHome / total) * 100);
        elements.donutCenter.innerHTML = `
            <div style="font-size:1.4rem; color:var(--accent-emerald);">${pct}%</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">In-Hand</div>
        `;

        elements.donutLegend.innerHTML = data.map(d => `
            <div class="legend-item">
                <span class="legend-dot" style="background:${d.color}"></span>
                <span>${d.label}: ${Math.round((d.value / total) * 100)}%</span>
            </div>
        `).join('');
    }

    // ============================================
    // HEALTH MATRIX RENDERER (USER EDITABLE INPUTS)
    // ============================================
    function renderHealthView() {
        const sym = state.currencySymbols[state.targetCurrency] || '₹';
        
        let html = '';
        state.healthPlans.forEach(plan => {
            const annualPremium = (plan.monthlyPremium || 0) * 12;
            const worstCaseCost = annualPremium + (plan.outOfPocketMax || 0);

            html += `
                <div class="health-plan-card" data-plan-id="${plan.id}">
                    <div class="plan-header">
                        <div class="plan-title">${plan.name}</div>
                        <span class="brand-badge">${plan.type}</span>
                    </div>

                    <!-- Editable User Inputs -->
                    <div class="form-grid margin-top-md">
                        <div class="form-group">
                            <label for="plan-input-${plan.id}-premium">Monthly Premium (${sym})</label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">${sym}</span>
                                <input type="number" id="plan-input-${plan.id}-premium" class="form-input health-plan-input" data-plan-id="${plan.id}" data-field="monthlyPremium" value="${plan.monthlyPremium}" min="0" step="100">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="plan-input-${plan.id}-deductible">Annual Deductible (${sym}) <span class="jargon" data-term="Deductible">ⓘ</span></label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">${sym}</span>
                                <input type="number" id="plan-input-${plan.id}-deductible" class="form-input health-plan-input" data-plan-id="${plan.id}" data-field="annualDeductible" value="${plan.annualDeductible}" min="0" step="1000">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="plan-input-${plan.id}-copay">Co-pay Share (%) <span class="jargon" data-term="Co-pay / Co-insurance">ⓘ</span></label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">%</span>
                                <input type="number" id="plan-input-${plan.id}-copay" class="form-input health-plan-input" data-plan-id="${plan.id}" data-field="copayPercent" value="${plan.copayPercent}" min="0" max="100" step="1">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="plan-input-${plan.id}-oop">Out-of-Pocket Max (${sym}) <span class="jargon" data-term="Out-of-Pocket Maximum">ⓘ</span></label>
                            <div class="input-with-prefix">
                                <span class="input-prefix">${sym}</span>
                                <input type="number" id="plan-input-${plan.id}-oop" class="form-input health-plan-input" data-plan-id="${plan.id}" data-field="outOfPocketMax" value="${plan.outOfPocketMax}" min="0" step="1000">
                            </div>
                        </div>
                    </div>

                    <!-- Validation Error Message Display -->
                    <div class="plan-validation-msg margin-top-sm" id="val-msg-${plan.id}" style="display:none; color:var(--accent-red); font-size:0.82rem; font-weight:600;"></div>

                    <!-- Calculated Summaries -->
                    <div class="plan-stats-summary margin-top-md" style="padding-top:12px; border-top:1px dashed var(--border-subtle);">
                        <div class="plan-stat">
                            <span>Annual Premium (12 mos):</span>
                            <span class="plan-stat-val" id="calc-premium-${plan.id}" style="color:var(--accent-amber);">${sym}${annualPremium.toLocaleString()}/yr</span>
                        </div>
                        <div class="plan-stat" style="margin-top:6px;">
                            <span>Worst-Case Annual Cost:</span>
                            <span class="plan-stat-val" id="calc-worst-${plan.id}" style="color:var(--accent-red);">${sym}${worstCaseCost.toLocaleString()}/yr</span>
                        </div>
                    </div>
                </div>
            `;
        });

        elements.healthPlansContainer.innerHTML = html;
        attachHealthInputListeners();
        renderScenarioResults();
    }

    function attachHealthInputListeners() {
        const inputs = elements.healthPlansContainer.querySelectorAll('.health-plan-input');
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const planId = e.target.dataset.planId;
                const field = e.target.dataset.field;
                const val = parseFloat(e.target.value);
                const valMsg = document.getElementById(`val-msg-${planId}`);

                const plan = state.healthPlans.find(p => p.id === planId);
                if (!plan) return;

                let isValid = true;
                let errorText = '';

                if (isNaN(val)) {
                    isValid = false;
                    errorText = '⚠️ Please enter a valid number.';
                } else if (field === 'monthlyPremium' && val < 0) {
                    isValid = false;
                    errorText = '⚠️ Monthly Premium must be 0 or greater.';
                } else if (field === 'annualDeductible' && val < 0) {
                    isValid = false;
                    errorText = '⚠️ Annual Deductible must be 0 or greater.';
                } else if (field === 'outOfPocketMax' && val < 0) {
                    isValid = false;
                    errorText = '⚠️ Out-of-Pocket Maximum must be 0 or greater.';
                } else if (field === 'copayPercent' && (val < 0 || val > 100)) {
                    isValid = false;
                    errorText = '⚠️ Co-pay percentage must be between 0% and 100%.';
                }

                if (!isValid) {
                    if (valMsg) {
                        valMsg.textContent = errorText;
                        valMsg.style.display = 'block';
                    }
                    e.target.style.borderColor = 'var(--accent-red)';
                    return;
                }

                if (valMsg) {
                    valMsg.style.display = 'none';
                }
                e.target.style.borderColor = '';

                // Update state
                plan[field] = val;

                // Recalculate card highlights
                const annualPremium = (plan.monthlyPremium || 0) * 12;
                const worstCaseCost = annualPremium + (plan.outOfPocketMax || 0);

                const premiumDisplay = document.getElementById(`calc-premium-${planId}`);
                const worstDisplay = document.getElementById(`calc-worst-${planId}`);

                if (premiumDisplay) premiumDisplay.textContent = `${sym}${annualPremium.toLocaleString()}/yr`;
                if (worstDisplay) worstDisplay.textContent = `${sym}${worstCaseCost.toLocaleString()}/yr`;

                // Recalculate scenario stress test results
                renderScenarioResults();
            });
        });
    }

    function renderScenarioResults() {
        const sym = state.currencySymbols[state.targetCurrency] || '₹';
        const sc = state.activeScenario;

        let html = '';
        state.healthPlans.forEach(plan => {
            const annualPremium = (plan.monthlyPremium || 0) * 12;
            let medicalBill = 0;
            if (sc === 'healthy') medicalBill = 2000;
            if (sc === 'moderate') medicalBill = 25000;
            if (sc === 'catastrophic') medicalBill = 200000;

            let outOfPocketPaid = 0;
            if (medicalBill > 0) {
                const annualDeductible = plan.annualDeductible || 0;
                const copayPercent = plan.copayPercent || 0;
                const outOfPocketMax = plan.outOfPocketMax || 0;

                const afterDeductible = Math.max(0, medicalBill - annualDeductible);
                const copayPaid = afterDeductible * (copayPercent / 100);
                outOfPocketPaid = Math.min(outOfPocketMax, Math.min(medicalBill, annualDeductible) + copayPaid);
            }

            const totalAnnualImpact = annualPremium + outOfPocketPaid;

            html += `
                <div class="scenario-res-card">
                    <div class="sc-res-title">${plan.name}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:6px;">Total Annual Financial Impact</div>
                    <div class="sc-res-val">${sym}${Math.round(totalAnnualImpact).toLocaleString()}</div>
                    <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:6px;">
                        (${sym}${annualPremium.toLocaleString()} Premium + ${sym}${Math.round(outOfPocketPaid).toLocaleString()} Medical)
                    </div>
                </div>
            `;
        });

        elements.scenarioResultsGrid.innerHTML = html;
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

        // Clean Natural Language Questions
        let cleanQ = q.toLowerCase()
            .replace(/what is a|what is an|what is|what does|what do|mean in my offer letter|mean in offer letter|mean in contract|mean in salary|mean|clause|explain|tell me about|in an offer letter|in contract|in hr/g, '')
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
                score += 10;
            }

            if (score > 0) {
                scored.push({ item, score });
            }
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.item);
    }

    function renderJargonGrid(data) {
        if (!data || data.length === 0) {
            elements.jargonGrid.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 40px;">
                    <h3 style="color:var(--accent-amber);">No Matching HR / Employment Terms Found</h3>
                    <p style="color:var(--text-muted); margin-top:8px;">Try searching terms like "Variable Pay", "CTC", "Notice Period", "Probationary Period", or "Indemnification".</p>
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
    // EXECUTIVE SUMMARY RENDERER
    // ============================================
    function renderExecutiveView() {
        if (!state.activeCalc) return;
        const calc = state.activeCalc;
        const sym = state.currencySymbols[state.targetCurrency] || '₹';

        elements.execDateStamp.textContent = `Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        elements.execCompSummary.innerHTML = `
            <div class="line-item-row">
                <span>Selected Jurisdiction:</span>
                <span style="font-weight:700;">${state.country.toUpperCase()} (${state.salary.regime.toUpperCase()} Tax Regime)</span>
            </div>
            <div class="line-item-row">
                <span>Gross Annual CTC:</span>
                <span style="font-weight:700; color:var(--accent-cyan);">${sym}${Math.round(calc.ctc).toLocaleString()}</span>
            </div>
            <div class="line-item-row">
                <span>Monthly Net Take-Home:</span>
                <span style="font-weight:700; color:var(--accent-emerald);">${sym}${Math.round(calc.annualTakeHome / 12).toLocaleString()} / mo</span>
            </div>
        `;

        elements.execTaxSummary.innerHTML = `
            <div class="line-item-row">
                <span>Taxable Salary Base:</span>
                <span>${sym}${Math.round(calc.taxableIncome).toLocaleString()}</span>
            </div>
            <div class="line-item-row">
                <span>Annual Tax & Cess:</span>
                <span style="color:var(--accent-red);">${sym}${Math.round(calc.incomeTax).toLocaleString()}</span>
            </div>
            <div class="line-item-row">
                <span>Effective Tax Rate:</span>
                <span>${((calc.incomeTax / (calc.ctc || 1)) * 100).toFixed(1)}%</span>
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS & HANDLERS
    // ============================================
    function setupEventListeners() {
        // Tab Buttons
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

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
        elements.currencySelect.addEventListener('change', (e) => {
            state.targetCurrency = e.target.value;
            elements.inputCurrSymbol.textContent = state.currencySymbols[state.targetCurrency] || '₹';
            updateCalculations();
        });

        // Sample Offer Selector
        elements.sampleOfferSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if (SAMPLE_OFFERS[key]) {
                const preset = SAMPLE_OFFERS[key];
                state.country = preset.country;
                state.salary.annualCtc = preset.ctc;
                state.salary.basicPercent = preset.basicPct;
                state.salary.hraPercent = preset.hraPct;
                
                elements.inputCtc.value = preset.ctc;
                elements.inputBasicPct.value = preset.basicPct;
                elements.inputHraPct.value = preset.hraPct;

                elements.countryPills.forEach(p => {
                    if (p.dataset.country === preset.country) p.classList.add('active');
                    else p.classList.remove('active');
                });

                updateCalculations();
                showNotification(`Loaded sample contract: ${key}`);
            }
        });

        // Parser Drawer Toggle
        elements.toggleParserBtn.addEventListener('click', () => {
            const isHidden = elements.parserDrawer.style.display === 'none';
            elements.parserDrawer.style.display = isHidden ? 'block' : 'none';
        });

        elements.closeDrawerBtn.addEventListener('click', () => {
            elements.parserDrawer.style.display = 'none';
        });

        elements.clearOfferTextBtn.addEventListener('click', () => {
            elements.offerTextInput.value = '';
        });

        elements.runParseBtn.addEventListener('click', () => {
            const txt = elements.offerTextInput.value;
            if (txt) {
                parseOfferText(txt);
                elements.parserDrawer.style.display = 'none';
            }
        });

        // Paycheck Inputs
        elements.inputCtc.addEventListener('input', (e) => {
            state.salary.annualCtc = parseFloat(e.target.value) || 0;
            updateCalculations();
        });

        elements.inputBasicPct.addEventListener('input', (e) => {
            state.salary.basicPercent = parseFloat(e.target.value) || 0;
            updateCalculations();
        });

        elements.inputHraPct.addEventListener('input', (e) => {
            state.salary.hraPercent = parseFloat(e.target.value) || 0;
            updateCalculations();
        });

        elements.calcRegimeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.salary.regime = e.target.value;
                elements.oldRegimeSubinputs.style.display = e.target.value === 'old' ? 'block' : 'none';
                updateCalculations();
            });
        });

        if (elements.input80c) elements.input80c.addEventListener('input', e => { state.salary.sec80C = parseFloat(e.target.value) || 0; updateCalculations(); });
        if (elements.input80d) elements.input80d.addEventListener('input', e => { state.salary.sec80D = parseFloat(e.target.value) || 0; updateCalculations(); });
        if (elements.inputMonthlyRent) elements.inputMonthlyRent.addEventListener('input', e => { state.salary.monthlyRent = parseFloat(e.target.value) || 0; updateCalculations(); });

        // Pay Frequency Pills
        elements.freqPills.forEach(pill => {
            pill.addEventListener('click', () => {
                elements.freqPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.payFrequency = pill.dataset.freq;
                renderPaycheckView();
            });
        });

        // Wizard Steps Next / Prev
        document.querySelectorAll('.wizard-next').forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStep = btn.dataset.next;
                showWizardStep(nextStep);
            });
        });

        document.querySelectorAll('.wizard-prev').forEach(btn => {
            btn.addEventListener('click', () => {
                const prevStep = btn.dataset.prev;
                showWizardStep(prevStep);
            });
        });

        if (elements.applyWizardBtn) {
            elements.applyWizardBtn.addEventListener('click', () => {
                const val = parseFloat(elements.wizardCtcInput.value) || 1200000;
                state.salary.annualCtc = val;
                elements.inputCtc.value = val;
                updateCalculations();
                switchTab('paycheck');
                showNotification('Personalized plan applied to Paycheck Calculator!');
            });
        }

        // Scenario Buttons
        elements.scenarioBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.scenarioBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.activeScenario = btn.dataset.scenario;
                renderScenarioResults();
            });
        });

        // Jargon Category Filter Pills
        if (elements.jargonCategoryPills) {
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
        }

        // Jargon Search Input (Live Natural Language Matching)
        if (elements.jargonSearchInput) {
            elements.jargonSearchInput.addEventListener('input', (e) => {
                const results = searchJargon(e.target.value, state.selectedJargonCategory);
                renderJargonGrid(results);
            });
        }

        // Print Exec
        if (elements.printExecBtn) {
            elements.printExecBtn.addEventListener('click', () => window.print());
        }
    }

    function showWizardStep(stepNum) {
        elements.wizardCards.forEach(card => {
            if (card.dataset.wizardStep === stepNum) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        if (stepNum === '4') {
            const rentChoice = document.querySelector('input[name="wiz-rent"]:checked')?.value || 'yes';
            const healthChoice = document.querySelector('input[name="wiz-health"]:checked')?.value || 'low';
            
            elements.wizardRecommendationBox.innerHTML = `
                <div style="font-weight:700; color:var(--accent-emerald); font-size:1.1rem; margin-bottom:8px;">
                    💡 Optimization Recommendation:
                </div>
                <p style="font-size:0.9rem; line-height:1.7;">
                    ${rentChoice === 'yes' ? 
                        '• <strong>Tax Regime:</strong> You pay rent! The <strong>Old Tax Regime</strong> will likely save you significant tax if you submit your rent receipts for HRA exemption and max out Section 80C.' :
                        '• <strong>Tax Regime:</strong> Since you do not pay rent, the <strong>New Tax Regime (FY 2025-26)</strong> offers lower overall tax rates and zero paperwork.'
                    }
                    <br><br>
                    ${healthChoice === 'low' ? 
                        '• <strong>Health Insurance:</strong> Based on low medical usage, a <strong>High Deductible Health Plan (HDHP)</strong> paired with a tax-free savings account offers the lowest monthly financial outflow.' :
                        '• <strong>Health Insurance:</strong> Based on moderate to high medical usage, a <strong>Comprehensive PPO Plan</strong> with lower deductibles is safer to prevent large unexpected out-of-pocket bills.'
                    }
                </p>
            `;
        }
    }

    function parseOfferText(txt) {
        const cleaned = txt.replace(/,/g, '');
        const ctcMatch = cleaned.match(/(?:CTC|Cost to Company|Gross|Package|Salary)[\s:=₹$€]*([\d.]+)/i);
        if (ctcMatch) {
            let val = parseFloat(ctcMatch[1]);
            if (val < 500) val *= 100000;
            state.salary.annualCtc = val;
            elements.inputCtc.value = val;
            updateCalculations();
            showNotification('Offer text parsed and annual CTC updated!');
        }
    }

    function setupParticleCanvas() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                color: `rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1})`,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    function showNotification(msg) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 10000;
            background: rgba(15, 23, 42, 0.95); border: 1px solid var(--accent-indigo);
            color: white; padding: 12px 20px; border-radius: 12px; font-size: 0.88rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
            animation: fadeInUp 0.3s ease-out;
        `;
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3500);
    }

    // Start App
    init();
});
