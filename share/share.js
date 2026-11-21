(function () {
  "use strict";

  var SHARE_ROUTE_RE = /^\/(p|q|f)\/([A-Za-z0-9_-]{16,64})$/;
  var ROUTE_ALLOWED_KINDS = {
    p: ["proposal"],
    q: ["proposal", "default_quote"],
    f: ["final"]
  };
  var REQUEST_TIMEOUT_MS = 15000;

  function parseShareRoute(pathname) {
    if (typeof pathname !== "string") return null;
    var match = pathname.match(SHARE_ROUTE_RE);
    if (!match) return null;
    return {
      routeType: match[1],
      id: match[2]
    };
  }

  function isKindAllowedForRoute(kind, routeType) {
    if (typeof kind !== "string" || !Object.prototype.hasOwnProperty.call(ROUTE_ALLOWED_KINDS, routeType)) {
      return false;
    }
    return ROUTE_ALLOWED_KINDS[routeType].indexOf(kind) !== -1;
  }

  function preparePublicPayload(rawPayload, routeType) {
    var payload = Object.assign({}, rawPayload && typeof rawPayload === "object" ? rawPayload : {});
    payload.context = "public";
    payload.mode = routeType === "q" ? "form" : "present";
    payload.locked = routeType === "f";
    return payload;
  }

  function trimAndCap(value, maxLen) {
    if (typeof value !== "string") return "";
    var trimmed = value.trim();
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
  }

  function buildContact(raw) {
    var input = raw && typeof raw === "object" ? raw : {};
    return {
      name: trimAndCap(input.name, 500),
      business: trimAndCap(input.business, 500),
      phone: trimAndCap(input.phone, 500),
      notes: trimAndCap(input.notes, 2000)
    };
  }

  function buildChoices(selectedInput, totalShown) {
    var ids = [];
    if (Array.isArray(selectedInput)) {
      ids = selectedInput;
    } else if (selectedInput && typeof selectedInput === "object") {
      ids = Object.keys(selectedInput).filter(function (k) {
        return !!selectedInput[k];
      });
    }

    var seen = Object.create(null);
    var selected = [];
    var customSelected = [];

    for (var i = 0; i < ids.length; i++) {
      var id = typeof ids[i] === "string" ? ids[i].trim() : "";
      if (!id || seen[id]) continue;
      seen[id] = true;
      if (id.indexOf("custom_") === 0) {
        customSelected.push(id);
      } else {
        selected.push(id);
      }
    }

    var numericTotal = Number(totalShown);
    return {
      selected: selected,
      custom_selected: customSelected,
      total_shown: Number.isFinite(numericTotal) ? numericTotal : 0
    };
  }

  function mapSubmitQuoteError(status, body) {
    var rawMsg = "";
    if (typeof body === "string") {
      rawMsg = body;
    } else if (body && typeof body === "object") {
      rawMsg = String(body.message || body.error_description || body.error || body.hint || "");
    }
    if (status === 429 || /rate\s*limit/i.test(rawMsg)) {
      var rateErr = new Error("rate_limited");
      rateErr.code = "rate_limited";
      return rateErr;
    }
    var err = new Error(rawMsg || "Request failed with status " + status);
    err.code = "submit_failed";
    return err;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      parseShareRoute: parseShareRoute,
      isKindAllowedForRoute: isKindAllowedForRoute,
      preparePublicPayload: preparePublicPayload,
      buildContact: buildContact,
      buildChoices: buildChoices,
      mapSubmitQuoteError: mapSubmitQuoteError
    };
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  document.documentElement.style.visibility = "hidden";

  var preparedFor = "";

  /** Replace the planner's internal "(Route: /clients/...)" banner with "Prepared for <business>". */
  function applyPublicBanner() {
    var banner = document.getElementById("client-banner");
    var bannerText = document.getElementById("banner-text");
    if (!banner || !bannerText) return;
    bannerText.textContent = "";
    if (!preparedFor) {
      banner.hidden = true;
      return;
    }
    var strong = document.createElement("strong");
    strong.textContent = "Prepared for";
    bannerText.appendChild(strong);
    bannerText.appendChild(document.createTextNode(" " + preparedFor));
    banner.hidden = false;
  }

  function showPage() {
    applyPublicBanner();
    document.documentElement.style.visibility = "";
  }

  function showUnavailable() {
    document.title = "Link unavailable | magnm";
    var body = document.body;
    if (body) {
      body.textContent = "";

      var main = document.createElement("main");
      main.className = "wrap";

      var section = document.createElement("section");
      section.className = "sheet";
      section.style.borderBottom = "0";

      var heading = document.createElement("h1");
      heading.className = "mark";
      heading.textContent = "magnm";

      var lead = document.createElement("p");
      lead.className = "lead";
      lead.textContent = "This link is no longer available. Please ask magnm for a new one.";

      var actions = document.createElement("p");
      actions.style.marginTop = "28px";

      var link = document.createElement("a");
      link.className = "btn";
      link.setAttribute("href", "/");
      link.textContent = "Open Software Cost Planner";

      actions.appendChild(link);
      section.appendChild(heading);
      section.appendChild(lead);
      section.appendChild(actions);
      main.appendChild(section);
      body.appendChild(main);
    }
    showPage();
  }

  function fetchJsonWithTimeout(url, options, timeoutMs) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timerId = null;
    var fetchOpts = Object.assign({}, options);
    if (controller) {
      fetchOpts.signal = controller.signal;
      timerId = setTimeout(function () {
        controller.abort();
      }, timeoutMs);
    }

    return fetch(url, fetchOpts).then(
      function (resp) {
        if (timerId !== null) clearTimeout(timerId);
        return resp.text().then(function (text) {
          var parsed = null;
          if (text) {
            try {
              parsed = JSON.parse(text);
            } catch (e) {
              parsed = text;
            }
          }
          return { ok: resp.ok, status: resp.status, body: parsed };
        });
      },
      function (err) {
        if (timerId !== null) clearTimeout(timerId);
        throw err;
      }
    );
  }

  var route = parseShareRoute(window.location.pathname || "");
  var config = window.MAGNM_SHARE_CONFIG;
  if (!route || !config || !config.supabaseUrl || !config.publishableKey) {
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", showUnavailable);
    } else {
      showUnavailable();
    }
    return;
  }

  var baseUrl = String(config.supabaseUrl).replace(/\/+$/, "");
  var publishableKey = String(config.publishableKey);

  fetchJsonWithTimeout(
    baseUrl + "/rest/v1/rpc/get_published_proposal",
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ p_share_id: route.id })
    },
    REQUEST_TIMEOUT_MS
  )
    .then(function (res) {
      if (!res.ok || !res.body || typeof res.body !== "object") {
        showUnavailable();
        return;
      }
      var kind = res.body.kind;
      var rawPayload = res.body.payload;
      if (
        typeof kind !== "string" ||
        !rawPayload ||
        typeof rawPayload !== "object" ||
        !isKindAllowedForRoute(kind, route.routeType)
      ) {
        showUnavailable();
        return;
      }

      var payload = preparePublicPayload(rawPayload, route.routeType);
      var contact = payload.contact && typeof payload.contact === "object" ? payload.contact : {};
      var preset = payload.preset && typeof payload.preset === "object" ? payload.preset : {};
      preparedFor = String(contact.business || contact.name || preset.businessName || preset.clientName || "")
        .replace(/[<>]/g, "")
        .slice(0, 120);

      var dataEl = document.createElement("script");
      dataEl.type = "application/json";
      dataEl.id = "magnm-pitch-data";
      dataEl.textContent = JSON.stringify(payload);
      document.body.appendChild(dataEl);

      window.MagnmShare = {
        buildContact: buildContact,
        buildChoices: buildChoices,
        submitQuote: function (choices, contact) {
          return fetchJsonWithTimeout(
            baseUrl + "/rest/v1/rpc/submit_quote",
            {
              method: "POST",
              headers: {
                apikey: publishableKey,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                p_share_id: route.id,
                p_choices: choices,
                p_contact: contact
              })
            },
            REQUEST_TIMEOUT_MS
          ).then(function (submitRes) {
            if (!submitRes.ok) {
              throw mapSubmitQuoteError(submitRes.status, submitRes.body);
            }
            return submitRes.body;
          });
        }
      };

      /*
       * Execution order note (from app.js Kickoff):
       * app.js runs synchronously before share.js and binds DOMContentLoaded to
       * bindGlobalEvents() + init(). Because get_published_proposal is async,
       * DOMContentLoaded typically fires while fetch is still in flight (with
       * visibility hidden) and renders the fallback general preset. Once
       * magnm-host.js loads and overrides window.parseRoute, window.getAllPresets,
       * window.buildPlannerSections, window.update, window.spy, and
       * window.downloadPdf, calling window.init() re-renders the page with the
       * published proposal before revealing it. If DOMContentLoaded has not fired
       * yet, we wait for it so app.js runs bindGlobalEvents() + init() after the adapter.
       */
      var hostScript = document.createElement("script");
      hostScript.src = "/host/magnm-host.js";
      hostScript.onload = function () {
        if (document.readyState === "loading") {
          window.addEventListener("DOMContentLoaded", showPage);
        } else {
          if (typeof window.init === "function") {
            window.init();
          }
          showPage();
        }
      };
      hostScript.onerror = function () {
        showUnavailable();
      };
      document.body.appendChild(hostScript);
    })
    .catch(function () {
      showUnavailable();
    });
})();
