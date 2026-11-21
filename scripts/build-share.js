#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function replaceOnce(input, target, replacement, label) {
  const parts = input.split(target);
  if (parts.length !== 2) {
    throw new Error(`Expected exactly 1 match for ${label}, found ${parts.length - 1}`);
  }
  return parts.join(replacement);
}

function buildShareHtml(indexHtml) {
  let out = indexHtml;
  out = replaceOnce(
    out,
    '</head>',
    '  <meta name="robots" content="noindex,nofollow">\n</head>',
    '</head>'
  );
  out = replaceOnce(
    out,
    '<link rel="icon" type="image/png" href="logo.png">',
    '<link rel="icon" type="image/png" href="/logo.png">',
    'favicon link'
  );
  out = replaceOnce(
    out,
    '<link rel="apple-touch-icon" href="logo.png">',
    '<link rel="apple-touch-icon" href="/logo.png">',
    'apple-touch-icon link'
  );
  out = replaceOnce(
    out,
    '<link rel="stylesheet" href="style.css">',
    '<link rel="stylesheet" href="/style.css">',
    'style.css link'
  );
  out = replaceOnce(
    out,
    '<script src="vendor/jspdf.umd.min.js"></script>',
    '<script src="/vendor/jspdf.umd.min.js"></script>',
    'jspdf script'
  );
  out = replaceOnce(
    out,
    '<script src="presets.js"></script>',
    '<script src="/presets.js"></script>',
    'presets.js script'
  );
  out = replaceOnce(
    out,
    '<script src="app.js"></script>',
    '<script src="/app.js"></script><script src="/share/config.js"></script><script src="/share/share.js"></script>',
    'app.js script'
  );
  return out;
}

if (require.main === module) {
  const rootDir = path.resolve(__dirname, '..');
  const indexPath = path.join(rootDir, 'index.html');
  const outDir = path.join(rootDir, 'www');
  const outPath = path.join(outDir, 'share.html');

  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const shareHtml = buildShareHtml(indexHtml);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, shareHtml, 'utf8');
  console.log(`Built ${path.relative(rootDir, outPath)}`);
}

module.exports = {
  replaceOnce,
  buildShareHtml
};
