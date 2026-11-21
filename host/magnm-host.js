/* Studio host adapter for vendored Magnm-Pitch. Runs after app.js and before DOMContentLoaded init. */
(function () {
  var dataEl = document.getElementById("magnm-pitch-data");
  if (!dataEl) return;

  var data;
  try {
    data = JSON.parse(dataEl.textContent || "{}");
  } catch (e) {
    return;
  }
  if (!data || typeof data !== "object") return;

  function stripAngleBrackets(value) {
    if (typeof value === "string") {
      return value.replace(/[<>]/g, "");
    }
    if (Array.isArray(value)) {
      return value.map(stripAngleBrackets);
    }
    if (value && typeof value === "object") {
      var out = {};
      Object.keys(value).forEach(function (k) {
        out[k] = stripAngleBrackets(value[k]);
      });
      return out;
    }
    return value;
  }

  var SANITIZE_KEYS = [
    "custom_items",
    "preset",
    "contact",
    "payment_plan",
    "payment_note",
    "timeline",
    "service_plans",
    "hidden_sheets",
    "hidden_about",
    "custom_categories",
    "included_from_hidden"
  ];

  function sanitizePayloadFields(obj) {
    if (!obj || typeof obj !== "object") return;
    for (var sk = 0; sk < SANITIZE_KEYS.length; sk++) {
      var sKey = SANITIZE_KEYS[sk];
      if (obj[sKey] !== undefined) {
        obj[sKey] = stripAngleBrackets(obj[sKey]);
      }
    }
  }

  sanitizePayloadFields(data);

  var context = data.context === "public" ? "public" : "studio";
  function isPublicContext() {
    return context === "public";
  }

  function isLocked() {
    return data.locked === true;
  }

  var PERIOD_SUFFIXES = {
    monthly: " / month",
    quarterly: " / quarter",
    yearly: " / year",
    one_time: ""
  };

  function periodSuffix(period) {
    return Object.prototype.hasOwnProperty.call(PERIOD_SUFFIXES, period) ? PERIOD_SUFFIXES[period] : "";
  }

  var BASE_PRICES = {};
  if (typeof ITEMS !== "undefined") {
    Object.keys(ITEMS).forEach(function (id) {
      BASE_PRICES[id] = ITEMS[id].p;
    });
  }

  var INITIAL_GROUPS = typeof GROUPS !== "undefined" && Array.isArray(GROUPS) ? GROUPS.slice() : [];

  function applyCustomCategoriesToGroups(categories) {
    if (typeof GROUPS === "undefined" || !Array.isArray(GROUPS)) return;
    GROUPS.length = 0;
    for (var i = 0; i < INITIAL_GROUPS.length; i++) {
      GROUPS.push(INITIAL_GROUPS[i]);
    }
    if (!Array.isArray(categories)) return;
    for (var j = 0; j < categories.length; j++) {
      var cat = categories[j];
      if (
        cat &&
        typeof cat === "object" &&
        typeof cat.name === "string" &&
        cat.name.trim() &&
        GROUPS.indexOf(cat.name) === -1
      ) {
        GROUPS.push(cat.name);
      }
    }
  }

  function applyPrices(priceMap) {
    if (typeof ITEMS === "undefined") return;
    Object.keys(BASE_PRICES).forEach(function (id) {
      if (ITEMS[id]) ITEMS[id].p = BASE_PRICES[id];
    });
    if (!priceMap || typeof priceMap !== "object") return;
    var priceKeys = Object.keys(priceMap);
    for (var i = 0; i < priceKeys.length; i++) {
      var id = priceKeys[i];
      var price = priceMap[id];
      if (
        Object.prototype.hasOwnProperty.call(ITEMS, id) &&
        typeof price === "number" &&
        isFinite(price) &&
        price >= 0 &&
        Math.floor(price) === price
      ) {
        ITEMS[id].p = price;
      }
    }
  }

  function applyCustomItems(customItems) {
    if (typeof ITEMS === "undefined" || typeof GROUPS === "undefined") return;
    Object.keys(ITEMS).forEach(function (id) {
      if (id.indexOf("custom_") === 0) {
        delete ITEMS[id];
      }
    });
    if (!Array.isArray(customItems)) return;
    for (var j = 0; j < customItems.length; j++) {
      var item = customItems[j];
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        item.id.indexOf("custom_") === 0 &&
        GROUPS.indexOf(item.g) !== -1 &&
        typeof item.n === "string" &&
        typeof item.d === "string" &&
        typeof item.p === "number" &&
        isFinite(item.p) &&
        item.p >= 0 &&
        Math.floor(item.p) === item.p
      ) {
        ITEMS[item.id] = {
          g: item.g,
          n: item.n,
          d: item.d,
          p: item.p,
          r: Array.isArray(item.r) ? item.r.slice() : []
        };
      }
    }
  }

  var registeredPlanIds = [];

  function applyServicePlans(servicePlans) {
    if (typeof ITEMS === "undefined") return;
    for (var i = 0; i < registeredPlanIds.length; i++) {
      delete ITEMS[registeredPlanIds[i]];
    }
    registeredPlanIds = [];
    if (!isLocked() || !Array.isArray(servicePlans)) return;
    for (var j = 0; j < servicePlans.length; j++) {
      var sp = servicePlans[j];
      if (
        sp &&
        typeof sp === "object" &&
        sp.period === "one_time" &&
        typeof sp.id === "string" &&
        sp.id &&
        typeof sp.name === "string" &&
        typeof sp.price === "number" &&
        isFinite(sp.price) &&
        sp.price >= 0 &&
        Math.floor(sp.price) === sp.price &&
        !Object.prototype.hasOwnProperty.call(ITEMS, sp.id)
      ) {
        ITEMS[sp.id] = {
          g: "DevOps & Maintenance",
          n: sp.name,
          d: typeof sp.description === "string" ? sp.description : "",
          p: sp.price,
          r: []
        };
        registeredPlanIds.push(sp.id);
      }
    }
  }

  function selectOneTimePlans() {
    if (!isLocked() || typeof sel === "undefined" || typeof ITEMS === "undefined") return;
    for (var i = 0; i < registeredPlanIds.length; i++) {
      var pid = registeredPlanIds[i];
      if (ITEMS[pid]) sel[pid] = true;
    }
  }

  // 1. Register custom categories on GROUPS, override base item prices, and register custom items.
  applyCustomCategoriesToGroups(data.custom_categories);
  applyPrices(data.prices);
  applyCustomItems(data.custom_items);
  applyServicePlans(data.service_plans);

  // 2. Disable Pitch's built-in /admin route inside the Studio host.
  var origParseRoute = typeof window.parseRoute === "function" ? window.parseRoute : null;
  if (origParseRoute) {
    var currentRoute = origParseRoute();
    if (currentRoute && currentRoute.view === "admin") {
      var cleanParams = new URLSearchParams(window.location.search || "");
      cleanParams.delete("admin");
      if (!cleanParams.get("client")) {
        cleanParams.set("client", "general");
      }
      var basePath = window.location.pathname || "/pitch/";
      if (basePath === "/admin" || basePath.indexOf("/admin/") === 0) {
        basePath = "/pitch/";
      }
      var cleanQs = cleanParams.toString();
      window.history.replaceState(null, "", basePath + (cleanQs ? "?" + cleanQs : ""));
    }

    window.parseRoute = function () {
      var r = origParseRoute();
      if (r && r.view === "admin") {
        return { view: "planner", client: "general" };
      }
      return r;
    };
  }

  // 3. Sheet structure, custom categories, hidden sheets, hidden About sections, and navigation.
  var origBuildPlannerSections =
    typeof window.buildPlannerSections === "function" ? window.buildPlannerSections : null;
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  var SHEET_KEYS = ["p2", "p3", "p4", "p5"];
  var ALL_BUILTIN_SHEETS = ["p1", "p2", "p3", "p4", "p5"];
  var customSheetIds = [];
  var catIdToSheetId = {};

  function setHidden(el, shouldHide) {
    if (!el) return;
    if (shouldHide) {
      el.hidden = true;
      el.style.display = "none";
    } else {
      el.hidden = false;
      el.style.display = "";
    }
  }

  function isElementHidden(el) {
    if (!el) return true;
    var cur = el;
    while (cur && cur.nodeType === 1) {
      if (cur.hidden || cur.style.display === "none") return true;
      cur = cur.parentNode;
    }
    return false;
  }

  function createItemButton(id, it) {
    if (!it) return null;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "item";
    b.setAttribute("role", "checkbox");
    b.setAttribute("data-id", id);
    b.innerHTML =
      '<span class="box">' +
      TICK +
      '</span><span><span class="name"></span><span class="desc"></span><span class="note"></span></span><span class="price"></span>';
    b.querySelector(".name").textContent = it.n;
    b.querySelector(".desc").textContent = it.d;
    b.querySelector(".price").textContent =
      typeof window.money === "function" ? window.money(it.p) : String(it.p);
    b.addEventListener("click", function () {
      if (typeof window.toggle === "function") window.toggle(id);
    });
    return b;
  }

  function buildGroupElement(labelText, itemIds) {
    if (typeof ITEMS === "undefined" || !Array.isArray(itemIds) || !itemIds.length) return null;
    var groupEl = document.createElement("div");
    groupEl.className = "group";

    var labelEl = document.createElement("div");
    labelEl.className = "label";
    var labelSpan = document.createElement("span");
    labelSpan.textContent = labelText;
    labelEl.appendChild(labelSpan);
    groupEl.appendChild(labelEl);

    var itemsEl = document.createElement("div");
    itemsEl.className = "items";
    for (var i = 0; i < itemIds.length; i++) {
      var id = itemIds[i];
      if (!ITEMS[id]) continue;
      var btn = createItemButton(id, ITEMS[id]);
      if (btn) itemsEl.appendChild(btn);
    }
    if (!itemsEl.childNodes.length) return null;
    groupEl.appendChild(itemsEl);
    return groupEl;
  }

  function categoryItemIdsForSheet(sheetKey) {
    var map = {};
    if (!Array.isArray(data.custom_categories)) return map;
    for (var i = 0; i < data.custom_categories.length; i++) {
      var cat = data.custom_categories[i];
      if (cat && typeof cat === "object" && cat.placement === sheetKey) {
        var ids = resolveCategoryItems(cat);
        for (var j = 0; j < ids.length; j++) {
          map[ids[j]] = true;
        }
      }
    }
    return map;
  }

  function includedItemIdsForSheet(sheetKey) {
    var map = {};
    if (!Array.isArray(data.included_from_hidden)) return map;
    for (var i = 0; i < data.included_from_hidden.length; i++) {
      var entry = data.included_from_hidden[i];
      if (entry && typeof entry === "object" && entry.sheet_shown_on === sheetKey && entry.item_id) {
        map[entry.item_id] = true;
      }
    }
    return map;
  }

  function filterSheetSections(sheetKey, sectionIds) {
    var container = document.getElementById(sheetKey + "-groups");
    if (!container) return;

    var catItemSet = categoryItemIdsForSheet(sheetKey);
    var incItemSet = includedItemIdsForSheet(sheetKey);
    var wantedIds = [];
    var allowedSet = {};
    for (var i = 0; i < sectionIds.length; i++) {
      var id = String(sectionIds[i] || "").trim();
      if (!id) continue;
      if (!Object.prototype.hasOwnProperty.call(allowedSet, id)) {
        allowedSet[id] = true;
        wantedIds.push(id);
      }
    }

    var renderedIds = {};
    var groups = Array.prototype.slice.call(container.querySelectorAll(".group"));
    groups.forEach(function (groupEl) {
      var buttons = Array.prototype.slice.call(groupEl.querySelectorAll("button.item[data-id]"));
      buttons.forEach(function (btn) {
        var btnId = btn.getAttribute("data-id");
        if (!Object.prototype.hasOwnProperty.call(allowedSet, btnId)) {
          if (btn.parentNode) btn.parentNode.removeChild(btn);
        } else {
          renderedIds[btnId] = true;
        }
      });
      if (!groupEl.querySelector("button.item[data-id]")) {
        if (groupEl.parentNode) groupEl.parentNode.removeChild(groupEl);
      }
    });

    if (typeof ITEMS === "undefined") return;
    var extraIds = wantedIds.filter(function (id) {
      return (
        !Object.prototype.hasOwnProperty.call(renderedIds, id) &&
        !Object.prototype.hasOwnProperty.call(catItemSet, id) &&
        !Object.prototype.hasOwnProperty.call(incItemSet, id) &&
        ITEMS[id]
      );
    });

    if (extraIds.length > 0) {
      var extraGroup = buildGroupElement("Additional services", extraIds);
      if (extraGroup) container.appendChild(extraGroup);
    }
  }

  function resolveCategoryItems(cat) {
    if (!cat || typeof cat !== "object") return [];
    if (Array.isArray(cat.item_ids)) {
      return cat.item_ids.filter(function (id) {
        return typeof id === "string" && typeof ITEMS !== "undefined" && !!ITEMS[id];
      });
    }
    if (typeof ITEMS === "undefined" || typeof cat.name !== "string" || !cat.name) return [];
    var out = [];
    Object.keys(ITEMS).forEach(function (id) {
      if (ITEMS[id] && ITEMS[id].g === cat.name) {
        if (isLocked() && typeof sel !== "undefined" && !sel[id]) return;
        out.push(id);
      }
    });
    return out;
  }

  function clearCustomSheets() {
    for (var i = 0; i < customSheetIds.length; i++) {
      var sid = customSheetIds[i];
      var secEl = document.getElementById(sid);
      if (secEl && secEl.parentNode) secEl.parentNode.removeChild(secEl);
      var navBtn = document.querySelector('#main-nav button[data-go="' + sid + '"]');
      if (navBtn && navBtn.parentNode) navBtn.parentNode.removeChild(navBtn);
    }
    customSheetIds = [];
    catIdToSheetId = {};
  }

  function ensureSummaryPlaced(lastVisibleSheetId) {
    var summaryEl = document.getElementById("summary");
    if (!summaryEl || !lastVisibleSheetId) return;
    var targetSheet = document.getElementById(lastVisibleSheetId);
    if (targetSheet && summaryEl.parentNode !== targetSheet) {
      targetSheet.appendChild(summaryEl);
    }
  }

  function renderPlacedCategoriesOnSheet(sheetKey) {
    if (!Array.isArray(data.custom_categories)) return;
    var container = document.getElementById(sheetKey + "-groups");
    if (!container) return;
    for (var i = 0; i < data.custom_categories.length; i++) {
      var cat = data.custom_categories[i];
      if (!cat || typeof cat !== "object" || cat.placement !== sheetKey) continue;
      var itemIds = resolveCategoryItems(cat);
      var groupEl = buildGroupElement(cat.name || "", itemIds);
      if (groupEl) container.appendChild(groupEl);
    }
  }

  function resolveSheetTargetId(rawId) {
    if (!rawId || typeof rawId !== "string") return "";
    if (document.getElementById(rawId)) return rawId;
    if (Object.prototype.hasOwnProperty.call(catIdToSheetId, rawId)) {
      return catIdToSheetId[rawId];
    }
    return rawId;
  }

  function renderIncludedServicesForSheet(sheetId, rawCatId) {
    if (!Array.isArray(data.included_from_hidden) || !data.included_from_hidden.length) return;
    var container = document.getElementById(sheetId + "-groups");
    if (!container) return;
    var incIds = [];
    var seen = {};
    for (var i = 0; i < data.included_from_hidden.length; i++) {
      var entry = data.included_from_hidden[i];
      if (!entry || typeof entry !== "object" || typeof entry.item_id !== "string") continue;
      var target = entry.sheet_shown_on;
      if (target === sheetId || (rawCatId && target === rawCatId)) {
        if (!Object.prototype.hasOwnProperty.call(seen, entry.item_id)) {
          seen[entry.item_id] = true;
          incIds.push(entry.item_id);
        }
      }
    }
    if (!incIds.length) return;
    var groupEl = buildGroupElement("Included services", incIds);
    if (groupEl) container.appendChild(groupEl);
  }

  function buildNewSheetSection(sheetId, cat) {
    var sec = document.createElement("section");
    sec.className = "sheet";
    sec.id = sheetId;

    var pageno = document.createElement("div");
    pageno.className = "pageno";
    var pageSpan = document.createElement("span");
    pageSpan.textContent = "Page 1 of 1";
    var titleSpan = document.createElement("span");
    titleSpan.textContent = cat.sheet_title || cat.name || "";
    pageno.appendChild(pageSpan);
    pageno.appendChild(titleSpan);
    sec.appendChild(pageno);

    var h2 = document.createElement("h2");
    h2.className = "big";
    h2.textContent = cat.sheet_title || cat.name || "";
    sec.appendChild(h2);

    if (typeof cat.sheet_lead === "string" && cat.sheet_lead.trim()) {
      var leadP = document.createElement("p");
      leadP.className = "lead";
      leadP.textContent = cat.sheet_lead;
      sec.appendChild(leadP);
    }

    var groupsDiv = document.createElement("div");
    groupsDiv.id = sheetId + "-groups";
    var itemIds = resolveCategoryItems(cat);
    var groupEl = buildGroupElement(cat.name || "", itemIds);
    if (groupEl) groupsDiv.appendChild(groupEl);
    sec.appendChild(groupsDiv);

    return sec;
  }

  function buildNewSheetNavButton(sheetId, labelText) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-go", sheetId);
    var numI = document.createElement("i");
    numI.textContent = "1";
    btn.appendChild(numI);
    btn.appendChild(document.createTextNode(" " + (labelText || "")));
    btn.addEventListener("click", function () {
      if (typeof window.go === "function") window.go(sheetId);
    });
    return btn;
  }

  function applySheetsAndNavigation() {
    clearCustomSheets();

    var hiddenSet = {};
    if (Array.isArray(data.hidden_sheets)) {
      for (var i = 0; i < data.hidden_sheets.length; i++) {
        var hs = String(data.hidden_sheets[i] || "").trim();
        if (SHEET_KEYS.indexOf(hs) !== -1) {
          hiddenSet[hs] = true;
        }
      }
    }

    // Show/hide built-in sheets p2..p5 and their nav buttons.
    for (var s = 0; s < SHEET_KEYS.length; s++) {
      var skey = SHEET_KEYS[s];
      var isHid = Object.prototype.hasOwnProperty.call(hiddenSet, skey);
      var secEl = document.getElementById(skey);
      var navBtn = document.querySelector('#main-nav button[data-go="' + skey + '"]');
      setHidden(secEl, isHid);
      setHidden(navBtn, isHid);
    }

    // Determine the last visible built-in software sheet (or p1 if p2..p5 are all hidden).
    var insertAfterEl = document.getElementById("p1");
    for (var b = 0; b < SHEET_KEYS.length; b++) {
      var bKey = SHEET_KEYS[b];
      if (!Object.prototype.hasOwnProperty.call(hiddenSet, bKey)) {
        var bEl = document.getElementById(bKey);
        if (bEl) insertAfterEl = bEl;
      }
    }

    // Build new_sheet categories after the last visible built-in software sheet.
    var navWrap = document.querySelector("#main-nav .wrap");
    var pcCounter = 0;
    if (Array.isArray(data.custom_categories)) {
      for (var c = 0; c < data.custom_categories.length; c++) {
        var cat = data.custom_categories[c];
        if (!cat || typeof cat !== "object" || cat.placement !== "new_sheet") continue;
        var itemIds = resolveCategoryItems(cat);
        if (isLocked() && !itemIds.length) continue;
        pcCounter += 1;
        var pcId = "pc" + pcCounter;
        customSheetIds.push(pcId);
        if (cat.id) {
          catIdToSheetId[cat.id] = pcId;
        }
        var newSec = buildNewSheetSection(pcId, cat);
        if (insertAfterEl && insertAfterEl.parentNode) {
          insertAfterEl.parentNode.insertBefore(newSec, insertAfterEl.nextSibling);
          insertAfterEl = newSec;
        }
        if (navWrap) {
          var newBtn = buildNewSheetNavButton(pcId, cat.sheet_title || cat.name || "");
          navWrap.appendChild(newBtn);
        }
        renderIncludedServicesForSheet(pcId, cat.id);
      }
    }

    // Build ordered list of visible sheets: p1 + visible p2..p5 + custom sheets.
    var visibleSheets = ["p1"];
    for (var v = 0; v < SHEET_KEYS.length; v++) {
      if (!Object.prototype.hasOwnProperty.call(hiddenSet, SHEET_KEYS[v])) {
        visibleSheets.push(SHEET_KEYS[v]);
      }
    }
    for (var k = 0; k < customSheetIds.length; k++) {
      visibleSheets.push(customSheetIds[k]);
    }

    // Keep #summary at the end of the last visible sheet so it stays visible even when p5 is hidden.
    var lastSheetId = visibleSheets[visibleSheets.length - 1] || "p5";
    ensureSummaryPlaced(lastSheetId);

    // Update Pitch's global secs array for spy().
    if (typeof window.secs !== "undefined" && Array.isArray(window.secs)) {
      window.secs.length = 0;
      for (var sc = 0; sc < visibleSheets.length; sc++) {
        window.secs.push(visibleSheets[sc]);
      }
    }

    // Renumber nav buttons and .pageno "Page N of M", and update nav grid-template-columns.
    var totalVisible = visibleSheets.length;
    if (navWrap) {
      navWrap.style.gridTemplateColumns =
        totalVisible !== 5 ? "repeat(" + totalVisible + ", 1fr)" : "";
    }
    for (var idx = 0; idx < totalVisible; idx++) {
      var sid = visibleSheets[idx];
      var pageNum = idx + 1;
      var btn = document.querySelector('#main-nav button[data-go="' + sid + '"]');
      if (btn) {
        var iEl = btn.querySelector("i");
        if (iEl) iEl.textContent = String(pageNum);
      }
      var sheetEl = document.getElementById(sid);
      if (sheetEl) {
        var pagenoSpan = sheetEl.querySelector(".pageno span:first-child");
        if (pagenoSpan) {
          pagenoSpan.textContent = "Page " + pageNum + " of " + totalVisible;
        }
      }
    }
  }

  function findAboutElements() {
    var p1 = document.getElementById("p1");
    if (!p1) return {};
    var leadEl = p1.querySelector("p.lead");
    var whoDl = p1.querySelector("dl.who");
    var whoRows = { what_we_do: null, portfolio: null, this_plan: null };
    if (whoDl) {
      var divs = whoDl.querySelectorAll(":scope > div");
      for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        var dt = div.querySelector("dt");
        var dtText = dt ? (dt.textContent || "").trim().toLowerCase() : "";
        if (dtText === "what we do" || div.querySelector("#hero-what")) {
          whoRows.what_we_do = div;
        } else if (dtText === "portfolio") {
          whoRows.portfolio = div;
        } else if (dtText === "this plan" || div.querySelector("#hero-plan")) {
          whoRows.this_plan = div;
        }
      }
    }
    var archEl = document.getElementById("architecture-block-container");
    var stepsOl = p1.querySelector("ol.steps");
    var timelineBlock = stepsOl ? stepsOl.closest(".block") || stepsOl.parentNode : null;
    var payDiv = p1.querySelector(".pay");
    var paymentBlock = payDiv ? payDiv.closest(".block") || payDiv.parentNode : null;
    return {
      lead: leadEl,
      whoDl: whoDl,
      what_we_do: whoRows.what_we_do,
      portfolio: whoRows.portfolio,
      this_plan: whoRows.this_plan,
      architecture: archEl,
      timeline: timelineBlock,
      payment: paymentBlock
    };
  }

  function isAboutHidden(key) {
    if (!Array.isArray(data.hidden_about)) return false;
    return data.hidden_about.indexOf(key) !== -1;
  }

  function applyHiddenAbout() {
    var els = findAboutElements();
    var hideWhat = isAboutHidden("what_we_do");
    var hidePort = isAboutHidden("portfolio");
    var hidePlan = isAboutHidden("this_plan");

    setHidden(els.lead, isAboutHidden("lead"));
    setHidden(els.what_we_do, hideWhat);
    setHidden(els.portfolio, hidePort);
    setHidden(els.this_plan, hidePlan);
    setHidden(els.whoDl, hideWhat && hidePort && hidePlan);
    setHidden(els.architecture, isAboutHidden("architecture"));
    setHidden(els.timeline, isAboutHidden("timeline"));
    setHidden(els.payment, isAboutHidden("payment"));
  }

  function updatePortfolioAndBanner(preset) {
    var bannerLinks = document.querySelector("#client-banner .banner-links");
    if (bannerLinks) {
      bannerLinks.hidden = true;
      bannerLinks.style.display = "none";
    }
    if (!preset) return;
    var portfolioEl = document.querySelector("#p1 .who a");
    if (portfolioEl && typeof preset.portfolio === "string" && preset.portfolio.trim()) {
      var rawPort = preset.portfolio.trim();
      portfolioEl.textContent = rawPort;
      if (/^https?:\/\//i.test(rawPort)) {
        portfolioEl.setAttribute("href", rawPort);
      } else {
        portfolioEl.setAttribute("href", "https://" + rawPort);
      }
    }
  }

  function renderArchitectureSafe(preset) {
    var container = document.getElementById("architecture-block-container");
    if (!container) return;
    container.innerHTML = "";
    var arch = preset && preset.architectureBlock;
    if (!arch || !Array.isArray(arch.roles) || !arch.roles.length) return;

    var block = document.createElement("div");
    block.className = "block";
    if (arch.heading) {
      var h2 = document.createElement("h2");
      h2.textContent = arch.heading;
      block.appendChild(h2);
    }
    if (arch.sub) {
      var sub = document.createElement("p");
      sub.className = "sub";
      sub.textContent = arch.sub;
      block.appendChild(sub);
    }
    var rolesEl = document.createElement("div");
    rolesEl.className = "roles";
    arch.roles.forEach(function (role) {
      var roleEl = document.createElement("div");
      roleEl.className = "role";
      var labelEl = document.createElement("span");
      labelEl.className = "label";
      labelEl.textContent = role.label || "";
      roleEl.appendChild(labelEl);
      var ol = document.createElement("ol");
      (Array.isArray(role.points) ? role.points : []).forEach(function (pt) {
        var li = document.createElement("li");
        li.textContent = pt || "";
        ol.appendChild(li);
      });
      roleEl.appendChild(ol);
      rolesEl.appendChild(roleEl);
    });
    block.appendChild(rolesEl);
    container.appendChild(block);
  }

  function createServicePlanButton(plan) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "item";
    b.setAttribute("role", "checkbox");
    b.setAttribute("data-id", plan.id);
    b.setAttribute("aria-checked", "true");
    b.setAttribute("data-locked", "true");
    b.setAttribute("aria-disabled", "true");
    b.innerHTML =
      '<span class="box">' +
      TICK +
      '</span><span><span class="name"></span><span class="desc"></span><span class="note"></span></span><span class="price"></span>';
    b.querySelector(".name").textContent = typeof plan.name === "string" ? plan.name : "";
    b.querySelector(".desc").textContent = typeof plan.description === "string" ? plan.description : "";
    var priceVal = typeof plan.price === "number" && isFinite(plan.price) ? plan.price : 0;
    var priceText = typeof window.money === "function" ? window.money(priceVal) : String(priceVal);
    b.querySelector(".price").textContent = priceText + periodSuffix(plan.period);
    b.addEventListener("click", function () {
      if (typeof window.toggle === "function") window.toggle(plan.id);
    });
    return b;
  }

  function renderServicePlansGroup() {
    if (!isLocked() || !Array.isArray(data.service_plans) || !data.service_plans.length) return;
    var container = document.getElementById("p5-groups");
    if (!container) return;

    var groupEl = document.createElement("div");
    groupEl.className = "group";

    var labelEl = document.createElement("div");
    labelEl.className = "label";
    var labelSpan = document.createElement("span");
    labelSpan.textContent = "Plans and support";
    labelEl.appendChild(labelSpan);
    groupEl.appendChild(labelEl);

    var itemsEl = document.createElement("div");
    itemsEl.className = "items";
    for (var i = 0; i < data.service_plans.length; i++) {
      var sp = data.service_plans[i];
      if (!sp || typeof sp !== "object" || typeof sp.id !== "string" || !sp.id) continue;
      itemsEl.appendChild(createServicePlanButton(sp));
    }
    if (!itemsEl.childNodes.length) return;
    groupEl.appendChild(itemsEl);
    container.appendChild(groupEl);
  }

  function renderPaymentPlan(paymentPlan, paymentNote) {
    if (!isLocked()) return;
    var payEl = document.querySelector("#p1 .pay");
    if (payEl && Array.isArray(paymentPlan) && paymentPlan.length > 0) {
      payEl.textContent = "";
      payEl.style.gridTemplateColumns =
        paymentPlan.length !== 3 ? "repeat(" + paymentPlan.length + ", 1fr)" : "";
      var fallbackTotal = typeof window.total === "function" ? window.total() : 0;
      for (var i = 0; i < paymentPlan.length; i++) {
        var row = paymentPlan[i];
        if (!row || typeof row !== "object") continue;
        var pct = Number(row.percent) || 0;
        var amt =
          typeof row.amount === "number" && isFinite(row.amount)
            ? row.amount
            : Math.round((fallbackTotal * pct) / 100);
        var cell = document.createElement("div");
        var b = document.createElement("b");
        b.textContent = String(pct) + "%";
        var labelSpan = document.createElement("span");
        labelSpan.textContent = typeof row.label === "string" ? row.label : "";
        var br = document.createElement("br");
        var amtSpan = document.createElement("span");
        amtSpan.textContent = typeof window.money === "function" ? window.money(amt) : String(amt);
        cell.appendChild(b);
        cell.appendChild(labelSpan);
        cell.appendChild(br);
        cell.appendChild(amtSpan);
        payEl.appendChild(cell);
      }
    }
    var payBlock = payEl ? payEl.parentNode : null;
    var payHint = payBlock ? payBlock.querySelector("p.hint") : null;
    if (payHint && typeof paymentNote === "string") {
      payHint.textContent = paymentNote;
    }
  }

  function renderTimeline(timeline) {
    if (!isLocked()) return;
    var stepsEl = document.querySelector("#p1 ol.steps");
    if (!stepsEl || !Array.isArray(timeline) || !timeline.length) return;
    stepsEl.textContent = "";
    for (var i = 0; i < timeline.length; i++) {
      var step = timeline[i];
      if (!step || typeof step !== "object") continue;
      var num = (i + 1 < 10 ? "0" : "") + (i + 1);
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = num;
      var titleSpan = document.createElement("span");
      titleSpan.textContent = typeof step.title === "string" ? step.title : "";
      var whenSpan = document.createElement("span");
      whenSpan.className = "t";
      whenSpan.textContent = typeof step.when === "string" ? step.when : "";
      var detailSmall = document.createElement("small");
      detailSmall.textContent = typeof step.detail === "string" ? step.detail : "";
      li.appendChild(b);
      li.appendChild(titleSpan);
      li.appendChild(whenSpan);
      li.appendChild(detailSmall);
      stepsEl.appendChild(li);
    }
  }

  function prefillContact(contact) {
    if (!contact || typeof contact !== "object") return;
    var pairs = [
      ["f-name", contact.name],
      ["f-biz", contact.business],
      ["f-phone", contact.phone],
      ["f-note", contact.notes]
    ];
    for (var i = 0; i < pairs.length; i++) {
      var el = document.getElementById(pairs[i][0]);
      var val = typeof pairs[i][1] === "string" ? pairs[i][1] : "";
      if (el && !el.value && val) {
        el.value = val;
      }
    }
  }

  function applyLockedAttributes() {
    var buttons = document.querySelectorAll(".item");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("data-locked", "true");
      buttons[i].setAttribute("aria-disabled", "true");
    }
  }

  // Override go() and spy() so hidden sections are ignored and only visible sections are navigated.
  var origGo = typeof window.go === "function" ? window.go : null;
  window.go = function (id) {
    var targetId = resolveSheetTargetId(id);
    var el = document.getElementById(targetId);
    if (!el || isElementHidden(el)) return;
    if (origGo) {
      return origGo.call(this, targetId);
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  var origSpy = typeof window.spy === "function" ? window.spy : null;
  window.spy = function () {
    if (data.kind === "default" && origSpy) {
      return origSpy.apply(this, arguments);
    }
    if (typeof window === "undefined" || (typeof activeRoute !== "undefined" && activeRoute && activeRoute.view === "admin")) {
      return;
    }
    var list = typeof window.secs !== "undefined" && Array.isArray(window.secs) ? window.secs : ALL_BUILTIN_SHEETS;
    var y = (window.scrollY || 0) + 140;
    var cur = "p1";
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var el = document.getElementById(s);
      if (el && !isElementHidden(el) && el.offsetTop <= y) {
        cur = s;
      }
    }
    var navBtns = document.querySelectorAll("[data-go]");
    for (var j = 0; j < navBtns.length; j++) {
      var b = navBtns[j];
      if (isElementHidden(b)) {
        b.setAttribute("aria-current", "false");
      } else {
        b.setAttribute("aria-current", b.getAttribute("data-go") === cur ? "true" : "false");
      }
    }
  };

  var origToggle = typeof window.toggle === "function" ? window.toggle : null;
  window.toggle = function (id) {
    if (isLocked()) return;
    if (origToggle) {
      return origToggle.apply(this, arguments);
    }
  };

  var origUpdate = typeof window.update === "function" ? window.update : null;
  window.update = function () {
    if (origUpdate) {
      origUpdate.apply(this, arguments);
    }
    if (isLocked()) {
      applyLockedAttributes();
    }
  };

  window.buildPlannerSections = function (preset) {
    if (data.kind === "default") {
      if (origBuildPlannerSections) {
        origBuildPlannerSections(preset);
      }
      return;
    }
    updatePortfolioAndBanner(preset);
    if (isLocked()) {
      selectOneTimePlans();
    }
    if (origBuildPlannerSections) {
      origBuildPlannerSections(preset);
    }
    if (preset && preset.sections && typeof preset.sections === "object") {
      SHEET_KEYS.forEach(function (key) {
        var ids = Array.isArray(preset.sections[key]) ? preset.sections[key] : [];
        filterSheetSections(key, ids);
      });
    }
    SHEET_KEYS.forEach(function (key) {
      renderPlacedCategoriesOnSheet(key);
    });
    if (isLocked()) {
      renderServicePlansGroup();
      renderPaymentPlan(data.payment_plan, data.payment_note);
      renderTimeline(data.timeline);
    }
    applySheetsAndNavigation();
    SHEET_KEYS.forEach(function (key) {
      var secEl = document.getElementById(key);
      if (secEl && !isElementHidden(secEl)) {
        renderIncludedServicesForSheet(key, null);
      }
    });
    applyHiddenAbout();
  };

  // 4. Inject proposal preset and activate its slug via ?client=<slug>.
  if (data.preset && typeof data.preset === "object" && typeof data.preset.slug === "string" && data.preset.slug) {
    var slug = data.preset.slug.toLowerCase();
    var origGetAllPresets = typeof window.getAllPresets === "function" ? window.getAllPresets : null;
    window.getAllPresets = function () {
      var all = origGetAllPresets ? origGetAllPresets() : {};
      all[slug] = data.preset;
      return all;
    };

    if (isPublicContext()) {
      window.parseRoute = function () {
        return { view: "planner", client: slug };
      };
    } else {
      var params = new URLSearchParams(window.location.search || "");
      params.delete("admin");
      params.set("client", slug);
      if (typeof data.mode === "string" && data.mode) {
        params.set("mode", data.mode);
      }
      if (data.proposal_id) {
        params.set("proposal", String(data.proposal_id));
      }
      var targetPath = window.location.pathname || "/pitch/";
      if (targetPath.indexOf("/clients/") === 0 || targetPath === "/admin" || targetPath.indexOf("/admin/") === 0) {
        targetPath = "/pitch/";
      }
      window.history.replaceState(null, "", targetPath + "?" + params.toString());
    }
  }

  function buildPaymentTermsText(planRows, note, grandTotal) {
    var parts = [];
    if (Array.isArray(planRows)) {
      for (var i = 0; i < planRows.length; i++) {
        var row = planRows[i];
        if (!row || typeof row !== "object") continue;
        var pct = Number(row.percent) || 0;
        var label = typeof row.label === "string" ? row.label : "";
        var amt =
          typeof row.amount === "number" && isFinite(row.amount)
            ? row.amount
            : Math.round((grandTotal * pct) / 100);
        parts.push(pct + "% " + label + " (" + moneyPdf(amt) + ")");
      }
    }
    var prefix = parts.length ? "Payable as " + parts.join(", ") + "." : "";
    var cleanNote = typeof note === "string" ? note.trim() : "";
    if (prefix && cleanNote) return prefix + " " + cleanNote;
    return prefix || cleanNote;
  }

  function finalQuotationPdf() {
    var st = document.getElementById("status");
    if (!window.jspdf) {
      if (st) st.textContent = "The PDF tool did not load. Check your internet connection.";
      return;
    }
    var recurringPlans = Array.isArray(data.service_plans)
      ? data.service_plans.filter(function (sp) {
          return sp && typeof sp === "object" && sp.period && sp.period !== "one_time";
        })
      : [];
    var grandTotal = typeof window.total === "function" ? window.total() : 0;
    if (!grandTotal && !recurringPlans.length) {
      if (st) st.textContent = "Please select at least one component first.";
      return;
    }

    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210;
    var M = 18;
    var y = 24;

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
    var presetObj = typeof activePreset !== "undefined" ? activePreset : data.preset;
    var planLabel =
      presetObj && presetObj.slug !== "general" && presetObj.name
        ? "Final quotation - " + presetObj.name
        : "Final quotation";
    doc.text(planLabel, W - M, y - 8, { align: "right" });
    doc.text(
      new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      W - M,
      y - 2,
      { align: "right" }
    );
    y += 8;
    rule(0);

    var nm = document.getElementById("f-name") ? document.getElementById("f-name").value.trim() : "";
    var biz = document.getElementById("f-biz") ? document.getElementById("f-biz").value.trim() : "";
    var ph = document.getElementById("f-phone") ? document.getElementById("f-phone").value.trim() : "";
    var nt = document.getElementById("f-note") ? document.getElementById("f-note").value.trim() : "";

    y += 7;
    var metaRows = [
      ["Prepared for", nm],
      ["Business", biz],
      ["Phone", ph],
      ["Scope", presetObj && presetObj.thisPlan ? presetObj.thisPlan : ""]
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
      var fee = g === "Mobile app" ? standaloneFee() : 0;
      var sub =
        ks.reduce(function (s, k) {
          return s + ITEMS[k].p;
        }, 0) + fee;

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
    doc.text("TOTAL", M, y);
    doc.setFontSize(20);
    doc.text(moneyPdf(grandTotal), W - M, y + 1, { align: "right" });
    y += 11;

    if (recurringPlans.length) {
      need(16);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0);
      doc.text("RECURRING", M, y);
      y += 2.5;
      rule(0);
      y += 5.5;

      recurringPlans.forEach(function (sp) {
        need(8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("[x]  " + (sp.name || ""), M, y);
        doc.text(moneyPdf(sp.price) + periodSuffix(sp.period), W - M, y, { align: "right" });
        y += 3;
        doc.setDrawColor(225);
        doc.setLineWidth(0.15);
        doc.line(M, y, W - M, y);
        y += 5;
      });
      y += 4;
    }

    if (!isAboutHidden("payment")) {
      var terms = buildPaymentTermsText(data.payment_plan, data.payment_note, grandTotal);
      if (terms) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60);
        doc.splitTextToSize(terms, W - 2 * M).forEach(function (ln) {
          need(5);
          doc.text(ln, M, y);
          y += 4.6;
        });
      }
    }

    var timelineSteps = !isAboutHidden("timeline") && Array.isArray(data.timeline) ? data.timeline : [];
    if (timelineSteps.length) {
      y += 5;
      need(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(0);
      doc.text("TIMELINE", M, y);
      y += 5;
      timelineSteps.forEach(function (step, idx) {
        if (!step || typeof step !== "object") return;
        var num = (idx + 1 < 10 ? "0" : "") + (idx + 1);
        var titleText = num + "  " + (step.title || "");
        var whenText = step.when || "";
        var detailText = step.detail || "";
        var detailLines = detailText ? doc.splitTextToSize(detailText, W - 2 * M - 8) : [];
        need(8 + detailLines.length * 4.6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(0);
        doc.text(titleText, M, y);
        if (whenText) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(90);
          doc.text(whenText, W - M, y, { align: "right" });
        }
        y += 4.6;
        if (detailLines.length) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(40);
          detailLines.forEach(function (ln) {
            need(5);
            doc.text(ln, M + 8, y);
            y += 4.6;
          });
        }
        y += 1.5;
      });
    }

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

    var slugPart = presetObj && presetObj.slug && presetObj.slug !== "general" ? presetObj.slug + "-" : "";
    var bizPart = biz ? biz.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" : "";
    var fname = "magnm-" + slugPart + bizPart + "estimate.pdf";

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

    doc.save(fname);
    if (st) st.textContent = "Your proposal PDF was downloaded successfully.";
  }

  var origDownloadPdf = typeof window.downloadPdf === "function" ? window.downloadPdf : null;
  if (isLocked()) {
    window.downloadPdf = finalQuotationPdf;
  }

  function readTrimmedCapped(id, maxLen) {
    var el = document.getElementById(id);
    var val = el && typeof el.value === "string" ? el.value.trim() : "";
    return val.length > maxLen ? val.slice(0, maxLen) : val;
  }

  function collectPublicQuoteChoices() {
    var selectedMap = typeof sel !== "undefined" && sel ? sel : {};
    var totalShown = typeof window.total === "function" ? Number(window.total()) || 0 : 0;
    if (window.MagnmShare && typeof window.MagnmShare.buildChoices === "function") {
      return window.MagnmShare.buildChoices(selectedMap, totalShown);
    }
    var selected = [];
    var customSelected = [];
    Object.keys(selectedMap).forEach(function (id) {
      if (!selectedMap[id]) return;
      if (id.indexOf("custom_") === 0) {
        customSelected.push(id);
      } else {
        selected.push(id);
      }
    });
    return {
      selected: selected,
      custom_selected: customSelected,
      total_shown: totalShown
    };
  }

  function collectPublicQuoteContact() {
    var raw = {
      name: readTrimmedCapped("f-name", 500),
      business: readTrimmedCapped("f-biz", 500),
      phone: readTrimmedCapped("f-phone", 500),
      notes: readTrimmedCapped("f-note", 2000)
    };
    if (window.MagnmShare && typeof window.MagnmShare.buildContact === "function") {
      return window.MagnmShare.buildContact(raw);
    }
    return raw;
  }

  function isRateLimitedError(err) {
    if (!err) return false;
    if (err.code === "rate_limited" || err.message === "rate_limited") return true;
    return /rate\s*limit/i.test(String(err.message || ""));
  }

  function installPublicQuoteButton() {
    if (!isPublicContext() || data.mode !== "form") return;
    var formEl = document.getElementById("form");
    var pdfBtn = document.getElementById("pdf");
    if (!formEl || !pdfBtn || document.getElementById("magnm-send-plan")) return;

    var sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.id = "magnm-send-plan";
    sendBtn.className = "btn full";
    sendBtn.textContent = "Send my plan to magnm";

    sendBtn.addEventListener("click", function () {
      var statusEl = document.getElementById("status");
      var contact = collectPublicQuoteContact();
      if (!contact.name || !contact.phone) {
        if (statusEl) statusEl.textContent = "Please enter your name and phone number.";
        return;
      }
      if (!window.MagnmShare || typeof window.MagnmShare.submitQuote !== "function") {
        if (statusEl) statusEl.textContent = "Could not send your plan right now. Please try again.";
        return;
      }

      var choices = collectPublicQuoteChoices();
      sendBtn.disabled = true;
      if (statusEl) statusEl.textContent = "Sending your plan...";

      Promise.resolve(window.MagnmShare.submitQuote(choices, contact)).then(
        function () {
          if (statusEl) {
            statusEl.textContent = "Thanks. magnm has your plan and will contact you soon.";
          }
        },
        function (err) {
          sendBtn.disabled = false;
          if (statusEl) {
            statusEl.textContent = isRateLimitedError(err)
              ? "We already received several requests from this link today. Please call us instead."
              : "Could not send your plan right now. Please try again.";
          }
        }
      );
    });

    formEl.insertBefore(sendBtn, pdfBtn);
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", function () {
      if (isLocked() || data.kind !== "default") {
        prefillContact(data.contact);
      }
      installPublicQuoteButton();
    });
  } else {
    if (isLocked() || data.kind !== "default") {
      prefillContact(data.contact);
    }
    installPublicQuoteButton();
  }

  // 5. Mirror PDF exports to the engine when a proposal_id is active.
  function uploadPdfBlob(doc) {
    if (isPublicContext() || !data.proposal_id || typeof fetch !== "function" || !doc || typeof doc.output !== "function") {
      return;
    }
    try {
      var pdfBlob = doc.output("blob");
      var endpoint = "/api/pitch/proposals/" + encodeURIComponent(String(data.proposal_id)) + "/pdf";
      fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/pdf" },
        body: pdfBlob
      })
        .then(function (resp) {
          return resp && resp.ok && resp.json ? resp.json() : null;
        })
        .then(
          function (res) {
            if (res && window.parent && window.parent !== window) {
              window.parent.postMessage(
                {
                  type: "magnm:pitch-pdf-saved",
                  proposal_id: data.proposal_id,
                  result: res
                },
                window.location.origin
              );
            }
          },
          function () {}
        );
    } catch (err) {
      // Ignore upload failures; browser download still executes.
    }
  }

  if (!isPublicContext() && window.jspdf && typeof window.jspdf.jsPDF === "function") {
    var OrigJsPdf = window.jspdf.jsPDF;
    if (OrigJsPdf.prototype && typeof OrigJsPdf.prototype.save === "function") {
      var origProtoSave = OrigJsPdf.prototype.save;
      OrigJsPdf.prototype.save = function () {
        if (!this._magnmSaveWrapped) {
          uploadPdfBlob(this);
        }
        return origProtoSave.apply(this, arguments);
      };
    }
    var WrappedJsPdf = function () {
      var ctorArgs = [null].concat(Array.prototype.slice.call(arguments));
      var instance = new (Function.prototype.bind.apply(OrigJsPdf, ctorArgs))();
      if (
        instance &&
        Object.prototype.hasOwnProperty.call(instance, "save") &&
        typeof instance.save === "function"
      ) {
        var origInstanceSave = instance.save;
        instance._magnmSaveWrapped = true;
        instance.save = function () {
          uploadPdfBlob(this);
          return origInstanceSave.apply(this, arguments);
        };
      }
      return instance;
    };
    WrappedJsPdf.prototype = OrigJsPdf.prototype;
    Object.keys(OrigJsPdf).forEach(function (k) {
      WrappedJsPdf[k] = OrigJsPdf[k];
    });
    window.jspdf.jsPDF = WrappedJsPdf;
  }

  // 6. Scroll sync helper for {type: "magnm:pitch-scroll-to", target}.
  function resolveScrollTarget(target) {
    if (typeof target !== "string" || !target) return null;
    if (target === "about") {
      return document.getElementById("p1");
    }
    if (target.indexOf("about:") === 0) {
      var aboutKey = target.slice("about:".length);
      var aboutEls = findAboutElements();
      if (
        aboutKey === "lead" ||
        aboutKey === "what_we_do" ||
        aboutKey === "portfolio" ||
        aboutKey === "this_plan" ||
        aboutKey === "architecture" ||
        aboutKey === "timeline" ||
        aboutKey === "payment"
      ) {
        return aboutEls[aboutKey] || null;
      }
      return null;
    }
    if (target === "summary") {
      return document.getElementById("summary");
    }
    if (target.indexOf("item:") === 0) {
      var itemId = target.slice("item:".length);
      if (!itemId) return null;
      var btns = document.querySelectorAll("button.item[data-id]");
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].getAttribute("data-id") === itemId) {
          return btns[i];
        }
      }
      return null;
    }
    var sheetId = resolveSheetTargetId(target);
    if (SHEET_KEYS.indexOf(sheetId) !== -1 || customSheetIds.indexOf(sheetId) !== -1 || sheetId === "p1") {
      return document.getElementById(sheetId);
    }
    return null;
  }

  function prefersReducedMotion() {
    if (typeof window.matchMedia === "function") {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      return !!(mq && mq.matches);
    }
    return false;
  }

  function handleScrollTo(target) {
    var el = resolveScrollTarget(target);
    if (!el || isElementHidden(el)) return;
    var behavior = prefersReducedMotion() ? "instant" : "smooth";
    var navEl = document.getElementById("main-nav");
    var navHeight = 0;
    if (navEl && !isElementHidden(navEl)) {
      var navRect = typeof navEl.getBoundingClientRect === "function" ? navEl.getBoundingClientRect() : null;
      navHeight = (navRect && navRect.height) || navEl.offsetHeight || 56;
    }
    if (typeof window.scrollTo === "function" && typeof el.getBoundingClientRect === "function") {
      var rect = el.getBoundingClientRect();
      var top = Math.max(0, (window.scrollY || window.pageYOffset || 0) + rect.top - navHeight - 12);
      window.scrollTo({ top: top, behavior: behavior });
    } else if (typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: behavior, block: "start" });
    }
  }

  // 7. Live preview updates and scroll sync from Studio editor + Escape exit forwarding.
  if (!isPublicContext()) {
    window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    var msg = event.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "magnm:pitch-scroll-to") {
      handleScrollTo(msg.target);
      return;
    }

    if (msg.type !== "magnm:pitch-preview-update") return;
    var payload = msg.payload || {};
    var savedScrollX = window.scrollX || window.pageXOffset || 0;
    var savedScrollY = window.scrollY || window.pageYOffset || 0;

    if (typeof payload.locked === "boolean") {
      data.locked = payload.locked;
      if (isLocked()) {
        window.downloadPdf = finalQuotationPdf;
      } else if (origDownloadPdf) {
        window.downloadPdf = origDownloadPdf;
      }
    }
    if (typeof payload.kind === "string" && payload.kind) {
      data.kind = payload.kind;
    }
    for (var pk = 0; pk < SANITIZE_KEYS.length; pk++) {
      var pKey = SANITIZE_KEYS[pk];
      if (payload[pKey] !== undefined) {
        data[pKey] = stripAngleBrackets(payload[pKey]);
      }
    }

    applyCustomCategoriesToGroups(data.custom_categories);
    if (payload.prices !== undefined) {
      applyPrices(payload.prices);
      data.prices = payload.prices;
    } else {
      applyPrices(data.prices);
    }
    if (payload.custom_items !== undefined) {
      applyCustomItems(data.custom_items);
    } else {
      applyCustomItems(data.custom_items);
    }
    applyServicePlans(data.service_plans);
    if (payload.contact && typeof payload.contact === "object") {
      prefillContact(data.contact);
    }

    var nextPreset =
      data.preset && typeof data.preset === "object"
        ? data.preset
        : typeof activePreset !== "undefined" && activePreset
        ? activePreset
        : null;

    if (nextPreset) {
      if (typeof activePreset !== "undefined") activePreset = nextPreset;
      var heroLead = document.getElementById("hero-lead");
      if (heroLead) heroLead.textContent = nextPreset.lead || "";
      var heroWhat = document.getElementById("hero-what");
      if (heroWhat) heroWhat.textContent = nextPreset.whatWeDo || "";
      var heroPlan = document.getElementById("hero-plan");
      if (heroPlan) heroPlan.textContent = nextPreset.thisPlan || "";
      var subTitle = document.getElementById("p1-subtitle");
      if (subTitle) subTitle.textContent = nextPreset.slug === "general" ? "Software Planner" : "Client Proposal";
      var fName = document.getElementById("f-name");
      if (fName && nextPreset.clientName !== undefined) fName.value = nextPreset.clientName || "";
      var fBiz = document.getElementById("f-biz");
      if (fBiz && nextPreset.businessName !== undefined) fBiz.value = nextPreset.businessName || "";

      var banner = document.getElementById("client-banner");
      var bannerText = document.getElementById("banner-text");
      if (banner && bannerText) {
        if (nextPreset.slug && nextPreset.slug !== "general") {
          bannerText.innerHTML = "";
          var strong = document.createElement("strong");
          strong.textContent = nextPreset.badge || nextPreset.name || nextPreset.slug;
          bannerText.appendChild(strong);
          bannerText.appendChild(document.createTextNode(" (Route: "));
          var code = document.createElement("code");
          code.textContent = "/clients/" + nextPreset.slug;
          bannerText.appendChild(code);
          bannerText.appendChild(document.createTextNode(")"));
          banner.hidden = false;
        } else {
          banner.hidden = true;
        }
      }

      renderArchitectureSafe(nextPreset);
      if (typeof sel !== "undefined" && payload.preset && Array.isArray(payload.preset.initialSelected)) {
        sel = {};
        var defaults = Array.isArray(nextPreset.initialSelected) ? nextPreset.initialSelected : [];
        defaults.forEach(function (id) {
          if (typeof ITEMS !== "undefined" && ITEMS[id] && typeof window.addWithDeps === "function") {
            window.addWithDeps(id);
          }
        });
      }
      window.buildPlannerSections(nextPreset);
    } else {
      applySheetsAndNavigation();
      applyHiddenAbout();
    }

    if (typeof window.update === "function") window.update();
    if (typeof window.spy === "function") window.spy();
      if (typeof window.scrollTo === "function") {
        window.scrollTo(savedScrollX, savedScrollY);
      }
    });
  }

  if (!isPublicContext() && (data.mode === "present" || data.mode === "form")) {
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "magnm:pitch-exit-present" }, window.location.origin);
      }
    });
  }
})();
