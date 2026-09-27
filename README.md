# EmployEase — Financial Onboarding & Paycheck Matrix

> An interactive, decision-tree onboarding tool designed to eliminate anxiety for first-time earners navigating offer letters, income tax regimes, health insurance plans (deductibles vs. out-of-pocket maximums), paycheck line items, and job offer comparisons.

---

## 👥 Group Project Attribution

This project is developed as a **3-Member Group Project** by:

1. **Nitheesh** — [@nitheesh02024](https://github.com/nitheesh02024) *(Lead Developer & Project Contributor)*
2. **Gokul Srinivasan** — [@gokulsrinivasan546-ux](https://github.com/gokulsrinivasan546-ux) *(Collaborator & UX/UI Developer)*
3. **Amishi** — [@amishixx](https://github.com/amishixx) *(Collaborator & Domain Research/Developer)*

- **Live Web App on Vercel**: [financial-onboarding-tool.vercel.app](https://financial-onboarding-tool.vercel.app/)
- **GitHub Repository**: [github.com/nitheeshk02024/financial-onboarding-tool](https://github.com/nitheeshk02024/financial-onboarding-tool)

---

## 📌 Problem Statement

Navigating early employment paperwork, choosing health insurance plans (high-deductible vs. comprehensive copay plans), and understanding baseline salary deductions creates immense anxiety for first-time earners. Corporate HR packages and government tax portals are filled with dense legal jargon, while generic web calculators fail to apply directly to an individual's specific salary structure or contract type.

**EmployEase** bridges this gap by ingesting custom offer letters, translating dense legal/HR terms into plain English, comparing competing offer letters side-by-side, tracking Day-One statutory paperwork, and simulating net take-home pay and tax scenarios under different choices.

---

## ✨ Key Features & Architectural Matrix

### 1. 🌓 Dynamic Dark & Light Theme System
- Seamless toggle between **Cyber-Navy Slate (Dark Mode)** and **Crisp Executive Porcelain (Light Mode)**.
- Color preferences automatically persist in `localStorage` and adapt to system OS preferences (`prefers-color-scheme`).
- Instant theme initialization script prevents any Flash of Unstyled Content (FOUC).

### 2. 💾 Automatic Progress Saving (`localStorage`)
- Every input (CTC, Basic %, HRA %, Tax Regime, Section 80C, 80D, rent, offer comparison inputs, checklist checked items) is automatically saved to the browser's `localStorage`.
- Form progress is never lost on refresh. Includes a real-time "Saved" status badge and a one-click Reset button.

### 3. ⚖️ Head-to-Head Offer Comparison Mode
- First-time earners frequently have to choose between two offers (e.g. MNC vs. High-Growth Startup).
- Side-by-side input matrix evaluating **Fixed Base vs. Variable Pay**, **Joining Bonus**, **Health Cover**, and **Work Arrangement (Remote vs. In-Office)**.
- Calculates exact guaranteed monthly take-home differences and generates an **EmployEase AI Decision Verdict**.
- Pre-loaded comparison presets: *Tech Giant (₹15L) vs. Startup (₹18L)* and *Metro In-Office (₹7.5L) vs. Remote (₹6.5L)*.

### 4. 📝 First-Job Document & Statutory Paperwork Checklist
- 14-item categorized checklist covering all Day-One legal and payroll requirements:
  - **Identity & Banking**: PAN Card, Aadhaar (linked to mobile), Cancelled Cheque with printed name, EPFO UAN.
  - **Statutory Forms**: Form 11 (EPF declaration), Form 2 (Nomination for PF & Gratuity), Form 12BB (Investment declaration), Group Medical Nominee.
  - **Academic & BGV**: Final Degree/Provisional, Consolidated Marksheets, Relieving/NOC, Current & Permanent Address proofs.
  - **Tax Optimization**: Registered Rent Agreement & Landlord PAN for HRA, 80C and 80D investment proofs.
- Interactive progress bar with dynamic readiness score and expandable "Why is this needed?" guidance for each document.

### 5. 🌱 Section 80C & Tax-Saving Starter Guide
- Clear breakdown of 80C instruments tailored for 20-somethings:
  - **ELSS Mutual Funds**: Lowest lock-in (3 years), equity compounding, ideal for youth.
  - **Public Provident Fund (PPF)**: 15-year sovereign guarantee, EEE tax status, zero risk.
  - **National Pension System (NPS)**: Additional ₹50,000 deduction under Section 80CCD(1B).
  - **Health Mediclaim (Sec 80D)**: Up to ₹75,000 deduction for self and senior parents.
- Capacity tracker showing mandatory EPF deductions already utilized, remaining 80C headroom, and one-click allocation presets (*Wealth Maximizer*, *Balanced*, *Conservative*).

### 6. 💰 Paycheck & In-Hand Engine
- Hero Net Take-Home display with dynamic **Pay Frequency Pills** (*Monthly*, *Bi-Weekly*, *Semi-Monthly*).
- **Interactive Waterfall Chart** and **Canvas 2D Donut Ring** showing exact destination of every rupee of CTC.
- Dual-engine calculation: instantaneous zero-lag client-side tax computation (India AY 2026-27 New & Old Regimes, USA, UK/EU) with background Express backend sync.

### 7. 🛡️ Health Plan Matrix & Stress-Test
- HDHP vs. Comprehensive PPO plan comparisons with Deductible, Copay, and Out-of-Pocket Maximum breakdown.
- Healthcare Usage Simulator with 3 real-world stress-test scenarios: *Healthy Year*, *Moderate Usage*, *Major Emergency*.

### 8. 📖 Bureaucratic Jargon Translator (Enhanced Search)
- 44+ in-depth HR, contract, and tax clauses translated into plain English with practical impact and real-world examples.
- Real-time search bar with category filter pills (*Offer Letter & HR*, *Salary & In-Hand*, *Tax & Deductions*, *Health Insurance*, *Legal & Clauses*).

### 9. 📋 Executive Summary & Clean PDF / Print Export
- Executive report summarizing compensation structure, tax liabilities, and onboarding readiness.
- Dedicated `@media print` stylesheet formatted for crisp, ink-friendly A4 portrait printing and PDF generation with zero web UI clutter.

### 10. 🎨 Visual Architecture & Animations
- Clean geometric accent lines, glowing section dividers, and metric highlight borders.
- Non-hover entrance animations (`@keyframes fadeInUp`), status breathing pulses (`@keyframes livePulse`), and laser scanning lines for offer parsing.
- Touch-friendly responsive layouts optimized for mobile, tablet, and desktop screens.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties, Glassmorphism, CSS Grid/Flexbox), JavaScript ES6+, HTML5 2D Canvas API
- **State & Storage**: Client-side `localStorage` caching with debounced auto-sync
- **Backend API**: Node.js, Express.js, CORS, dotenv
- **Database Storage**: SQLite (`sqlite3`)
- **Deployment**: Vercel (Frontend SPA), Render (Express REST Backend)

---

## 🚀 How to Run the Project Locally

### 1. Running the Frontend
- Simply open `index.html` in any modern web browser, or serve it locally:
  ```bash
  # Using Python
  python -m http.server 8080

  # Or using Node
  npx serve -p 8080 .
  ```
- Access Frontend UI at `http://localhost:8080`.

### 2. Running the Backend Server (Optional)
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
├── index.html            # Main HTML5 structure with 8 interactive tabs
├── styles.css            # Fintech design system, dark/light themes, print stylesheet
├── app.js                # Core JavaScript engine (Tax, Comparison, Checklist, 80C, Jargon)
├── vercel.json           # Vercel deployment headers and routing rules
├── backend/              # Node.js Express REST Backend
│   ├── server.js         # Express server entry point & /api/health endpoint
│   ├── package.json      # Backend package dependencies
│   ├── .env.example      # Environment variables template
│   ├── config/           # Database configuration
│   ├── controllers/      # Salary, tax, document, and insurance controllers
│   ├── routes/           # REST endpoints
│   ├── services/         # Tax rules and document extraction services
│   └── utils/            # Document parsing utilities
└── README.md             # Project documentation & team attribution
```

---

## ⚠️ Financial Disclaimer

*All tax calculations, health insurance estimates, and financial projections provided by EmployEase are for decision-support, educational, and simulation purposes only. Actual net pay may vary depending on local municipal taxes, employer-specific policies, or statutory amendments. Users should verify final calculations with official government tax portals or a certified financial advisor.*
