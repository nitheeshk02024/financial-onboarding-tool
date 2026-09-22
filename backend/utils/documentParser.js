const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extracts raw text from uploaded document buffer based on file extension / mimetype
 */
async function extractTextFromBuffer(buffer, filename, mimetype) {
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.txt' || mimetype === 'text/plain') {
        return buffer.toString('utf-8');
    }

    if (ext === '.pdf' || mimetype === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text || '';
    }

    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
    }

    throw new Error('Unsupported file format');
}

/**
 * Clean string helper to stop at newlines or common section breaks
 */
function cleanLine(val) {
    if (!val) return null;
    let s = val.split(/[\n\r]/)[0].trim();
    if (s.endsWith('.') || s.endsWith(',')) s = s.slice(0, -1).trim();
    return s || null;
}

/**
 * Parses raw text using rule-based pattern matching
 */
function parseDocumentText(text) {
    if (!text || text.trim().length === 0) {
        return {
            documentType: "Unknown Document",
            companyName: null,
            jobTitle: null,
            annualSalary: null,
            basicSalary: null,
            allowances: [],
            bonuses: [],
            taxDeductions: [],
            insurance: [],
            employeeContribution: null,
            employerContribution: null,
            joiningDate: null,
            noticePeriod: null,
            probationPeriod: null,
            explanation: [
                "The uploaded document does not contain readable text.",
                "Note: This analysis is an automated rule-based extraction for educational purposes and does not constitute legal or financial advice."
            ]
        };
    }

    const cleanText = text.replace(/\r\n/g, '\n');

    // 1. Document Type Detection
    let documentType = "Employment Document";
    if (/offer\s+letter|letter\s+of\s+offer|appointment\s+letter/i.test(cleanText)) {
        documentType = "Offer Letter";
    } else if (/employment\s+agreement|employment\s+contract/i.test(cleanText)) {
        documentType = "Employment Contract";
    } else if (/salary\s+structure|pay\s+slip|compensation\s+structure/i.test(cleanText)) {
        documentType = "Salary Structure";
    }

    // 2. Company Name Extraction
    let companyName = null;
    const companyMatch = cleanText.match(/(?:Company|Employer|Organization)\s*:\s*([^\n\r]+)/i) ||
                         cleanText.match(/Welcome\s+to\s+([^\n\r!.]+)/i) ||
                         cleanText.match(/^([A-Za-z0-9\s.,&'-]+\s+(?:Inc|Ltd|LLC|Pvt\s+Ltd|Technologies|Systems|Corp|Solutions|Services))/im);
    if (companyMatch) {
        companyName = cleanLine(companyMatch[1]);
    }

    // 3. Job Title Extraction
    let jobTitle = null;
    const titleMatch = cleanText.match(/(?:Designation|Title|Role|Position|Job\s+Title)\s*:\s*([^\n\r,]+)/i) ||
                       cleanText.match(/position\s+of\s+([^\n\r,.]+)/i) ||
                       cleanText.match(/(?:hired|appointed|offer\s+you\s+the\s+position\s+of)\s+([^\n\r,.]+)/i);
    if (titleMatch) {
        jobTitle = cleanLine(titleMatch[1]);
    }

    // 4. Annual Salary / CTC Extraction
    let annualSalary = null;
    const lpaMatch = cleanText.match(/(?:INR|Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:LPA|Lakhs\s+per\s+annum|lakhs\s+p\.a\.)/i);
    if (lpaMatch) {
        annualSalary = Math.round(parseFloat(lpaMatch[1]) * 100000);
    } else {
        const ctcMatch = cleanText.match(/(?:Annual\s+Salary|Annual\s+CTC|CTC|Total\s+Compensation|Cost\s+to\s+Company|Gross\s+Salary)\s*(?:is|of|=|:)?\s*(?:INR|Rs\.?|₹|\$)?\s*([0-9,]{4,})/i) ||
                         cleanText.match(/(?:INR|Rs\.?|₹|\$)\s*([0-9,]{5,})/i);
        if (ctcMatch) {
            const rawVal = ctcMatch[1].replace(/,/g, '');
            const parsed = parseFloat(rawVal);
            if (!isNaN(parsed) && parsed > 10000) {
                annualSalary = parsed;
            }
        }
    }

    // 5. Basic Salary Extraction
    let basicSalary = null;
    const basicMatch = cleanText.match(/(?:Basic\s+Salary|Basic\s+Pay|Basic)\s*(?:is|of|=|:)?\s*(?:INR|Rs\.?|₹|\$)?\s*([0-9,]+)/i);
    if (basicMatch) {
        const rawBasic = basicMatch[1].replace(/,/g, '');
        const parsedBasic = parseFloat(rawBasic);
        if (!isNaN(parsedBasic) && parsedBasic > 0) {
            basicSalary = parsedBasic;
        }
    }

    // 6. Allowances Detection
    const allowances = [];
    const allowancePatterns = [
        { name: "House Rent Allowance (HRA)", regex: /HRA|House\s+Rent\s+Allowance/i },
        { name: "Special Allowance", regex: /Special\s+Allowance/i },
        { name: "Conveyance Allowance", regex: /Conveyance|Transport\s+Allowance/i },
        { name: "Medical Allowance", regex: /Medical\s+Allowance/i },
        { name: "Leave Travel Allowance (LTA)", regex: /LTA|Leave\s+Travel\s+Allowance/i }
    ];
    for (const item of allowancePatterns) {
        if (item.regex.test(cleanText)) {
            allowances.push(item.name);
        }
    }

    // 7. Bonuses Detection
    const bonuses = [];
    const bonusPatterns = [
        { name: "Joining Bonus", regex: /Joining\s+Bonus|Sign-on\s+Bonus/i },
        { name: "Performance Bonus", regex: /Performance\s+Bonus|Incentive/i },
        { name: "Annual Bonus", regex: /Annual\s+Bonus/i }
    ];
    for (const item of bonusPatterns) {
        if (item.regex.test(cleanText)) {
            bonuses.push(item.name);
        }
    }

    // 8. Tax Deductions Detection
    const taxDeductions = [];
    if (/TDS|Tax\s+Deducted\s+at\s+Source|Income\s+Tax/i.test(cleanText)) {
        taxDeductions.push("Income Tax (TDS)");
    }
    if (/Professional\s+Tax|\bPT\b/i.test(cleanText)) {
        taxDeductions.push("Professional Tax");
    }

    // 9. Insurance Detection
    const insurance = [];
    if (/Health\s+Insurance|Medical\s+Insurance|Group\s+Mediclaim/i.test(cleanText)) {
        insurance.push("Health Insurance / Mediclaim");
    }
    if (/Term\s+Life\s+Insurance|Life\s+Insurance/i.test(cleanText)) {
        insurance.push("Term Life Insurance");
    }
    if (/Accident\s+Insurance|Personal\s+Accident/i.test(cleanText)) {
        insurance.push("Personal Accident Insurance");
    }

    // 10. Contributions Detection
    let employeeContribution = null;
    let employerContribution = null;
    if (/Provident\s+Fund|EPF|\bPF\b/i.test(cleanText)) {
        employeeContribution = "Provident Fund (PF) Employee Contribution";
        employerContribution = "Provident Fund (PF) Employer Contribution";
    }

    // 11. Joining Date Extraction
    let joiningDate = null;
    const dateMatch = cleanText.match(/(?:Joining\s+Date|Date\s+of\s+Joining|Start\s+Date|Report\s+on)\s*:\s*([^\n\r]+)/i) ||
                      cleanText.match(/(?:join\s+on\s+or\s+before|effective\s+from)\s+([^\n\r.]+)/i);
    if (dateMatch) {
        joiningDate = cleanLine(dateMatch[1]);
    }

    // 12. Notice Period Extraction
    let noticePeriod = null;
    const noticeMatch = cleanText.match(/(?:Notice\s+Period|Notice)\s*:\s*([^\n\r]+)/i) ||
                        cleanText.match(/([0-9]+\s*(?:days|months))\s+notice/i);
    if (noticeMatch) {
        noticePeriod = cleanLine(noticeMatch[1]);
    }

    // 13. Probation Period Extraction
    let probationPeriod = null;
    const probationMatch = cleanText.match(/(?:Probation\s+Period|Probation)\s*:\s*([^\n\r]+)/i) ||
                           cleanText.match(/([0-9]+\s*(?:months|days))\s+probation/i);
    if (probationMatch) {
        probationPeriod = cleanLine(probationMatch[1]);
    }

    // 14. Plain-Language Explanation Generation
    const explanation = [];

    if (annualSalary !== null) {
        explanation.push(`Your annual salary mentioned in the document is ₹${annualSalary.toLocaleString('en-IN')}.`);
    } else {
        explanation.push("Annual salary or CTC details were not found in the document.");
    }

    if (jobTitle) {
        explanation.push(`The designation specified is "${jobTitle}".`);
    }

    if (companyName) {
        explanation.push(`The issuing organization identified is "${companyName}".`);
    }

    if (joiningDate) {
        explanation.push(`Your expected start date is ${joiningDate}.`);
    }

    if (probationPeriod) {
        explanation.push(`A probation period of ${probationPeriod} applies to your employment.`);
    }

    if (noticePeriod) {
        explanation.push(`A notice period of ${noticePeriod} is specified for employment separation.`);
    }

    if (insurance.length > 0) {
        explanation.push(`Insurance coverage benefits mentioned: ${insurance.join(', ')}.`);
    } else {
        explanation.push("Insurance deduction or coverage details were not found in the document.");
    }

    explanation.push("Note: This analysis is an automated rule-based extraction for educational purposes and does not constitute legal or financial advice.");

    return {
        documentType,
        companyName,
        jobTitle,
        annualSalary,
        basicSalary,
        allowances,
        bonuses,
        taxDeductions,
        insurance,
        employeeContribution,
        employerContribution,
        joiningDate,
        noticePeriod,
        probationPeriod,
        explanation
    };
}

module.exports = {
    extractTextFromBuffer,
    parseDocumentText
};
