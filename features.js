/* ============================================
   EMPLOYEASE — FEATURES ADD-ON
   Loaded after app.js. Does not modify app.js's
   internal state; talks to the same DOM so the
   existing calculators keep working untouched.
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function fire(el, type) {
        if (!el) return;
        el.dispatchEvent(new Event(type, { bubbles: true }));
    }

    function toast(msg) {
        let el = $('#save-indicator');
        if (!el) {
            el = document.createElement('div');
            el.id = 'save-indicator';
            el.className = 'save-indicator';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('show'), 1800);
    }

    /* ============================================
       1. THEME TOGGLE (light / dark)
       ============================================ */
    (function themeToggle() {
        const KEY = 'employease_theme';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle-btn';
        btn.id = 'theme-toggle-btn';
        btn.title = 'Toggle light / dark theme';
        btn.innerHTML = '<span class="theme-icon-dark">🌙</span><span class="theme-icon-light">☀️</span>';

        const navContainer = $('.nav-container');
        if (navContainer) navContainer.appendChild(btn);

        const saved = localStorage.getItem(KEY);
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');

        btn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem(KEY, 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem(KEY, 'light');
            }
        });
    })();

    /* ============================================
       2. SAVE PROGRESS (localStorage)
       ============================================ */
    (function saveProgress() {
        const KEY = 'employease_progress';
        const NUMBER_FIELDS = ['input-ctc', 'input-basic-pct', 'input-hra-pct', 'input-80c', 'input-80d', 'input-monthly-rent', 'wizard-ctc', 'wiz-monthly-rent', 'cmp-a-ctc', 'cmp-a-basic', 'cmp-a-hra', 'cmp-a-rent', 'cmp-b-ctc', 'cmp-b-basic', 'cmp-b-hra', 'cmp-b-rent'];

        function snapshot() {
            const data = { fields: {}, radios: {}, selects: {}, pills: {} };
            NUMBER_FIELDS.forEach(id => {
                const el = document.getElementById(id);
                if (el) data.fields[id] = el.value;
            });
            $$('input[type="radio"]:checked').forEach(r => { if (r.name) data.radios[r.name] = r.value; });
            $$('select[id]').forEach(s => { data.selects[s.id] = s.value; });
            const activeCountry = $('.country-pill.active');
            if (activeCountry) data.pills.country = activeCountry.dataset.country;
            const activeFreq = $('.freq-pill.active');
            if (activeFreq) data.pills.freq = activeFreq.dataset.freq;
            return data;
        }

        let saveTimer = null;
        function scheduleSave() {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                try {
                    localStorage.setItem(KEY, JSON.stringify(snapshot()));
                    toast('💾 Progress saved');
                } catch (e) { /* storage unavailable — fail silently */ }
            }, 500);
        }

        document.addEventListener('input', (e) => {
            if (e.target.closest('#main-content')) scheduleSave();
        });
        document.addEventListener('change', (e) => {
            if (e.target.closest('#main-content')) scheduleSave();
        });
        document.addEventListener('click', (e) => {
            if (e.target.closest('.country-pill, .freq-pill')) scheduleSave();
        });

        function restore() {
            let raw;
            try { raw = localStorage.getItem(KEY); } catch (e) { return; }
            if (!raw) return;
            let data;
            try { data = JSON.parse(raw); } catch (e) { return; }

            Object.entries(data.fields || {}).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val !== '' && val != null) { el.value = val; fire(el, 'input'); }
            });
            Object.entries(data.radios || {}).forEach(([name, val]) => {
                const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
                if (el) { el.checked = true; fire(el, 'change'); }
            });
            Object.entries(data.selects || {}).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) { el.value = val; fire(el, 'change'); }
            });
            if (data.pills && data.pills.country) {
                const el = document.querySelector(`.country-pill[data-country="${data.pills.country}"]`);
                if (el && !el.classList.contains('active')) el.click();
            }
            if (data.pills && data.pills.freq) {
                const el = document.querySelector(`.freq-pill[data-freq="${data.pills.freq}"]`);
                if (el && !el.classList.contains('active')) el.click();
            }
            toast('↩️ Previous progress restored');
        }

        // Restore shortly after app.js's own init has run.
        setTimeout(restore, 60);
    })();

    /* ============================================
       3. VALUE-CHANGE GLOW (paycheck hero amount)
       ============================================ */
    (function pulseOnChange() {
        const target = document.getElementById('paycheck-amount');
        if (!target || !window.MutationObserver) return;
        let last = target.textContent;
        const obs = new MutationObserver(() => {
            if (target.textContent !== last) {
                last = target.textContent;
                target.classList.remove('value-pulse');
                void target.offsetWidth; // restart animation
                target.classList.add('value-pulse');
            }
        });
        obs.observe(target, { childList: true, characterData: true, subtree: true });
    })();

    /* ============================================
       4. OFFER COMPARISON MODE
       ============================================ */
    (function offerCompare() {
        const resultsBox = document.getElementById('compare-results');
        if (!resultsBox) return;
        const ids = ['cmp-a-ctc', 'cmp-a-basic', 'cmp-a-hra', 'cmp-a-rent', 'cmp-b-ctc', 'cmp-b-basic', 'cmp-b-hra', 'cmp-b-rent'];

        function fmt(n) {
            return '₹' + Math.round(n).toLocaleString('en-IN');
        }

        // Approximate India New Regime (FY 2025-26) tax, for quick comparison only.
        function estimate(ctc, basicPct, hraPct, monthlyRent) {
            ctc = Math.max(0, Number(ctc) || 0);
            basicPct = Number(basicPct) || 50;
            hraPct = Number(hraPct) || 0;
            const basic = ctc * basicPct / 100;
            const hra = ctc * hraPct / 100;
            const epf = basic * 0.12;
            const stdDeduction = 75000;
            const taxableIncome = Math.max(0, ctc - epf - stdDeduction);
            const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
            let tax = 0, prev = 0;
            for (const [limit, rate] of slabs) {
                if (taxableIncome > prev) {
                    tax += (Math.min(taxableIncome, limit) - prev) * rate;
                    prev = limit;
                } else break;
            }
            if (taxableIncome <= 1200000) tax = 0; // Sec 87A rebate
            const totalTax = tax * 1.04; // + 4% cess
            const netAnnual = Math.max(0, ctc - epf - totalTax);
            return { ctc, basic, hra, epf, taxableIncome, totalTax, netAnnual, netMonthly: netAnnual / 12, annualRent: (Number(monthlyRent) || 0) * 12 };
        }

        function render() {
            const a = estimate($('#cmp-a-ctc').value, $('#cmp-a-basic').value, $('#cmp-a-hra').value, $('#cmp-a-rent').value);
            const b = estimate($('#cmp-b-ctc').value, $('#cmp-b-basic').value, $('#cmp-b-hra').value, $('#cmp-b-rent').value);
            const aFree = a.netAnnual - a.annualRent;
            const bFree = b.netAnnual - b.annualRent;

            const rows = [
                ['Annual CTC', fmt(a.ctc), fmt(b.ctc)],
                ['Basic Salary', fmt(a.basic), fmt(b.basic)],
                ['HRA', fmt(a.hra), fmt(b.hra)],
                ['Employee EPF (12%)', fmt(a.epf), fmt(b.epf)],
                ['Est. Annual Tax', fmt(a.totalTax), fmt(b.totalTax)],
                ['Net Annual Take-Home', fmt(a.netAnnual), fmt(b.netAnnual)],
                ['Net Monthly Take-Home', fmt(a.netMonthly), fmt(b.netMonthly)],
                ['Monthly In-Hand After Rent', fmt(aFree / 12), fmt(bFree / 12)]
            ];

            resultsBox.innerHTML = rows.map(([label, av, bv]) => {
                const highlight = label === 'Net Monthly Take-Home';
                return `<div class="compare-row${highlight ? ' compare-highlight' : ''}">
                    <span class="compare-row-label">${label}</span>
                    <span class="compare-row-a">${av}</span>
                    <span class="compare-row-b">${bv}</span>
                </div>`;
            }).join('');

            const winner = a.netMonthly === b.netMonthly ? null : (a.netMonthly > b.netMonthly ? 'A' : 'B');
            const diff = Math.abs(a.netMonthly - b.netMonthly);
            const tag = document.createElement('div');
            tag.className = 'compare-winner-tag';
            tag.textContent = winner
                ? `🏆 Offer ${winner} gives you about ${fmt(diff)} more take-home per month.`
                : 'Both offers give roughly the same monthly take-home.';
            resultsBox.appendChild(tag);
        }

        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', render);
        });
        render();
    })();

    /* ============================================
       5. FIRST-JOB DOCUMENT CHECKLIST
       ============================================ */
    (function checklist() {
        const container = document.getElementById('checklist-groups');
        if (!container) return;
        const KEY = 'employease_checklist';

        const GROUPS = [
            {
                title: '🪪 Identity & Tax IDs', sub: 'Needed before payroll can even set you up.',
                items: [
                    ['PAN Card', 'Mandatory for TDS deduction and Form 16.'],
                    ['Aadhaar Card', 'Used for identity/BGV and PF UAN linking.'],
                    ['Passport-size Photographs', 'Usually 2–4 copies for HR + ID badge.']
                ]
            },
            {
                title: '🏦 Banking', sub: 'For salary account setup.',
                items: [
                    ['Bank Account Details', 'Salary account number + IFSC code.'],
                    ['Cancelled Cheque / Passbook Copy', 'Some HR teams require this for verification.']
                ]
            },
            {
                title: '📄 Payroll & Tax Paperwork', sub: 'For accurate tax deduction from day one.',
                items: [
                    ['Form 16 (previous employer)', 'Only if you switched jobs mid-year — needed to avoid double tax exemption.'],
                    ['PF Nomination Form (Form 2)', 'Declares who receives your EPF/Gratuity in an emergency.'],
                    ['Investment Declaration (80C/80D proofs)', 'Submit early in the FY so TDS is calculated correctly.'],
                    ['Rent Agreement + Rent Receipts', 'Required if you plan to claim HRA exemption.']
                ]
            },
            {
                title: '🎓 Employment & Education Records', sub: 'For background verification.',
                items: [
                    ['Relieving / Experience Letter', 'From your previous employer, if applicable.'],
                    ['Educational Certificates & Marksheets', 'Highest qualification + any mentioned in your resume.'],
                    ['Signed Offer Letter / Employment Agreement', 'Keep a countersigned copy for your own records.']
                ]
            }
        ];

        function getChecked() {
            try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
        }
        function setChecked(map) {
            try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) { /* ignore */ }
        }

        function updateProgress() {
            const boxes = $$('.checklist-item input[type="checkbox"]');
            const done = boxes.filter(b => b.checked).length;
            const total = boxes.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            document.getElementById('checklist-progress-label').textContent = `${done} of ${total} completed`;
            document.getElementById('checklist-progress-pct').textContent = pct + '%';
            document.getElementById('checklist-progress-fill').style.width = pct + '%';
        }

        const checkedMap = getChecked();
        container.innerHTML = GROUPS.map((g, gi) => `
            <div class="glass-card checklist-group">
                <h4>${g.title}</h4>
                <p class="checklist-group-sub">${g.sub}</p>
                ${g.items.map((item, ii) => {
                    const id = `chk-${gi}-${ii}`;
                    const checked = !!checkedMap[id];
                    return `<label class="checklist-item${checked ? ' checked' : ''}" for="${id}">
                        <input type="checkbox" id="${id}" data-id="${id}" ${checked ? 'checked' : ''}>
                        <span class="checklist-item-text">${item[0]}<small>${item[1]}</small></span>
                    </label>`;
                }).join('')}
            </div>
        `).join('');

        container.addEventListener('change', (e) => {
            if (e.target.type !== 'checkbox') return;
            const map = getChecked();
            map[e.target.dataset.id] = e.target.checked;
            setChecked(map);
            e.target.closest('.checklist-item').classList.toggle('checked', e.target.checked);
            updateProgress();
        });

        updateProgress();
    })();

    /* ============================================
       6. INVESTMENT STARTER GUIDE (Section 80C/80D)
       ============================================ */
    (function investGuide() {
        const grid = document.getElementById('invest-options-grid');
        if (!grid) return;

        const OPTIONS = [
            ['EPF (Employee Provident Fund)', 'Auto-Deducted', 'Already deducted from your paycheck at 12% of Basic. Counts toward your 80C limit automatically — no extra action needed.'],
            ['PPF (Public Provident Fund)', 'Safe · 15-yr lock-in', 'Government-backed, tax-free interest. Good for long-term, low-risk savers. Minimum ₹500/year to keep active.'],
            ['ELSS Mutual Funds', 'Market-linked · 3-yr lock-in', 'Shortest lock-in of any 80C option. Higher potential returns, but value can fluctuate with the market.'],
            ['Life Insurance Premium', 'Protection + Tax Saving', 'Term insurance premiums qualify. Buy for genuine life cover, not just the tax break — avoid mixing insurance with investment.'],
            ['NSC (National Savings Certificate)', 'Safe · 5-yr lock-in', 'Fixed, government-guaranteed returns. Available at any post office.'],
            ['Home Loan Principal Repayment', 'If applicable', 'The principal portion of your EMI (not interest) qualifies under 80C, up to the overall limit.'],
            ['Section 80D — Health Insurance Premium', 'Separate ₹25,000–75,000 limit', 'Premiums for self/family health insurance are deducted separately from 80C — don\'t skip this on your declaration form.']
        ];

        grid.innerHTML = OPTIONS.map(([title, tag, desc]) => `
            <div class="glass-card invest-card">
                <span class="invest-tag">${tag}</span>
                <h4>${title}</h4>
                <p>${desc}</p>
            </div>
        `).join('');

        function syncUsage() {
            const input = document.getElementById('input-80c');
            const fill = document.getElementById('invest-80c-fill');
            const label = document.getElementById('invest-80c-label');
            if (!input || !fill || !label) return;
            const used = Math.max(0, Number(input.value) || 0);
            const limit = 150000;
            const pct = Math.min(100, Math.round((used / limit) * 100));
            fill.style.width = pct + '%';
            label.textContent = `₹${used.toLocaleString('en-IN')} of ₹1,50,000 used (${pct}%)`;
        }

        const input80c = document.getElementById('input-80c');
        if (input80c) input80c.addEventListener('input', syncUsage);
        document.querySelectorAll('.tab-btn[data-tab="invest"]').forEach(btn => btn.addEventListener('click', syncUsage));
        syncUsage();
    })();

});
