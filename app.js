if (typeof require !== 'undefined') {
  try { require('@seismo/sdk/auto'); } catch (e) {}
}
/* magnm Software Cost Planner & Quotation Engine
   Prices are in INR. */

var ITEMS = {
  /* ---------- Web & SaaS ---------- */
  w_front:   { g: "Web & SaaS", n: "Responsive Web Application / Frontend", d: "Mobile-first, modern responsive web application. UI components, landing, dashboard or product pages.", p: 6000, r: [] },
  w_anim:    { g: "Web & SaaS", n: "Advanced UI & Micro-interactions", d: "Smooth transitions, interactive hover effects, and modern motion polish.", p: 1800, r: ["w_front"] },
  w_lang:    { g: "Web & SaaS", n: "Multi-Language Support (i18n)", d: "Instant language switcher with complete interface localization.", p: 800, r: ["w_front"] },
  w_portal:  { g: "Web & SaaS", n: "Client Portal & User Dashboard", d: "Personal user accounts, order history, profile settings, and data dashboard.", p: 1500, r: ["w_front", "b_db"] },
  w_shop:    { g: "Web & SaaS", n: "E-Commerce & Digital Checkout", d: "Catalog, shopping cart, coupon codes, and online checkout flow.", p: 2500, r: ["w_front", "b_db", "b_pay", "b_admin"] },
  w_search:  { g: "Web & SaaS", n: "Faceted Search & Data Filters", d: "Instant multi-attribute search, filters, category sorting, and tabular data view.", p: 600, r: ["w_front"] },
  w_coupon:  { g: "Web & SaaS", n: "Promo Codes & Discount Rules", d: "Apply coupon codes, festival discounts, and special pricing at checkout.", p: 400, r: ["w_front", "b_coupon"] },
  w_seo:     { g: "Web & SaaS", n: "Google Search (SEO) & Social Sharing", d: "Metadata tags, OpenGraph previews, sitemaps, and search engine indexing.", p: 700, r: ["w_front"] },
  w_blog:    { g: "Web & SaaS", n: "Blog & Content Management", d: "Dynamic articles, company announcements, guides, and updates.", p: 600, r: ["w_front"] },
  w_forms:   { g: "Web & SaaS", n: "Custom Forms & Lead Capture", d: "Interactive enquiry and onboarding forms with validation and alerts.", p: 400, r: ["w_front"] },
  w_chat:    { g: "Web & SaaS", n: "Live Chat & WhatsApp Widget", d: "Direct messaging widget and WhatsApp click-to-chat on every page.", p: 200, r: ["w_front"] },

  // Specialized / Platform Web items
  w_book:    { g: "Web & SaaS", n: "Service Booking & Slot Picker", d: "Customers select a service, date and time slot, and booking is confirmed.", p: 1200, r: ["w_front", "b_db", "b_admin"] },
  w_gallery: { g: "Web & SaaS", n: "Service Showcase & Photo Gallery", d: "A page for each service with high-res photos, details and inclusions.", p: 400, r: ["w_front"] },
  w_account: { g: "Web & SaaS", n: "Customer Account & Booking History", d: "Customers see past and upcoming bookings and rebook in one tap.", p: 700, r: ["w_front", "b_db"] },
  w_reviews: { g: "Web & SaaS", n: "Ratings & Reviews on Site", d: "Star ratings and verified testimonials displayed for each service.", p: 550, r: ["w_front", "b_reviews"] },
  w_faq:     { g: "Web & SaaS", n: "FAQ & Quick Enquiry Form", d: "Frequently asked questions plus a contact form that routes to you.", p: 300, r: ["w_front"] },
  w_map:     { g: "Web & SaaS", n: "Service-Area & Geofencing Map", d: "Interactive map showing covered delivery zones and operational areas.", p: 350, r: ["w_front"] },
  w_wa:      { g: "Web & SaaS", n: "WhatsApp Chat Floating Button", d: "Floating button on every page that opens an instant WhatsApp chat.", p: 150, r: ["w_front"] },

  /* ---------- Mobile App ---------- */
  a_base:    { g: "Mobile app", n: "Cross-Platform Mobile App (Android)", d: "Mobile app built for Android with smooth UI, navigation, and offline cache.", p: 6500, r: ["b_db"] },
  a_ios:     { g: "Mobile app", n: "iOS Version (iPhone & iPad)", d: "Configured and tested for Apple devices, Retina displays, and iOS design guidelines.", p: 2200, r: ["a_base"] },
  a_store:   { g: "Mobile app", n: "Store Publishing & Submission", d: "App signing, screenshots, store listings, and Play Store / App Store submissions.", p: 1200, r: ["a_base"] },
  a_push:    { g: "Mobile app", n: "Push Notifications (FCM / APNs)", d: "Targeted push notifications, lock-screen updates, and scheduled reminders.", p: 700, r: ["a_base", "b_notif"] },
  a_pay:     { g: "Mobile app", n: "In-App Payments & Mobile Checkout", d: "Seamless mobile checkout supporting UPI, cards, and digital wallets.", p: 1200, r: ["a_base", "b_pay"] },
  a_bio:     { g: "Mobile app", n: "Biometric Authentication", d: "Fast, secure FaceID and Fingerprint authentication.", p: 500, r: ["a_base", "b_db"] },
  a_offline: { g: "Mobile app", n: "Offline Mode & Local Storage", d: "Local database caching with automatic cloud sync when network reconnects.", p: 1100, r: ["a_base", "b_db"] },
  a_share:   { g: "Mobile app", n: "Deep Linking & Referral Share", d: "Universal links, invite codes, and direct app share button.", p: 350, r: ["a_base"] },
  a_support: { g: "Mobile app", n: "Help Center & Support Dialer", d: "In-app FAQ, support ticket form, and one-tap emergency call button.", p: 300, r: ["a_base"] },
  a_splash:  { g: "Mobile app", n: "Branded Splash & Welcome Slides", d: "Custom app launcher icon, animated splash screen, and onboard walkthrough.", p: 400, r: ["a_base"] },

  // Specialized / Platform Mobile items
  a_prov:    { g: "Mobile app", n: "Service Provider / Partner App", d: "Dedicated app for field providers to view new requests, accept jobs, and update status.", p: 2500, r: ["a_base", "b_db", "b_admin"] },
  a_book:    { g: "Mobile app", n: "In-App Booking Calendar", d: "Pick a service, date and time slot inside the mobile app.", p: 1300, r: ["a_base", "b_db"] },
  a_live:    { g: "Mobile app", n: "Live Job Status Screen", d: "Customers track service assignment, arrival, and completion in real time.", p: 1300, r: ["a_base", "b_db"] },
  a_addr:    { g: "Mobile app", n: "Saved Addresses & Geolocation", d: "Save home, work and custom addresses with GPS pin detection.", p: 350, r: ["a_base", "b_db"] },
  a_rate:    { g: "Mobile app", n: "In-App Ratings & Review Flow", d: "Post-job rating prompt with star score and written feedback.", p: 450, r: ["a_base", "b_reviews"] },
  a_login:   { g: "Mobile app", n: "Google Sign-In in App", d: "One-tap login with Google account inside mobile app.", p: 350, r: ["a_base", "b_google"] },
  a_hi:      { g: "Mobile app", n: "Hindi & English in App", d: "The entire mobile app in two languages.", p: 200, r: ["a_base"] },

  /* ---------- Backend & Architecture ---------- */
  b_db:         { g: "Backend", n: "Core Database & API Server", d: "Production-grade relational database and secure REST/GraphQL API server.", p: 2000, r: [] },
  b_google:     { g: "Backend", n: "Google & OAuth Sign-In", d: "One-click OAuth authentication for rapid and secure user onboarding.", p: 600, r: ["b_db"] },
  b_email:      { g: "Backend", n: "Email Auth & Password Reset", d: "Hashed passwords, email verification tokens, and self-service password recovery.", p: 500, r: ["b_db"] },
  b_otp:        { g: "Backend", n: "Mobile OTP Authentication", d: "Phone number verification with one-time SMS passwords (SMS gateway fees at actuals).", p: 900, r: ["b_db"] },
  b_roles:      { g: "Backend", n: "Role-Based Access Control (RBAC)", d: "Granular access permissions for Admins, Staff, Managers, and End Users.", p: 750, r: ["b_db"] },
  b_admin:      { g: "Backend", n: "Administrative Dashboard", d: "Comprehensive web portal to manage records, users, transactions, and system settings.", p: 3000, r: ["b_db"] },
  b_pay:        { g: "Backend", n: "Payment Gateway Integration", d: "Razorpay / Stripe integration with webhooks, refunds, and payment audit logs.", p: 1800, r: ["b_db"] },
  b_files:      { g: "Backend", n: "Cloud Media & File Storage (S3 / R2)", d: "Secure file uploads, media optimization, and signed private download links.", p: 400, r: ["b_db"] },
  b_analytics:  { g: "Backend", n: "Analytics & Business Reporting", d: "Aggregated KPIs, user growth graphs, activity tracking, and CSV reports.", p: 700, r: ["b_admin"] },
  b_backup:     { g: "Backend", n: "Automated Daily Backups", d: "Off-site encrypted database snapshots and disaster recovery safeguards.", p: 300, r: ["b_db"] },
  b_notif:      { g: "Backend", n: "Transactional Email & SMS Engine", d: "Automated system notifications, receipts, and order updates via email/SMS.", p: 500, r: ["b_db"] },

  // Specialized / Platform Backend items
  b_commission: { g: "Backend", n: "Commission & Payout Management", d: "Platform fee calculation, service provider payouts, and monthly earnings breakdown.", p: 650, r: ["b_admin"] },
  b_coupon:     { g: "Backend", n: "Coupons & Promotional Rules", d: "Discount codes, usage limits, minimum order values, and validity schedules.", p: 400, r: ["b_db"] },
  b_reviews:    { g: "Backend", n: "Ratings & Moderation Engine", d: "Collects, aggregates, and moderates customer reviews and ratings.", p: 450, r: ["b_db"] },

  /* ---------- AI & Automation ---------- */
  ai_bot:      { g: "AI & Automation", n: "Custom AI Assistant / Support Bot", d: "Trained on company docs & FAQs using OpenAI / Claude / Gemini APIs.", p: 2500, r: ["b_db"] },
  ai_doc:      { g: "AI & Automation", n: "Document Parsing & AI OCR", d: "Automated extraction and classification of PDFs, invoices, forms, and images.", p: 2200, r: ["b_db"] },
  ai_search:   { g: "AI & Automation", n: "Semantic Vector Search", d: "Vector embeddings for natural language queries and smart recommendation matching.", p: 1800, r: ["b_db"] },
  ai_workflow: { g: "AI & Automation", n: "Automated Workflow & Webhook Pipelines", d: "Multi-step automated workflows connecting CRM, Slack, WhatsApp, and internal APIs.", p: 1400, r: ["b_db"] },

  /* ---------- DevOps, Cloud & Maintenance ---------- */
  ops_cicd:    { g: "DevOps & Maintenance", n: "CI/CD Automated Deployment Pipelines", d: "GitHub Actions automated testing, preview staging environments, and production rollouts.", p: 1200, r: [] },
  ops_cloud:   { g: "DevOps & Maintenance", n: "Production Cloud Infrastructure & CDN", d: "Cloud hosting setup, custom domain routing, SSL certificates, CDN caching, and DDoS defense.", p: 1500, r: [] },
  ops_monitor: { g: "DevOps & Maintenance", n: "Real-Time Monitoring & Error Alerts", d: "Sentry error tracking, server health monitoring, and instant notification alerts.", p: 800, r: [] },
  ops_maint:   { g: "DevOps & Maintenance", n: "Monthly Maintenance & Priority Support", d: "Security patches, dependency updates, performance tuning, and guaranteed SLA response.", p: 2000, r: [] }
};

var GROUPS = ["Web & SaaS", "Mobile app", "Backend", "AI & Automation", "DevOps & Maintenance"];
var STANDALONE_FEE = 4000;
var STANDALONE_LABEL = "App-only setup (no web application to share foundation)";

var activePreset = null;
var activeRoute = null;
var sel = {};

/* ---------- Helper Utilities ---------- */
function money(n) { return "₹" + n.toLocaleString("en-IN"); }
function moneyPdf(n) { return "Rs. " + n.toLocaleString("en-IN"); }
function names(ids) { return ids.map(function (i) { return (ITEMS[i] && ITEMS[i].n) || i; }).join(", "); }
function chosen(g) { return Object.keys(ITEMS).filter(function (k) { return sel[k] && ITEMS[k].g === g; }); }
function standaloneFee() { return (chosen("Mobile app").length && !chosen("Web & SaaS").length) ? STANDALONE_FEE : 0; }
function total() {
  return Object.keys(sel).reduce(function (s, k) {
    return s + (ITEMS[k] ? ITEMS[k].p : 0);
  }, 0) + standaloneFee();
}

function showToast(msg) {
  var t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove("show"); }, 3000);
}

/* ---------- Preset Store (LocalStorage + Presets.js) ---------- */
var STORAGE_KEY = "magnm_custom_client_presets";

function getAllPresets() {
  var presets = {};
  if (typeof PLANNER_PRESETS !== "undefined") {
    Object.keys(PLANNER_PRESETS).forEach(function (k) {
      presets[k] = Object.assign({}, PLANNER_PRESETS[k]);
    });
  }
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var custom = JSON.parse(raw);
      Object.keys(custom).forEach(function (k) {
        presets[k] = custom[k];
      });
    }
  } catch (e) {
    console.warn("Could not read custom presets from localStorage", e);
  }
  return presets;
}

function saveCustomPreset(preset) {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    var custom = raw ? JSON.parse(raw) : {};
    custom[preset.slug] = preset;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return true;
  } catch (e) {
    console.error("Failed to save custom preset to localStorage", e);
    return false;
  }
}

function deleteCustomPreset(slug) {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    var custom = raw ? JSON.parse(raw) : {};
    delete custom[slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    return true;
  } catch (e) {
    console.error("Failed to delete custom preset from localStorage", e);
    return false;
  }
}

/* ---------- Router ---------- */
function parseRoute() {
  var path = window.location.pathname || "";
  var search = new URLSearchParams(window.location.search);
  var hash = window.location.hash || "";

  // Admin view check
  if (path === "/admin" || path.indexOf("/admin/") === 0 || search.get("admin") === "true" || hash === "#admin") {
    return { view: "admin" };
  }

  // Client proposal path check: /clients/<slug>
  var clientMatch = path.match(/^\/clients\/([a-zA-Z0-9_-]+)/);
  if (clientMatch && clientMatch[1]) {
    return { view: "planner", client: clientMatch[1].toLowerCase() };
  }

  // Query parameter fallback: ?client=<slug>
  var clientQuery = search.get("client");
  if (clientQuery) {
    return { view: "planner", client: clientQuery.toLowerCase() };
  }

  // Hash fallback: #/clients/<slug>
  var hashMatch = hash.match(/^#\/clients\/([a-zA-Z0-9_-]+)/);
  if (hashMatch && hashMatch[1]) {
    return { view: "planner", client: hashMatch[1].toLowerCase() };
  }

  // Default: General Software Cost Planner
  return { view: "planner", client: "general" };
}

/* ---------- App Initialization & View Rendering ---------- */
function init() {
  activeRoute = parseRoute();

  if (activeRoute.view === "admin") {
    showAdminView();
    return;
  }

  showPlannerView(activeRoute.client);
}

function showPlannerView(clientSlug) {
  var plannerEl = document.getElementById("planner-view");
  var adminEl = document.getElementById("admin-view");
  var navEl = document.getElementById("main-nav");
  var barEl = document.getElementById("bottom-bar");

  if (plannerEl) plannerEl.hidden = false;
  if (adminEl) adminEl.hidden = true;
  if (navEl) navEl.hidden = false;
  if (barEl) barEl.hidden = false;

  var allPresets = getAllPresets();
  var preset = allPresets[clientSlug];

  if (!preset) {
    if (clientSlug !== "general") {
      showToast("Client route '" + clientSlug + "' not found. Loaded General Planner.");
    }
    preset = allPresets["general"] || {
      slug: "general",
      title: "magnm Software Cost Planner",
      lead: "A student-led development team from India. We build modern web platforms, mobile apps, SaaS, AI integrations, and cloud backend systems.",
      whatWeDo: "Full-Stack Web & SaaS, Mobile Apps (iOS/Android), Cloud Backend & APIs, AI & Automation",
      thisPlan: "Custom software & product development tailored to your requirements",
      initialSelected: ["w_front", "b_db", "b_admin"]
    };
  }

  activePreset = preset;

  // Update Page Title and Headings
  document.title = (preset.title || "magnm Software Cost Planner") + (preset.slug !== "general" ? " - " + preset.name : "");
  var heroLead = document.getElementById("hero-lead");
  if (heroLead) heroLead.textContent = preset.lead;

  var heroWhat = document.getElementById("hero-what");
  if (heroWhat && preset.whatWeDo) heroWhat.textContent = preset.whatWeDo;

  var heroPlan = document.getElementById("hero-plan");
  if (heroPlan && preset.thisPlan) heroPlan.textContent = preset.thisPlan;

  var subTitle = document.getElementById("p1-subtitle");
  if (subTitle) subTitle.textContent = preset.slug === "general" ? "Software Planner" : "Client Proposal";

  // Pre-fill form if client details exist
  var fName = document.getElementById("f-name");
  var fBiz = document.getElementById("f-biz");
  if (fName && preset.clientName) fName.value = preset.clientName;
  if (fBiz && preset.businessName) fBiz.value = preset.businessName;

  // Render Client Banner
  var banner = document.getElementById("client-banner");
  var bannerText = document.getElementById("banner-text");
  if (banner && bannerText) {
    if (preset.slug !== "general") {
      bannerText.innerHTML = "<strong>" + (preset.badge || preset.name) + "</strong> (Route: <code>/clients/" + preset.slug + "</code>)";
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  // Render Architecture / Roles Block
  renderArchitectureBlock(preset);

  // Initialize Item Selections
  sel = {};
  var defaults = preset.initialSelected || ["w_front", "b_db", "b_admin"];
  defaults.forEach(function (id) {
    if (ITEMS[id]) addWithDeps(id);
  });

  // Render Options Sections
  buildPlannerSections(preset);

  update();
  spy();
}

function renderArchitectureBlock(preset) {
  var container = document.getElementById("architecture-block-container");
  if (!container) return;

  var arch = preset.architectureBlock;
  if (!arch || !arch.roles || !arch.roles.length) {
    container.innerHTML = "";
    return;
  }

  var html = '<div class="block">';
  html += '<h2>' + arch.heading + '</h2>';
  if (arch.sub) html += '<p class="sub">' + arch.sub + '</p>';
  html += '<div class="roles">';

  arch.roles.forEach(function (role) {
    html += '<div class="role"><span class="label">' + role.label + '</span><ol>';
    role.points.forEach(function (pt) {
      html += '<li>' + pt + '</li>';
    });
    html += '</ol></div>';
  });

  html += '</div></div>';
  container.innerHTML = html;
}

/* ---------- Items Section Rendering ---------- */
function buildPlannerSections(preset) {
  var isUrban = preset.slug === "urban-company";

  // P2: Web & SaaS
  var p2Container = document.getElementById("p2-groups");
  if (p2Container) {
    p2Container.innerHTML = [
      '<div class="group"><div class="label"><span>Frontend Architecture & UI</span></div><div class="items" data-render="w_front,w_anim,w_lang' + (isUrban ? ',w_gallery' : '') + '"></div></div>',
      '<div class="group"><div class="label"><span>Platform Capabilities & Workflows</span></div><div class="items" data-render="' + (isUrban ? 'w_book,w_shop,w_account,w_search,w_coupon' : 'w_portal,w_shop,w_search,w_coupon') + '"></div></div>',
      '<div class="group"><div class="label"><span>Growth, SEO & Engagement</span></div><div class="items" data-render="' + (isUrban ? 'w_reviews,w_seo,w_blog,w_faq,w_map,w_wa' : 'w_seo,w_blog,w_forms,w_chat') + '"></div></div>'
    ].join("");
  }

  // P3: Mobile Apps
  var p3Container = document.getElementById("p3-groups");
  if (p3Container) {
    p3Container.innerHTML = [
      '<div class="group"><div class="label"><span>Mobile Apps & Platforms</span></div><div class="items" data-render="a_base' + (isUrban ? ',a_prov' : '') + ',a_ios,a_store"></div></div>',
      '<div class="group"><div class="label"><span>Mobile Features & Security</span></div><div class="items" data-render="' + (isUrban ? 'a_book,a_pay,a_live,a_addr,a_rate' : 'a_push,a_pay,a_bio,a_offline') + '"></div></div>',
      '<div class="group"><div class="label"><span>Engagement & Experience</span></div><div class="items" data-render="' + (isUrban ? 'a_login,a_push,a_hi,a_share,a_support,a_splash' : 'a_share,a_support,a_splash') + '"></div></div>'
    ].join("");
  }

  // P4: Backend & Cloud
  var p4Container = document.getElementById("p4-groups");
  if (p4Container) {
    p4Container.innerHTML = [
      '<div class="group"><div class="label"><span>Database, API & Authentication</span></div><div class="items" data-render="b_db,b_google,b_email,b_otp' + (isUrban ? '' : ',b_roles') + '"></div></div>',
      '<div class="group"><div class="label"><span>Operations & Admin Dashboard</span></div><div class="items" data-render="b_admin,b_pay,b_files' + (isUrban ? ',b_commission,b_coupon,b_reviews' : ',b_analytics') + '"></div></div>',
      '<div class="group"><div class="label"><span>Reliability & Communications</span></div><div class="items" data-render="b_backup,b_notif"></div></div>'
    ].join("");
  }

  // P5: AI & DevOps
  var p5Container = document.getElementById("p5-groups");
  if (p5Container) {
    p5Container.innerHTML = [
      '<div class="group"><div class="label"><span>AI & Intelligent Automation</span></div><div class="items" data-render="ai_bot,ai_doc,ai_search,ai_workflow"></div></div>',
      '<div class="group"><div class="label"><span>Cloud DevOps & Infrastructure</span></div><div class="items" data-render="ops_cicd,ops_cloud,ops_monitor,ops_maint"></div></div>'
    ].join("");
  }

  // Render individual item buttons into containers
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  document.querySelectorAll("[data-render]").forEach(function (box) {
    box.innerHTML = "";
    var ids = box.getAttribute("data-render").split(",");
    ids.forEach(function (id) {
      id = id.trim();
      var it = ITEMS[id];
      if (!it) return;

      var b = document.createElement("button");
      b.type = "button";
      b.className = "item";
      b.setAttribute("role", "checkbox");
      b.setAttribute("data-id", id);
      b.innerHTML = '<span class="box">' + TICK + '</span><span><span class="name"></span><span class="desc"></span><span class="note"></span></span><span class="price"></span>';
      b.querySelector(".name").textContent = it.n;
      b.querySelector(".desc").textContent = it.d;
      b.querySelector(".price").textContent = money(it.p);
      b.addEventListener("click", function () { toggle(id); });
      box.appendChild(b);
    });
  });
}

/* ---------- Selection & Dependency Management ---------- */
function addWithDeps(id) {
  if (sel[id] || !ITEMS[id]) return;
  sel[id] = true;
  (ITEMS[id].r || []).forEach(addWithDeps);
}

function dependents(id) {
  return Object.keys(sel).filter(function (k) {
    return sel[k] && ITEMS[k] && ITEMS[k].r && ITEMS[k].r.indexOf(id) > -1;
  });
}

function toggle(id) {
  if (sel[id]) {
    if (dependents(id).length) {
      showToast("Included: required by other selected components (" + names(dependents(id)) + ")");
      return;
    }
    delete sel[id];
  } else {
    addWithDeps(id);
  }
  update();
}

function update() {
  document.querySelectorAll(".item").forEach(function (b) {
    var id = b.getAttribute("data-id");
    if (!ITEMS[id]) return;

    var on = !!sel[id];
    var deps = on ? dependents(id) : [];
    b.setAttribute("aria-checked", on ? "true" : "false");
    b.setAttribute("data-locked", deps.length ? "true" : "false");

    var note = "";
    if (on && deps.length) {
      note = "needed for " + names(deps);
    } else if (!on) {
      var miss = [], cost = 0;
      (function walk(i) {
        if (!ITEMS[i] || !ITEMS[i].r) return;
        ITEMS[i].r.forEach(function (r) {
          if (!sel[r] && miss.indexOf(r) < 0 && ITEMS[r]) {
            miss.push(r);
            cost += ITEMS[r].p;
            walk(r);
          }
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
    var fee = (g === "Mobile app") ? standaloneFee() : 0;
    var sub = ks.reduce(function (s, k) { return s + ITEMS[k].p; }, 0) + fee;
    count += ks.length;

    html += '<div class="sumgroup"><div class="label"><span>' + g + '</span><span class="num">' + money(sub) + '</span></div>';
    ks.forEach(function (k) {
      html += '<div class="sumline"><span>' + ITEMS[k].n + '</span><span>' + money(ITEMS[k].p) + '</span></div>';
    });
    if (fee) {
      html += '<div class="sumline"><span>' + STANDALONE_LABEL + '</span><span>' + money(fee) + '</span></div>';
    }
    html += "</div>";
  });

  var sumlines = document.getElementById("sumlines");
  if (sumlines) {
    sumlines.innerHTML = html || '<p class="sumempty">Nothing selected yet. Browse the pages above and tick the features you need.</p>';
  }

  var countEl = document.getElementById("count");
  if (countEl) countEl.textContent = count + (count === 1 ? " item" : " items");

  var an = document.getElementById("appnote");
  if (an) an.hidden = !standaloneFee();

  var t = money(total());
  var totalEl = document.getElementById("total");
  var barTotalEl = document.getElementById("bartotal");
  if (totalEl) totalEl.textContent = t;
  if (barTotalEl) barTotalEl.textContent = t;
}

/* ---------- PDF Export Engine ---------- */
function downloadPdf() {
  var st = document.getElementById("status");
  if (!window.jspdf) {
    if (st) st.textContent = "The PDF tool did not load. Check your internet connection.";
    return;
  }
  if (!total()) {
    if (st) st.textContent = "Please select at least one component first.";
    return;
  }

  var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  var W = 210, M = 18, y = 24;

  function need(h) {
    if (y + h > 280) {
      doc.addPage();
      y = 22;
    }
  }
  function rule(c) {
    doc.setDrawColor(c);
    doc.setLineWidth(0.2);
    doc.line(M, y, W - M, y);
  }

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("magnm", M, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  var planLabel = (activePreset && activePreset.slug !== "general") ? activePreset.name : "Software Project Estimate";
  doc.text(planLabel, W - M, y - 8, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), W - M, y - 2, { align: "right" });
  y += 8;
  rule(0);

  var nm = (document.getElementById("f-name") ? document.getElementById("f-name").value.trim() : "");
  var biz = (document.getElementById("f-biz") ? document.getElementById("f-biz").value.trim() : "");
  var ph = (document.getElementById("f-phone") ? document.getElementById("f-phone").value.trim() : "");
  var nt = (document.getElementById("f-note") ? document.getElementById("f-note").value.trim() : "");

  y += 7;
  var metaRows = [
    ["Prepared for", nm],
    ["Business", biz],
    ["Phone", ph],
    ["Scope", (activePreset && activePreset.thisPlan) ? activePreset.thisPlan : ""]
  ];

  metaRows.forEach(function (r) {
    if (!r[1]) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90);
    doc.text(r[0].toUpperCase(), M, y);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(r[1], M + 34, y);
    y += 6;
  });
  y += 4;

  GROUPS.forEach(function (g) {
    var ks = chosen(g);
    if (!ks.length) return;
    var fee = (g === "Mobile app") ? standaloneFee() : 0;
    var sub = ks.reduce(function (s, k) { return s + ITEMS[k].p; }, 0) + fee;

    need(16);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(0);
    doc.text(g.toUpperCase(), M, y);
    doc.text(moneyPdf(sub), W - M, y, { align: "right" });
    y += 2.5;
    rule(0);
    y += 5.5;

    ks.forEach(function (k) {
      need(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("[x]  " + ITEMS[k].n, M, y);
      doc.text(moneyPdf(ITEMS[k].p), W - M, y, { align: "right" });
      y += 3;
      doc.setDrawColor(225);
      doc.setLineWidth(0.15);
      doc.line(M, y, W - M, y);
      y += 5;
    });

    if (fee) {
      need(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("[x]  " + STANDALONE_LABEL, M, y);
      doc.text(moneyPdf(fee), W - M, y, { align: "right" });
      y += 3;
      doc.setDrawColor(225);
      doc.setLineWidth(0.15);
      doc.line(M, y, W - M, y);
      y += 5;
    }
  });

  need(40);
  y += 6;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(M, y, W - M, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL ESTIMATE", M, y);
  doc.setFontSize(20);
  doc.text(moneyPdf(total()), W - M, y + 1, { align: "right" });
  y += 11;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);
  var terms = "Payable as 40% upfront milestone, 30% upon staging demo approval, and 30% upon production deployment and source code handover. Domain, third-party cloud hosting, SMS gateway credits, and app store developer fees are paid at actual cost.";
  doc.splitTextToSize(terms, W - 2 * M).forEach(function (ln) {
    need(5);
    doc.text(ln, M, y);
    y += 4.6;
  });

  if (nt) {
    y += 5;
    need(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0);
    doc.text("PROJECT NOTES & DELIVERABLES", M, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(40);
    doc.splitTextToSize(nt, W - 2 * M).forEach(function (ln) {
      need(5.5);
      doc.text(ln, M, y);
      y += 5;
    });
  }

  var slugPart = (activePreset && activePreset.slug && activePreset.slug !== "general") ? activePreset.slug + "-" : "";
  var bizPart = biz ? biz.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" : "";
  var fname = "magnm-" + slugPart + bizPart + "estimate.pdf";

  // Native Android bridge support
  if (window.AndroidBridge && typeof window.AndroidBridge.saveAndOpenPdf === "function") {
    try {
      var dataUri = doc.output("datauristring");
      window.AndroidBridge.saveAndOpenPdf(dataUri, fname);
      if (st) st.textContent = "Your proposal PDF has been generated and opened.";
      return;
    } catch (e) {
      console.warn("AndroidBridge save failed, using browser fallback", e);
    }
  }

  // Browser download fallback
  doc.save(fname);
  if (st) st.textContent = "Your proposal PDF was downloaded successfully.";
}

/* ---------- Admin Panel Controller ---------- */
function showAdminView() {
  var plannerEl = document.getElementById("planner-view");
  var adminEl = document.getElementById("admin-view");
  var navEl = document.getElementById("main-nav");
  var barEl = document.getElementById("bottom-bar");
  var banner = document.getElementById("client-banner");

  if (plannerEl) plannerEl.hidden = true;
  if (adminEl) adminEl.hidden = false;
  if (navEl) navEl.hidden = true;
  if (barEl) barEl.hidden = true;
  if (banner) banner.hidden = true;

  document.title = "Client Proposal Manager | magnm Admin";
  renderAdminList();
  wireAdminEvents();
}

function renderAdminList() {
  var listContainer = document.getElementById("admin-client-list");
  if (!listContainer) return;

  var allPresets = getAllPresets();
  var slugs = Object.keys(allPresets).filter(function (s) { return s !== "general"; });

  if (!slugs.length) {
    listContainer.innerHTML = '<p class="sumempty">No client routes defined yet. Click "+ New Client Route" above to create one.</p>';
    return;
  }

  var html = "";
  slugs.forEach(function (s) {
    var p = allPresets[s];
    var isBuiltIn = (typeof PLANNER_PRESETS !== "undefined" && !!PLANNER_PRESETS[s]);
    var selectedCount = (p.initialSelected || []).length;
    var clientUrl = "/clients/" + p.slug;
    var shareQueryUrl = window.location.origin + window.location.pathname + "?client=" + p.slug;

    html += '<div class="client-card">';
    html += '  <div class="client-card-header">';
    html += '    <div>';
    html += '      <h3>' + p.name + '</h3>';
    html += '      <div style="margin-top: 4px; display: flex; gap: 8px; align-items: center;">';
    html += '        <span class="client-slug-tag">/clients/' + p.slug + '</span>';
    html += '        <span class="label" style="opacity: 0.6;">' + (isBuiltIn ? "Built-in Preset" : "Custom Route") + '</span>';
    html += '      </div>';
    html += '    </div>';
    html += '    <span class="label">' + selectedCount + ' pre-selected items</span>';
    html += '  </div>';

    html += '  <div class="client-card-body">';
    html += '    <p><strong>Scope:</strong> ' + (p.thisPlan || "Custom platform") + '</p>';
    if (p.clientName || p.businessName) {
      html += '    <p style="margin-top: 4px; font-size: 13.5px; opacity: 0.85;">Target: ' + (p.clientName || "") + (p.businessName ? " (" + p.businessName + ")" : "") + '</p>';
    }
    html += '  </div>';

    html += '  <div class="client-card-footer">';
    html += '    <a href="' + clientUrl + '" class="btn-sm" style="font-size: 12px; padding: 6px 14px;">Open Proposal</a>';
    html += '    <button type="button" class="btn-outline" data-copy="' + shareQueryUrl + '" style="font-size: 12px; padding: 6px 14px;">Copy Share Link</button>';
    html += '    <button type="button" class="btn-outline" data-edit="' + p.slug + '" style="font-size: 12px; padding: 6px 14px;">Edit</button>';
    if (!isBuiltIn) {
      html += '    <button type="button" class="btn-danger" data-delete="' + p.slug + '">Delete</button>';
    }
    html += '  </div>';
    html += '</div>';
  });

  listContainer.innerHTML = html;

  // Wire list card buttons
  listContainer.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-copy");
      navigator.clipboard.writeText(url).then(function () {
        showToast("Shareable link copied to clipboard!");
      }).catch(function () {
        prompt("Copy this client proposal link:", url);
      });
    });
  });

  listContainer.querySelectorAll("[data-edit]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slug = btn.getAttribute("data-edit");
      openEditor(slug);
    });
  });

  listContainer.querySelectorAll("[data-delete]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var slug = btn.getAttribute("data-delete");
      if (confirm("Delete client proposal route '/clients/" + slug + "'?")) {
        deleteCustomPreset(slug);
        renderAdminList();
        showToast("Client proposal deleted.");
      }
    });
  });
}

function wireAdminEvents() {
  var newBtn = document.getElementById("btn-new-client");
  if (newBtn) {
    newBtn.onclick = function () { openEditor(); };
  }

  var cancelBtn = document.getElementById("btn-cancel-editor");
  if (cancelBtn) {
    cancelBtn.onclick = function () {
      document.getElementById("admin-editor").hidden = true;
    };
  }

  var slugInput = document.getElementById("cfg-slug");
  if (slugInput) {
    slugInput.oninput = function () {
      var preview = document.getElementById("slug-preview");
      if (preview) preview.textContent = slugInput.value || "your-slug";
    };
  }

  var form = document.getElementById("admin-client-form");
  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      saveEditorData();
    };
  }

  // Import / Export JSON buttons
  var expBtn = document.getElementById("btn-export-json");
  var impBtn = document.getElementById("btn-import-json");
  var syncBox = document.getElementById("json-sync-box");
  var syncArea = document.getElementById("json-sync-area");
  var applyBtn = document.getElementById("btn-apply-import");
  var closeSyncBtn = document.getElementById("btn-close-sync");

  if (expBtn && syncBox && syncArea) {
    expBtn.onclick = function () {
      syncBox.hidden = false;
      syncArea.value = JSON.stringify(getAllPresets(), null, 2);
      syncArea.select();
      showToast("Presets JSON exported. Copy to save or commit.");
    };
  }

  if (impBtn && syncBox && syncArea) {
    impBtn.onclick = function () {
      syncBox.hidden = false;
      syncArea.value = "";
      syncArea.placeholder = "Paste presets JSON here to import...";
      syncArea.focus();
    };
  }

  if (closeSyncBtn && syncBox) {
    closeSyncBtn.onclick = function () { syncBox.hidden = true; };
  }

  if (applyBtn && syncArea) {
    applyBtn.onclick = function () {
      try {
        var parsed = JSON.parse(syncArea.value);
        if (typeof parsed !== "object") throw new Error("Invalid format");
        Object.keys(parsed).forEach(function (k) {
          if (k !== "general") saveCustomPreset(parsed[k]);
        });
        renderAdminList();
        syncBox.hidden = true;
        showToast("Presets imported successfully!");
      } catch (err) {
        alert("Invalid JSON format. Please verify and try again.");
      }
    };
  }
}

function openEditor(editSlug) {
  var editor = document.getElementById("admin-editor");
  var title = document.getElementById("editor-title");
  var allPresets = getAllPresets();
  var p = editSlug ? allPresets[editSlug] : null;

  if (title) title.textContent = p ? "Edit Client Route: /clients/" + p.slug : "Create New Client Proposal Route";

  document.getElementById("cfg-slug").value = p ? p.slug : "";
  document.getElementById("cfg-slug").readOnly = !!p;
  document.getElementById("slug-preview").textContent = p ? p.slug : "your-slug";

  document.getElementById("cfg-name").value = p ? p.name : "";
  document.getElementById("cfg-client").value = p ? (p.clientName || "") : "";
  document.getElementById("cfg-biz").value = p ? (p.businessName || "") : "";
  document.getElementById("cfg-title").value = p ? (p.title || "") : "";
  document.getElementById("cfg-lead").value = p ? (p.lead || "") : "";
  document.getElementById("cfg-thisplan").value = p ? (p.thisPlan || "") : "";

  // Render feature checklist for pre-selection
  var checklist = document.getElementById("cfg-items-checklist");
  if (checklist) {
    var checkHtml = "";
    var currentSelected = (p && p.initialSelected) ? p.initialSelected : ["w_front", "b_db", "b_admin"];

    GROUPS.forEach(function (g) {
      checkHtml += '<div style="grid-column: 1 / -1; margin-top: 8px; font-weight: 600; font-size: 12px; text-transform: uppercase;">' + g + '</div>';
      Object.keys(ITEMS).forEach(function (id) {
        if (ITEMS[id].g === g) {
          var checked = currentSelected.indexOf(id) > -1 ? " checked" : "";
          checkHtml += '<label class="checkbox-item"><input type="checkbox" name="cfg-item" value="' + id + '"' + checked + '><span>' + ITEMS[id].n + '</span></label>';
        }
      });
    });
    checklist.innerHTML = checkHtml;
  }

  editor.hidden = false;
  editor.scrollIntoView({ behavior: "smooth" });
}

function saveEditorData() {
  var slug = document.getElementById("cfg-slug").value.trim().toLowerCase();
  var name = document.getElementById("cfg-name").value.trim();

  if (!slug || !name) {
    alert("Please enter a slug and proposal name.");
    return;
  }

  var selectedBoxes = document.querySelectorAll('input[name="cfg-item"]:checked');
  var preSelected = [];
  selectedBoxes.forEach(function (cb) { preSelected.push(cb.value); });

  var existing = getAllPresets()[slug] || {};
  var preset = {
    slug: slug,
    name: name,
    badge: "Proposal for " + name,
    clientName: document.getElementById("cfg-client").value.trim(),
    businessName: document.getElementById("cfg-biz").value.trim(),
    title: document.getElementById("cfg-title").value.trim() || ("magnm Proposal: " + name),
    lead: document.getElementById("cfg-lead").value.trim() || existing.lead || "A custom software and platform plan configured specifically for " + name + ".",
    whatWeDo: existing.whatWeDo || "Full-Stack Web & SaaS, Mobile Apps (iOS/Android), Cloud Backend & APIs, AI & Automation",
    portfolio: "magnm-org.vercel.app",
    thisPlan: document.getElementById("cfg-thisplan").value.trim() || ("Custom software architecture for " + name),
    architectureBlock: existing.architectureBlock || {
      heading: "Platform Architecture & Execution",
      sub: "Tailored scope designed to deliver optimal reliability, UX, and ROI.",
      roles: [
        { label: "Frontend Experience", points: ["Modern responsive interfaces", "Fluid interactions and branding", "Optimized mobile experience"] },
        { label: "Backend Core", points: ["Reliable cloud APIs", "Secure database storage", "Automated backups & alerts"] },
        { label: "DevOps & Scale", points: ["Automated deployment workflows", "Continuous uptime monitoring", "Ongoing software support"] }
      ]
    },
    initialSelected: preSelected
  };

  saveCustomPreset(preset);
  document.getElementById("admin-editor").hidden = true;
  renderAdminList();
  showToast("Client route '/clients/" + slug + "' created successfully!");
}

/* ---------- Navigation & Scrollspy ---------- */
function go(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

var secs = ["p1", "p2", "p3", "p4", "p5"];
function spy() {
  if (typeof window === "undefined" || (activeRoute && activeRoute.view === "admin")) return;
  var y = window.scrollY + 140, cur = "p1";
  secs.forEach(function (s) {
    var el = document.getElementById(s);
    if (el && el.offsetTop <= y) cur = s;
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.setAttribute("aria-current", b.getAttribute("data-go") === cur ? "true" : "false");
  });
}

function bindGlobalEvents() {
  if (typeof document === "undefined") return;

  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { go(b.getAttribute("data-go")); });
  });

  var seePlanBtn = document.getElementById("seeplan");
  if (seePlanBtn) {
    seePlanBtn.addEventListener("click", function () { go("summary"); });
  }

  var proposalForm = document.getElementById("form");
  if (proposalForm) {
    proposalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      downloadPdf();
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", spy, { passive: true });
  }
}

/* ---------- Kickoff ---------- */
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", function () {
    bindGlobalEvents();
    init();
  });
  if (document.readyState === "interactive" || document.readyState === "complete") {
    bindGlobalEvents();
    init();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ITEMS: ITEMS,
    GROUPS: GROUPS,
    STANDALONE_FEE: STANDALONE_FEE,
    parseRoute: parseRoute,
    money: money,
    moneyPdf: moneyPdf,
    total: total,
    chosen: chosen,
    standaloneFee: standaloneFee,
    addWithDeps: addWithDeps,
    dependents: dependents
  };
}
