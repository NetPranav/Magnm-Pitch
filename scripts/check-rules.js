#!/usr/bin/env node
/**
 * scripts/check-rules.js
 *
 * ANTI-HIJACKING VERIFICATION SUITE
 * Enforces team rules:
 * 1. Root route ('/') and index.html must remain strictly the general magnm Software Cost Planner.
 * 2. Client-specific proposals must live on dedicated routes (/clients/<slug> or ?client=<slug>) or /admin.
 * 3. Public share links (/p/:id, /q/:id, /f/:id) use share.html, are never '/', and are not indexed.
 * 4. index.html must never contain hardcoded client pitch copy or specific client names.
 * 5. All registered presets in presets.js must have valid slugs and metadata.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
let errors = [];

function checkFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${label} (${filePath})`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

console.log('Running Anti-Hijacking & Architecture Rules Check...\n');

// 1. Check index.html
const indexHtml = checkFile(path.join(ROOT_DIR, 'index.html'), 'index.html');
if (indexHtml) {
  const forbiddenTerms = [
    'Urban Company',
    'Urban-style',
    'urban-style',
    'An Urban Company-style booking platform',
    'What an Urban-style platform does'
  ];

  forbiddenTerms.forEach(term => {
    if (indexHtml.includes(term)) {
      errors.push(`[RULE VIOLATION] index.html contains hardcoded client term "${term}". Main route ('/') must remain the generic software planner. Client-specific customizations must be loaded dynamically via /clients/<slug> or presets.js.`);
    }
  });

  if (!indexHtml.includes('magnm Software Cost Planner')) {
    errors.push('[RULE VIOLATION] index.html should have generic title "magnm Software Cost Planner".');
  }
  if (!indexHtml.includes('presets.js')) {
    errors.push('[RULE VIOLATION] index.html must import presets.js before app.js.');
  }
  if (!indexHtml.includes('id="admin-view"')) {
    errors.push('[RULE VIOLATION] index.html must include the #admin-view container for proposal management.');
  }
  if (!indexHtml.includes('id="client-banner"')) {
    errors.push('[RULE VIOLATION] index.html must include the #client-banner indicator for custom routes.');
  }
  if (indexHtml.includes('/share/share.js') || indexHtml.includes('noindex,nofollow')) {
    errors.push('[RULE VIOLATION] index.html must remain the generic planner, never share.html.');
  }
}

// 2. Check presets.js
const presetsPath = path.join(ROOT_DIR, 'presets.js');
const presetsContent = checkFile(presetsPath, 'presets.js');
if (presetsContent) {
  try {
    const { PLANNER_PRESETS } = require(presetsPath);
    if (!PLANNER_PRESETS) {
      errors.push('[RULE VIOLATION] presets.js must export PLANNER_PRESETS.');
    } else {
      if (!PLANNER_PRESETS.general) {
        errors.push('[RULE VIOLATION] PLANNER_PRESETS.general is missing in presets.js.');
      } else if (!PLANNER_PRESETS.general.title || !PLANNER_PRESETS.general.lead) {
        errors.push('[RULE VIOLATION] PLANNER_PRESETS.general must have title and lead.');
      }

      if (!PLANNER_PRESETS['urban-company']) {
        errors.push('[RULE VIOLATION] Preserved preset "urban-company" is missing from PLANNER_PRESETS.');
      } else if (PLANNER_PRESETS['urban-company'].slug !== 'urban-company') {
        errors.push('[RULE VIOLATION] "urban-company" preset slug must be "urban-company".');
      }

      Object.keys(PLANNER_PRESETS).forEach(slug => {
        const p = PLANNER_PRESETS[slug];
        if (!p.slug || !p.name) {
          errors.push(`[RULE VIOLATION] Preset '${slug}' is missing required fields (slug, name).`);
        }
        if (slug !== p.slug) {
          errors.push(`[RULE VIOLATION] Preset key '${slug}' does not match its internal slug '${p.slug}'.`);
        }
      });
    }
  } catch (err) {
    errors.push(`[SYNTAX ERROR] Failed to load/parse presets.js: ${err.message}`);
  }
}

// 3. Check app.js items & dependencies
try {
  const app = require(path.join(ROOT_DIR, 'app.js'));
  if (!app.ITEMS || !app.GROUPS) {
    errors.push('[ENGINE ERROR] app.js must export ITEMS and GROUPS.');
  } else {
    const requiredGroups = ['Web & SaaS', 'Mobile app', 'Backend', 'AI & Automation', 'DevOps & Maintenance'];
    requiredGroups.forEach(g => {
      if (!app.GROUPS.includes(g)) {
        errors.push(`[RULE VIOLATION] app.js GROUPS missing required category: "${g}".`);
      }
    });

    Object.keys(app.ITEMS).forEach(k => {
      const item = app.ITEMS[k];
      if (!item.n || !item.d || typeof item.p !== 'number' || !Array.isArray(item.r)) {
        errors.push(`[SCHEMA ERROR] Item "${k}" is missing required fields (n, d, p, r).`);
      }
      (item.r || []).forEach(dep => {
        if (!app.ITEMS[dep]) {
          errors.push(`[DEPENDENCY ERROR] Item "${k}" references non-existent dependency "${dep}".`);
        }
      });
    });
  }
} catch (err) {
  errors.push(`[EXECUTION ERROR] Failed to load/verify app.js: ${err.message}`);
}

// 4. Check share and host adapter files exist
checkFile(path.join(ROOT_DIR, 'host', 'magnm-host.js'), 'host/magnm-host.js');
checkFile(path.join(ROOT_DIR, 'share', 'share.js'), 'share/share.js');
checkFile(path.join(ROOT_DIR, 'share', 'config.js'), 'share/config.js');
checkFile(path.join(ROOT_DIR, 'scripts', 'build-share.js'), 'scripts/build-share.js');

// 5. Check vercel.json rewrites & headers
const vercelJsonRaw = checkFile(path.join(ROOT_DIR, 'vercel.json'), 'vercel.json');
if (vercelJsonRaw) {
  try {
    const vercelConfig = JSON.parse(vercelJsonRaw);
    if (!Array.isArray(vercelConfig.rewrites)) {
      errors.push('[CONFIG ERROR] vercel.json must configure "rewrites" for client and share routes.');
    } else {
      const hasClientsRewrite = vercelConfig.rewrites.some(r => r.source.includes('/clients/'));
      const hasAdminRewrite = vercelConfig.rewrites.some(r => r.source.includes('/admin'));
      if (!hasClientsRewrite) {
        errors.push('[CONFIG ERROR] vercel.json is missing rewrite rule for /clients/:path*.');
      }
      if (!hasAdminRewrite) {
        errors.push('[CONFIG ERROR] vercel.json is missing rewrite rule for /admin.');
      }

      const rootToShare = vercelConfig.rewrites.some(
        r => (r.source === '/' || r.source === '/index.html') && r.destination.includes('share.html')
      );
      if (rootToShare) {
        errors.push('[RULE VIOLATION] vercel.json must never rewrite "/" or "/index.html" to share.html.');
      }

      ['/p/:id', '/q/:id', '/f/:id'].forEach(routeSource => {
        const match = vercelConfig.rewrites.find(
          r => r.source === routeSource && r.destination === '/share.html'
        );
        if (!match) {
          errors.push(`[CONFIG ERROR] vercel.json is missing rewrite ${routeSource} -> /share.html.`);
        }
      });
    }

    if (!Array.isArray(vercelConfig.headers)) {
      errors.push('[CONFIG ERROR] vercel.json must configure "headers" for share routes.');
    } else {
      ['/p/:id', '/q/:id', '/f/:id'].forEach(routeSource => {
        const block = vercelConfig.headers.find(h => h.source === routeSource);
        if (!block || !Array.isArray(block.headers)) {
          errors.push(`[CONFIG ERROR] vercel.json is missing headers block for ${routeSource}.`);
          return;
        }
        const byKey = {};
        block.headers.forEach(hdr => {
          if (hdr && hdr.key) byKey[hdr.key.toLowerCase()] = String(hdr.value || '');
        });
        if (!byKey['x-robots-tag'] || !byKey['x-robots-tag'].includes('noindex')) {
          errors.push(`[CONFIG ERROR] vercel.json ${routeSource} header X-Robots-Tag must include noindex.`);
        }
        if (byKey['referrer-policy'] !== 'no-referrer') {
          errors.push(`[CONFIG ERROR] vercel.json ${routeSource} header Referrer-Policy must be no-referrer.`);
        }
        if (byKey['cache-control'] !== 'no-store') {
          errors.push(`[CONFIG ERROR] vercel.json ${routeSource} header Cache-Control must be no-store.`);
        }
        const csp = byKey['content-security-policy'] || '';
        if (!csp) {
          errors.push(`[CONFIG ERROR] vercel.json ${routeSource} is missing Content-Security-Policy header.`);
        } else {
          if (csp.includes('unsafe-eval')) {
            errors.push(`[CONFIG ERROR] vercel.json ${routeSource} CSP must not include unsafe-eval.`);
          }
          if (!csp.includes('https://fetsrthktatspwucwrwk.supabase.co')) {
            errors.push(`[CONFIG ERROR] vercel.json ${routeSource} CSP must allow the Supabase URL in connect-src.`);
          }
        }
      });
    }
  } catch (err) {
    errors.push(`[SYNTAX ERROR] Failed to parse vercel.json: ${err.message}`);
  }
}

// 6. Check package.json build script
const pkgJsonRaw = checkFile(path.join(ROOT_DIR, 'package.json'), 'package.json');
if (pkgJsonRaw) {
  try {
    const pkg = JSON.parse(pkgJsonRaw);
    const buildCmd = (pkg.scripts && pkg.scripts.build) || '';
    if (!buildCmd.includes('presets.js')) {
      errors.push('[BUILD ERROR] package.json build script must copy presets.js to www/.');
    }
    if (!buildCmd.includes('host/magnm-host.js') || !buildCmd.includes('share/') || !buildCmd.includes('build-share.js')) {
      errors.push('[BUILD ERROR] package.json build script must copy host/ and share/ and run scripts/build-share.js.');
    }
  } catch (err) {
    errors.push(`[SYNTAX ERROR] Failed to parse package.json: ${err.message}`);
  }
}

// 7. If www/ has been built, verify www/index.html is never share.html
const wwwIndexPath = path.join(ROOT_DIR, 'www', 'index.html');
if (fs.existsSync(wwwIndexPath)) {
  const wwwIndex = fs.readFileSync(wwwIndexPath, 'utf8');
  if (wwwIndex.includes('/share/share.js') || wwwIndex.includes('noindex,nofollow')) {
    errors.push('[RULE VIOLATION] www/index.html must never be share.html.');
  }
}

// Summary
if (errors.length > 0) {
  console.error('Check Failed! Violations found:');
  errors.forEach((err, idx) => {
    console.error(`  ${idx + 1}. ${err}`);
  });
  console.error('\nFix the issues above to maintain code integrity.');
  process.exit(1);
} else {
  console.log('All Architecture & Anti-Hijacking Rules Passed:');
  console.log('  - Root route (/) is strictly the general magnm Software Cost Planner.');
  console.log('  - Dedicated routes (/clients/<slug> & ?client=<slug>) are isolated in presets.');
  console.log('  - Preserved Urban-style proposal is located at /clients/urban-company.');
  console.log('  - Proposal Admin UI route (/admin) is configured.');
  console.log('  - Share link routes (/p/:id, /q/:id, /f/:id), headers, and host adapter are configured.');
  console.log('  - Vercel rewrites and build scripts are properly configured.');
  process.exit(0);
}
