# magnm Build Planner: Team Policy & Anti-Hijacking Rules

To ensure that the public build planner serves all clients and that no individual client pitch inadvertently replaces the general agency offering, every member of the team must follow these rules.

---

## 🛡️ The 4 Core Rules

### 1. The Main Route (`/`) Is Sacred
- The root route (`/` / `index.html`) must **always** remain the generic **magnm Software Cost Planner**.
- It represents our broad technical capabilities: Full-Stack Web & SaaS, Mobile Apps (iOS & Android), Cloud Backend & APIs, AI & Automation, and DevOps & Cloud Infrastructure.
- **Never hardcode a specific client's business name, specialized marketplace model, or custom pitch into `index.html` or default planner config.**

### 2. All Client Customizations Belong on Dedicated Routes
- Whenever customizing the planner for a specific client (e.g., an on-demand booking platform, a telemedicine app, or an e-commerce brand), configure it on a dedicated route:
  - **Clean URL**: `/clients/<client-slug>` (e.g., `/clients/urban-company`)
  - **Query Fallback**: `/?client=<client-slug>`
- On a client route, the page automatically displays a custom proposal banner with an easy one-click switch back to the standard planner.

### 3. Use the Proposal Admin UI (`/admin`) or `presets.js`
- **Via Admin UI**: Visit `/admin` in your browser.
  - Click **+ New Client Route**.
  - Enter the route slug, client name, business, custom headline, and select default deliverables.
  - Copy the generated share link with one click.
- **Via Code (`presets.js`)**:
  - Add a new entry to `PLANNER_PRESETS` in `presets.js`.
  - Define custom roles, headlines, and initial feature selections.
  - Commit to version control.

### 4. Automated Verification (`npm run check-rules`)
- Before opening a PR or merging to `main`, run:
  ```bash
  npm test
  # or
  npm run check-rules
  ```
- This automated check validates:
  - `index.html` contains zero hardcoded client terms.
  - The general planner configuration is intact.
  - Preserved presets (such as `urban-company`) are healthy.
  - Route rewrites in `vercel.json` and build copying in `package.json` are properly configured.
- Automated GitHub Actions will reject any PR that violates these rules.

---

## Share Links (`/p/:id`, `/q/:id`, `/f/:id`)

- Client share links are published from **Magnm Studio** (stored in Supabase and fetched at runtime via `share/share.js` and `host/magnm-host.js`).
- Three dedicated routes map to `share.html` (never `/`):
  - `/p/<id>`: Read/present view for a published `proposal`.
  - `/q/<id>`: Interactive quote form (`proposal` or `default_quote`) with submission back to Studio.
  - `/f/<id>`: Locked final quotation (`final`) with agreed items, service plans, payment plan, and timeline.
- All share routes are **not indexed**: `share.html` includes `<meta name="robots" content="noindex,nofollow">`, and `vercel.json` serves `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, and a strict `Content-Security-Policy`.

---

## 🚀 Quick Reference

| Route | Purpose | Access |
|---|---|---|
| `/` | Universal Software Cost Planner & Quotation Engine | Public default |
| `/clients/urban-company` | Preserved on-demand services platform proposal | Client pitch |
| `/clients/<slug>` | Dynamic client-tailored proposal | Team & Client |
| `/admin` | Proposal manager, preset editor, and link generator | Internal team |
| `/p/<id>` | Published client proposal view (Studio share link) | Client (unindexed) |
| `/q/<id>` | Published interactive quote form (Studio share link) | Client (unindexed) |
| `/f/<id>` | Published locked final quotation (Studio share link) | Client (unindexed) |
