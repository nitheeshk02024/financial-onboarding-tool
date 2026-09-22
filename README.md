# EmployEase — Financial Onboarding & Paycheck Matrix

> An interactive, decision-tree onboarding tool designed to eliminate anxiety for first-time earners navigating offer letters, income tax regimes, health insurance plans (deductibles vs. out-of-pocket maximums), and paycheck line items.

---

## 👥 Group Project Attribution

This project is developed as a **3-Member Group Project** by:

1. **Nitheesh** — [@nitheesh02024](https://github.com/nitheesh02024) *(Lead Developer & Project Contributor)*
2. **Gokul Srinivasan** — [@gokulsrinivasan546-ux](https://github.com/gokulsrinivasan546-ux) *(Collaborator & UX/UI Developer)*
3. **Amishi** — [@amishixx](https://github.com/amishixx) *(Collaborator & Domain Research/Developer)*

---

## 📌 Problem Statement

Navigating early employment paperwork, choosing health insurance plans (high-deductible vs. comprehensive copay plans), and understanding baseline salary deductions creates immense anxiety for first-time earners. Corporate HR packages and government tax portals are filled with dense legal jargon, while generic web calculators fail to apply directly to an individual's specific salary structure or contract type.

**EmployEase** bridges this gap by ingesting custom offer letters, translating dense legal/HR terms into plain English, and simulating side-by-side net pay and health expenditure scenarios under different benefit choices.

---

## ✨ Key Features

1. **100% User Input Driven (No Hardcoded Base Salaries)**:
   - Annual CTC, basic salary percentages, allowances, and deduction items are 100% user-specified or parsed directly from offer letters.
2. **Indian Standards Primary Currency (INR - ₹) & Live Exchange Converter**:
   - Primary default standard is **India (₹ CTC)** formatted with Lakhs/Crores, supporting India FY 2025-26 New & Old Tax Regimes (with ₹75,000 standard deduction & Section 87A tax rebate).
   - Features dynamic real-time currency conversion across **INR (₹)**, **USD ($)**, **EUR (€)**, and **GBP (£)**.
3. **5-Mode Interactive Matrix**:
   - **🧭 Guided Wizard**: 4-step questionnaire analyzing rent, income, and medical risk profile to generate personalized tax regime and insurance recommendations.
   - **💰 Paycheck & In-Hand**: Hero Net Pay dashboard with **Pay Frequency Pills** (*Monthly*, *Bi-Weekly*, *Semi-Monthly*), **Interactive Waterfall Bar Chart**, **Canvas 2D Donut Ring**, and itemized line-item explanations.
   - **🛡️ Health Plan Matrix**: Side-by-side HDHP vs. PPO comparison cards with **Healthcare Usage Stress-Test Buttons** (*Healthy Year*, *Moderate Usage*, *Major Emergency*) calculating out-of-pocket financial exposure.
   - **📖 Jargon Translator**: Searchable glossary specifically designed for terms in **Company Offer Letters**, **HR Contracts**, **Legal Clauses**, and **Employee Benefits** (*Variable Pay*, *CTC*, *Probationary Period*, *Notice Period*, *Emoluments*, *Perquisites*, *Indemnification*, *Non-Solicitation*, *Gratuity*, *Statutory Deductions*).
   - **📋 Executive Summary**: Onboarding executive report summarizing compensation, tax, deductions, and onboarding checklist with a one-click `Print / Save PDF` action.
4. **Offer Letter Ingestion Engine**:
   - **Sample Contract Loader**: Pre-loaded with real-world offer presets (*India Tech Offer ₹15L*, *India Fresher ₹6.5L*, *US Software Engineer $95k*, *EU Developer €62k*).
   - **Custom Offer Parser**: Text area drawer for pasting raw offer text with automatic regex field extraction.
5. **Node.js & Express REST Backend**:
   - Modular Express API with CORS support, SQLite storage, database schema initialization, middleware input validation, and `/api/health` status monitoring.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Dark Glassmorphism, CSS Grid/Flexbox), JavaScript ES6+, HTML5 2D Canvas API
- **Backend API**: Node.js, Express.js, CORS, dotenv
- **Database Storage**: SQLite (`sqlite3`)

---

## 🚀 How to Run the Project Locally

### 1. Running the Frontend
- Simply open `index.html` in your web browser, or serve it locally:
  ```bash
  npx serve -p 8080 .
  ```
- Access Frontend UI at `http://localhost:8080`.

### 2. Running the Backend Server
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Verify backend health endpoint by opening:
   `http://localhost:5000/api/health`

---

## 📁 Project Structure

```
financial-onboarding-tool/
├── index.html            # Main HTML5 structure and tabbed navigation matrix
├── styles.css            # Glassmorphism design system and responsive styles
├── app.js                # Core JavaScript application engine
├── backend/              # Node.js Express REST Backend
│   ├── server.js         # Express server entry point & /api/health endpoint
│   ├── package.json      # Backend package dependencies
│   ├── .env.example      # Environment variables template
│   ├── .gitignore        # Backend git exclusions
│   ├── config/
│   │   └── database.js   # SQLite database connection & schema init
│   ├── routes/
│   │   ├── salaryRoutes.js
│   │   ├── insuranceRoutes.js
│   │   └── documentRoutes.js
│   ├── controllers/
│   │   ├── salaryController.js
│   │   ├── insuranceController.js
│   │   └── documentController.js
│   ├── services/
│   │   ├── salaryService.js
│   │   ├── taxService.js
│   │   ├── insuranceService.js
│   │   └── documentService.js
│   ├── middleware/
│   │   └── validation.js
│   └── uploads/          # Uploaded document storage
├── .gitignore            # Root repository git exclusions
└── README.md             # Project documentation & attribution
```

---

## 🔮 Future Improvements

- **Document File Upload (PDF/OCR)**: Direct drag & drop parsing of PDF offer letters using client-side WebAssembly OCR.
- **State-Level Tax Slabs**: Expansion of US state income tax calculations (e.g., California vs. Texas state tax rules).
- **ESOP / Stock Options Calculator**: Vesting schedule timeline visualizer for equity and stock options.

---

## ⚠️ Financial Disclaimer

*All tax calculations, health insurance estimates, and financial projections provided by EmployEase are for decision-support, educational, and simulation purposes only. Actual net pay may vary depending on local municipal taxes, employer-specific policies, or statutory amendments. Users should verify final calculations with official government tax portals or a certified financial advisor.*
