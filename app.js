/* magnm Build Planner
   Prices are in INR. Edit the ITEMS table to change names, prices or dependencies ("r" lists what an option needs). */

var ITEMS = {
  /* ---------- Website (15) ---------- */
  w_front:   { g: "Website", n: "Frontend only", d: "Mobile-first, fully responsive site. Home, services, about and contact, up to 6 pages.", p: 6000, r: [] },
  w_anim:    { g: "Website", n: "Advanced animations", d: "Smooth scroll effects, page transitions and hover motion.", p: 2000, r: ["w_front"] },
  w_lang:    { g: "Website", n: "Hindi and English switch", d: "Visitors flip the whole site between two languages.", p: 600, r: ["w_front"] },
  w_gallery: { g: "Website", n: "Service pages with photo gallery", d: "A page for each service with photos, details and what is included.", p: 500, r: ["w_front"] },
  w_book:    { g: "Website", n: "Service booking and slot picker", d: "Customers choose a service, a date and a time, and the booking is saved.", p: 1500, r: ["w_front", "b_db", "b_admin"] },
  w_shop:    { g: "Website", n: "Online shop", d: "Products, cart and checkout for things you sell.", p: 3000, r: ["w_front", "b_db", "b_pay", "b_admin"] },
  w_account: { g: "Website", n: "Customer account and booking history", d: "Customers see past and upcoming bookings and rebook in one tap.", p: 900, r: ["w_front", "b_db"] },
  w_search:  { g: "Website", n: "Search and filters", d: "Find a service by name, category or price.", p: 600, r: ["w_front"] },
  w_coupon:  { g: "Website", n: "Coupon box at checkout", d: "Customers type a code and the discount is applied.", p: 500, r: ["w_front", "b_coupon"] },
  w_reviews: { g: "Website", n: "Ratings and reviews on the site", d: "Star ratings and written reviews shown on each service.", p: 700, r: ["w_front", "b_reviews"] },
  w_seo:     { g: "Website", n: "Google search setup (SEO)", d: "Titles, descriptions and indexing so people find you on Google.", p: 900, r: ["w_front"] },
  w_blog:    { g: "Website", n: "Blog and offers page", d: "Post tips, news and seasonal offers.", p: 600, r: ["w_front"] },
  w_faq:     { g: "Website", n: "FAQ and enquiry form", d: "Common answers plus a contact form that reaches you.", p: 350, r: ["w_front"] },
  w_map:     { g: "Website", n: "Service-area map", d: "Show which areas and localities you cover.", p: 450, r: ["w_front"] },
  w_wa:      { g: "Website", n: "WhatsApp chat button", d: "A button on every page that opens a chat with you.", p: 200, r: ["w_front"] },

  /* ---------- Mobile app (15) ---------- */
  a_base:    { g: "Mobile app", n: "Customer app (Android)", d: "Browse services, view prices and manage the profile from the phone.", p: 10000, r: ["b_db"] },
  a_prov:    { g: "Mobile app", n: "Provider app", d: "Providers see new jobs, accept them and mark them done.", p: 4000, r: ["a_base", "b_db", "b_admin"] },
  a_ios:     { g: "Mobile app", n: "iPhone version too", d: "The same app on iPhone.", p: 3000, r: ["a_base"] },
  a_store:   { g: "Mobile app", n: "Store publishing help", d: "We set up and submit your app to Play Store and App Store.", p: 1500, r: ["a_base"] },
  a_book:    { g: "Mobile app", n: "In-app booking calendar", d: "Pick a service, date and time slot inside the app.", p: 2500, r: ["a_base", "b_db"] },
  a_pay:     { g: "Mobile app", n: "In-app payments", d: "Pay with UPI, cards or wallets without leaving the app.", p: 2000, r: ["a_base", "b_pay"] },
  a_live:    { g: "Mobile app", n: "Live job status screen", d: "Customers see when a provider accepts, arrives and finishes.", p: 2500, r: ["a_base", "b_db"] },
  a_addr:    { g: "Mobile app", n: "Saved addresses", d: "Home, office and other addresses ready for the next booking.", p: 600, r: ["a_base", "b_db"] },
  a_rate:    { g: "Mobile app", n: "Ratings and reviews in the app", d: "Customers rate the provider right after the job.", p: 800, r: ["a_base", "b_reviews"] },
  a_login:   { g: "Mobile app", n: "Google sign-in in the app", d: "One-tap login with a Google account.", p: 600, r: ["a_base", "b_google"] },
  a_push:    { g: "Mobile app", n: "Push notifications", d: "Booking updates and offers arrive on the lock screen.", p: 1000, r: ["a_base", "b_notif"] },
  a_hi:      { g: "Mobile app", n: "Hindi and English in the app", d: "The whole app in two languages.", p: 400, r: ["a_base"] },
  a_share:   { g: "Mobile app", n: "Refer and share link", d: "Customers share the app with friends from one button.", p: 500, r: ["a_base"] },
  a_support: { g: "Mobile app", n: "Help and call button", d: "A help screen with a tap-to-call button for you.", p: 300, r: ["a_base"] },
  a_splash:  { g: "Mobile app", n: "Custom icon and welcome screens", d: "Your logo as the app icon, plus three intro screens.", p: 500, r: ["a_base"] },

  /* ---------- Backend (12) ---------- */
  b_db:         { g: "Backend", n: "Database and server", d: "Where your services, bookings and customers are stored safely.", p: 1500, r: [] },
  b_google:     { g: "Backend", n: "Google sign-in", d: "Customers log in with one tap using their Google account.", p: 800, r: ["b_db"] },
  b_email:      { g: "Backend", n: "Email sign-in", d: "Sign up and log in with email and password, with reset by email.", p: 600, r: ["b_db"] },
  b_otp:        { g: "Backend", n: "Mobile number OTP login", d: "Customers log in with a code sent to their phone. SMS cost is extra.", p: 1200, r: ["b_db"] },
  b_files:      { g: "Backend", n: "Photo and file storage", d: "Service photos, provider IDs and uploads kept safely.", p: 400, r: ["b_db"] },
  b_backup:     { g: "Backend", n: "Daily automatic backups", d: "A copy of everything saved every day, so nothing is ever lost.", p: 200, r: ["b_db"] },
  b_pay:        { g: "Backend", n: "Online payments", d: "UPI, cards and wallets through Razorpay. Money goes to your account.", p: 2000, r: ["b_db"] },
  b_admin:      { g: "Backend", n: "Owner dashboard", d: "You add services, set prices, see bookings and manage providers.", p: 3000, r: ["b_db"] },
  b_commission: { g: "Backend", n: "Commission and earnings reports", d: "Your cut per job, provider payouts and monthly totals.", p: 600, r: ["b_admin"] },
  b_coupon:     { g: "Backend", n: "Coupons and offers", d: "Create discount codes and run festival offers.", p: 500, r: ["b_db"] },
  b_reviews:    { g: "Backend", n: "Ratings and reviews system", d: "Collects, stores and averages customer ratings.", p: 600, r: ["b_db"] },
  b_notif:      { g: "Backend", n: "Email and phone alerts", d: "Booking confirmations and reminders sent automatically.", p: 500, r: ["b_db"] }
};

var GROUPS = ["Website", "Mobile app", "Backend"];
var sel = {};
["w_front", "w_book", "b_google", "b_db"].forEach(function (k) { sel[k] = true; });

function money(n) { return "₹" + n.toLocaleString("en-IN"); }
function moneyPdf(n) { return "Rs. " + n.toLocaleString("en-IN"); }
function names(ids) { return ids.map(function (i) { return ITEMS[i].n; }).join(", "); }
/* An app bought without any website carries the shared setup work (API, hosting, testing) that a website would normally share. */
var STANDALONE_FEE = 5000;
var STANDALONE_LABEL = "App-only setup (no website to share the work)";
function standaloneFee() { return (chosen("Mobile app").length && !chosen("Website").length) ? STANDALONE_FEE : 0; }
function total() { return Object.keys(sel).reduce(function (s, k) { return s + ITEMS[k].p; }, 0) + standaloneFee(); }
function chosen(g) { return Object.keys(ITEMS).filter(function (k) { return sel[k] && ITEMS[k].g === g; }); }

function addWithDeps(id) {
  if (sel[id]) return;
  sel[id] = true;
  ITEMS[id].r.forEach(addWithDeps);
}
function dependents(id) {
  return Object.keys(sel).filter(function (k) { return sel[k] && ITEMS[k].r.indexOf(id) > -1; });
}
function toggle(id) {
  if (sel[id]) {
    if (dependents(id).length) return;
    delete sel[id];
  } else {
    addWithDeps(id);
  }
  update();
}

var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
function build() {
  document.querySelectorAll("[data-render]").forEach(function (box) {
    box.getAttribute("data-render").split(",").forEach(function (id) {
      var it = ITEMS[id];
      var b = document.createElement("button");
      b.type = "button"; b.className = "item"; b.setAttribute("role", "checkbox"); b.setAttribute("data-id", id);
      b.innerHTML = '<span class="box">' + TICK + '</span><span><span class="name"></span><span class="desc"></span><span class="note"></span></span><span class="price"></span>';
      b.querySelector(".name").textContent = it.n;
      b.querySelector(".desc").textContent = it.d;
      b.querySelector(".price").textContent = money(it.p);
      b.addEventListener("click", function () { toggle(id); });
      box.appendChild(b);
    });
  });
}

function update() {
  document.querySelectorAll(".item").forEach(function (b) {
    var id = b.getAttribute("data-id");
    var on = !!sel[id];
    var deps = on ? dependents(id) : [];
    b.setAttribute("aria-checked", on ? "true" : "false");
    b.setAttribute("data-locked", deps.length ? "true" : "false");
    var note = "";
    if (on && deps.length) note = "needed for " + names(deps);
    else if (!on) {
      var miss = [], cost = 0;
      (function walk(i) {
        ITEMS[i].r.forEach(function (r) {
          if (!sel[r] && miss.indexOf(r) < 0) { miss.push(r); cost += ITEMS[r].p; walk(r); }
        });
      })(id);
      if (miss.length) note = "also adds " + names(miss) + " (+" + money(cost) + ")";
    }
    b.querySelector(".note").textContent = note;
  });

  var html = "", count = 0;
  GROUPS.forEach(function (g) {
    var ks = chosen(g);
    if (!ks.length) return;
    var fee = g === "Mobile app" ? standaloneFee() : 0;
    var sub = ks.reduce(function (s, k) { return s + ITEMS[k].p; }, 0) + fee;
    count += ks.length;
    html += '<div class="sumgroup"><div class="label"><span>' + g + '</span><span class="num">' + money(sub) + '</span></div>';
    ks.forEach(function (k) { html += '<div class="sumline"><span>' + ITEMS[k].n + '</span><span>' + money(ITEMS[k].p) + '</span></div>'; });
    if (fee) html += '<div class="sumline"><span>' + STANDALONE_LABEL + '</span><span>' + money(fee) + '</span></div>';
    html += "</div>";
  });
  document.getElementById("sumlines").innerHTML = html || '<p class="sumempty">Nothing ticked yet. Go back and tap the options you want.</p>';
  document.getElementById("count").textContent = count + (count === 1 ? " item" : " items");
  var an = document.getElementById("appnote");
  an.hidden = !standaloneFee();
  var t = money(total());
  document.getElementById("total").textContent = t;
  document.getElementById("bartotal").textContent = t;
}

/* ---------- simple PDF ---------- */
function downloadPdf() {
  var st = document.getElementById("status");
  if (!window.jspdf) { st.textContent = "The PDF tool did not load. Check your connection and try again."; return; }
  if (!total()) { st.textContent = "Tick at least one option first."; return; }
  var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  var W = 210, M = 18, y = 24;
  function need(h) { if (y + h > 280) { doc.addPage(); y = 22; } }
  function rule(c) { doc.setDrawColor(c); doc.setLineWidth(0.2); doc.line(M, y, W - M, y); }

  doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.text("magnm", M, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text("Project plan", W - M, y - 8, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), W - M, y - 2, { align: "right" });
  y += 8; rule(0);

  var nm = document.getElementById("f-name").value.trim();
  var biz = document.getElementById("f-biz").value.trim();
  var ph = document.getElementById("f-phone").value.trim();
  var nt = document.getElementById("f-note").value.trim();
  y += 7;
  [["Prepared for", nm], ["Business", biz], ["Phone", ph]].forEach(function (r) {
    if (!r[1]) return;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(90); doc.text(r[0].toUpperCase(), M, y);
    doc.setFontSize(10.5); doc.setTextColor(0); doc.text(r[1], M + 34, y); y += 6;
  });
  y += 4;

  GROUPS.forEach(function (g) {
    var ks = chosen(g);
    if (!ks.length) return;
    var fee = g === "Mobile app" ? standaloneFee() : 0;
    var sub = ks.reduce(function (s, k) { return s + ITEMS[k].p; }, 0) + fee;
    need(16); y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(0);
    doc.text(g.toUpperCase(), M, y); doc.text(moneyPdf(sub), W - M, y, { align: "right" });
    y += 2.5; rule(0); y += 5.5;
    ks.forEach(function (k) {
      need(8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(0);
      doc.text("[x]  " + ITEMS[k].n, M, y);
      doc.text(moneyPdf(ITEMS[k].p), W - M, y, { align: "right" });
      y += 3; doc.setDrawColor(225); doc.setLineWidth(0.15); doc.line(M, y, W - M, y); y += 5;
    });
    if (fee) {
      need(8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(0);
      doc.text("[x]  " + STANDALONE_LABEL, M, y); doc.text(moneyPdf(fee), W - M, y, { align: "right" });
      y += 3; doc.setDrawColor(225); doc.setLineWidth(0.15); doc.line(M, y, W - M, y); y += 5;
    }
  });

  need(40); y += 6;
  doc.setDrawColor(0); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 9;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("TOTAL", M, y);
  doc.setFontSize(20); doc.text(moneyPdf(total()), W - M, y + 1, { align: "right" });
  y += 11;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(60);
  var terms = "Payable as 40% to start, 30% at demo and 30% at launch. Domain, hosting, SMS and app store fees are extra and paid at actual cost.";
  doc.splitTextToSize(terms, W - 2 * M).forEach(function (ln) { need(5); doc.text(ln, M, y); y += 4.6; });
  if (nt) {
    y += 5; need(14);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(0); doc.text("NOTES", M, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(40);
    doc.splitTextToSize(nt, W - 2 * M).forEach(function (ln) { need(5.5); doc.text(ln, M, y); y += 5; });
  }
  var fname = "magnm-plan" + (biz ? "-" + biz.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "") + ".pdf";

  // Native Android app bridge
  if (window.AndroidBridge && typeof window.AndroidBridge.saveAndOpenPdf === "function") {
    try {
      var dataUri = doc.output("datauristring");
      window.AndroidBridge.saveAndOpenPdf(dataUri, fname);
      st.textContent = "Your plan PDF has been generated and opened.";
      return;
    } catch (e) {
      console.warn("AndroidBridge save failed, falling back to browser save", e);
    }
  }

  // Browser download fallback
  doc.save(fname);
  st.textContent = "Your plan was downloaded as a PDF.";
}

/* ---------- wiring ---------- */
function go(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
document.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(b.getAttribute("data-go")); }); });
document.getElementById("seeplan").addEventListener("click", function () { go("summary"); });
document.getElementById("form").addEventListener("submit", function (e) { e.preventDefault(); downloadPdf(); });

var secs = ["p1", "p2", "p3", "p4"];
function spy() {
  var y = window.scrollY + 140, cur = "p1";
  secs.forEach(function (s) { if (document.getElementById(s).offsetTop <= y) cur = s; });
  document.querySelectorAll("[data-go]").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-go") === cur ? "true" : "false"); });
}
window.addEventListener("scroll", spy, { passive: true });

build(); update(); spy();
