# magnm Software Cost Planner & Quotation Engine

A clean, modern, mobile-first software cost planner and interactive quotation engine by **magnm**. Clients and team members can configure tech stacks across Web & SaaS, Mobile Apps, Backend & APIs, AI & Automation, and DevOps & Cloud Infrastructure. Options with dependencies are auto-selected (e.g. any login method auto-selects the database). Clients can instantly download their configured plan as a professional PDF.

## 🚀 Key Features

- **5 Architecture Sheets**:
  1. **About**: Team capabilities, software delivery workflow, and payment terms.
  2. **Web & SaaS**: Frontend architecture, user portals, commerce, and search.
  3. **Mobile App**: Cross-platform iOS & Android apps, biometric auth, and store deployment.
  4. **Backend & APIs**: Databases, REST/GraphQL APIs, OAuth, and admin dashboards.
  5. **AI & DevOps**: Custom AI chatbots, vector search, CI/CD pipelines, and cloud SLA maintenance.
- **Dynamic Client Routing**:
  - Main route (`/`): Universal Software Cost Planner for general clients.
  - Dedicated client route (`/clients/urban-company` or `?client=urban-company`): Preserved Urban Company-style on-demand booking platform proposal.
  - Custom client routes (`/clients/<slug>`): Customized proposals with dedicated pre-selections and scope.
- **Proposal Admin Manager (`/admin`)**:
  - Create and manage client-specific proposal pages.
  - One-click copy for shareable proposal links.
  - Export and import presets in JSON format.
- **Strict Anti-Hijacking Rules (`npm run check-rules`)**:
  - Automated tests enforce that the main page is never hijacked for a single client.
  - All client-tailored customizations live safely on `/clients/<slug>`.
- **PDF Export**:
  - Professional proposal generation with itemized breakdowns and terms using bundled jsPDF.
  - Native Android app bridge integration via Capacitor.

## 💻 Run Locally

Open `index.html` directly in a browser, or run:
```bash
npx serve .
# or
npm run build && npx serve www
```

To access different routes locally:
- General Planner: `http://localhost:3000/`
- Urban-style Pitch: `http://localhost:3000/?client=urban-company`
- Admin Manager: `http://localhost:3000/?admin=true` (or `#admin`)

## 🛠️ Verification & Building

```bash
# Verify architecture and anti-hijacking rules
npm test

# Build production distribution assets
npm run build

# Sync assets to Capacitor Android app
npm run sync
```

## 📋 Team Policy

Please see [RULES.md](RULES.md) before making modifications or tailoring proposals for new clients.
