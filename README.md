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

---

## 🛠️ Technology Stack

- **Core Structure**: HTML5 Semantic Elements
- **Styling**: Vanilla CSS3 (Custom Design Tokens, Dark Glassmorphism, CSS Grid & Flexbox, Smooth Transitions)
- **Logic & Calculations**: Modern JavaScript (ES6+, Event-driven Architecture, Regex Ingestion Engine)
- **Visual Graphics**: HTML5 2D Canvas API (Animated Donut Chart Ring & Particle Physics System)

---

## 🚀 How to Run the Project Locally

No external build tools, bundlers, or server dependencies are required.

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone https://github.com/nitheesh02024/financial-onboarding-tool.git
   cd financial-onboarding-tool
   ```

2. **Open in Browser**:
   - Simply double-click `index.html` to open it directly in your web browser.
   - Alternatively, launch a local HTTP server using Node.js:
     ```bash
     npx serve -p 8080 .
     ```
   - Open `http://localhost:8080` in Chrome, Firefox, Safari, or Edge.

---

## 📁 Project Structure

```
financial-onboarding-tool/
├── index.html        # Main HTML5 structure and tabbed navigation matrix
├── styles.css        # Glassmorphism design system, typography, and responsive styles
├── app.js            # Core JavaScript application engine, tax calculators, and jargon search
├── .gitignore        # Version control exclusions
└── README.md         # Project documentation & collaborator attribution
```

---

## 🔮 Future Improvements

- **Document File Upload (PDF/OCR)**: Direct drag & drop parsing of PDF offer letters using client-side WebAssembly OCR.
- **State-Level Tax Slabs**: Expansion of US state income tax calculations (e.g., California vs. Texas state tax rules).
- **ESOP / Stock Options Calculator**: Vesting schedule timeline visualizer for equity and stock options.

---

## ⚠️ Financial Disclaimer

*All tax calculations, health insurance estimates, and financial projections provided by EmployEase are for decision-support, educational, and simulation purposes only. Actual net pay may vary depending on local municipal taxes, employer-specific policies, or statutory amendments. Users should verify final calculations with official government tax portals or a certified financial advisor.*
