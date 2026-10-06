# magnm Build Planner

A clean white, mobile-first planner where a client ticks the website, app and backend features they need and sees the price update live. Options that depend on others are ticked automatically (for example, any login ticks the database). The client can download their choices as a simple PDF.

- 4 pages: About, Website (15 options), Mobile app (15 options), Backend (12 options)
- Static site: plain HTML, CSS and JavaScript. No build step.
- PDF export uses a bundled copy of jsPDF (`vendor/jspdf.umd.min.js`).

## Run locally

Open `index.html` in a browser, or run `npx serve .`

## Deploy to Vercel

1. Import this repo at vercel.com/new
2. Framework preset: **Other**. Leave build command and output directory empty.
3. Deploy.

## Change prices or options

Edit the `ITEMS` table at the top of `app.js`. `p` is the price in INR and `r` lists the options it needs. Then add or remove the id in the matching `data-render` list in `index.html`.
