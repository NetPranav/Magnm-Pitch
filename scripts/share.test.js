'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parseShareRoute,
  isKindAllowedForRoute,
  preparePublicPayload,
  buildContact,
  buildChoices,
  mapSubmitQuoteError
} = require('../share/share.js');
const { buildShareHtml } = require('./build-share.js');

const ROOT_DIR = path.resolve(__dirname, '..');

test('parseShareRoute accepts valid /p, /q, /f ids (16..64 chars)', () => {
  const id16 = 'abcd1234EFGH5678';
  const id64 = 'a'.repeat(64);
  const idMixed = 'Ab12_-Cd34Ef56Gh78';

  assert.deepEqual(parseShareRoute('/p/' + id16), { routeType: 'p', id: id16 });
  assert.deepEqual(parseShareRoute('/q/' + idMixed), { routeType: 'q', id: idMixed });
  assert.deepEqual(parseShareRoute('/f/' + id64), { routeType: 'f', id: id64 });
});

test('parseShareRoute rejects invalid ids, unknown prefixes, and trailing slashes', () => {
  const valid16 = 'abcd1234EFGH5678';

  assert.equal(parseShareRoute('/p/short15chars123'), null);
  assert.equal(parseShareRoute('/p/' + 'a'.repeat(65)), null);
  assert.equal(parseShareRoute('/p/bad.char.12345678'), null);
  assert.equal(parseShareRoute('/p/bad$char12345678'), null);
  assert.equal(parseShareRoute('/p/'), null);
  assert.equal(parseShareRoute('/p/' + valid16 + '/'), null);
  assert.equal(parseShareRoute('/p/' + valid16 + '/extra'), null);
  assert.equal(parseShareRoute('/x/' + valid16), null);
  assert.equal(parseShareRoute('/clients/' + valid16), null);
  assert.equal(parseShareRoute('/'), null);
  assert.equal(parseShareRoute(''), null);
  assert.equal(parseShareRoute(null), null);
});

test('isKindAllowedForRoute enforces kind-to-route rules', () => {
  assert.equal(isKindAllowedForRoute('proposal', 'p'), true);
  assert.equal(isKindAllowedForRoute('default_quote', 'p'), false);
  assert.equal(isKindAllowedForRoute('final', 'p'), false);

  assert.equal(isKindAllowedForRoute('proposal', 'q'), true);
  assert.equal(isKindAllowedForRoute('default_quote', 'q'), true);
  assert.equal(isKindAllowedForRoute('final', 'q'), false);

  assert.equal(isKindAllowedForRoute('final', 'f'), true);
  assert.equal(isKindAllowedForRoute('proposal', 'f'), false);
  assert.equal(isKindAllowedForRoute('default_quote', 'f'), false);

  assert.equal(isKindAllowedForRoute('proposal', 'x'), false);
  assert.equal(isKindAllowedForRoute('unknown', 'p'), false);
});

test('preparePublicPayload sets context, mode, and locked flags per route', () => {
  const base = { preset: { slug: 'acme' }, locked: false };

  const pPayload = preparePublicPayload(base, 'p');
  assert.equal(pPayload.context, 'public');
  assert.equal(pPayload.mode, 'present');
  assert.equal(pPayload.locked, false);

  const qPayload = preparePublicPayload(base, 'q');
  assert.equal(qPayload.context, 'public');
  assert.equal(qPayload.mode, 'form');
  assert.equal(qPayload.locked, false);

  const fPayload = preparePublicPayload(base, 'f');
  assert.equal(fPayload.context, 'public');
  assert.equal(fPayload.mode, 'present');
  assert.equal(fPayload.locked, true);
});

test('buildContact trims whitespace and enforces field caps (500 / 2000)', () => {
  const contact = buildContact({
    name: '  ' + 'n'.repeat(600) + '  ',
    business: '  Acme  ',
    phone: '  ' + '9'.repeat(550) + ' ',
    notes: '  ' + 'x'.repeat(2500) + '  '
  });

  assert.equal(contact.name.length, 500);
  assert.equal(contact.business, 'Acme');
  assert.equal(contact.phone.length, 500);
  assert.equal(contact.notes.length, 2000);

  assert.deepEqual(buildContact(null), {
    name: '',
    business: '',
    phone: '',
    notes: ''
  });
});

test('buildChoices separates standard and custom items and sets total_shown', () => {
  const fromMap = buildChoices(
    { w_front: true, b_db: false, custom_1: true, b_admin: true, custom_2: true },
    14500
  );
  assert.deepEqual(fromMap, {
    selected: ['w_front', 'b_admin'],
    custom_selected: ['custom_1', 'custom_2'],
    total_shown: 14500
  });

  const fromArray = buildChoices(['w_front', 'w_front', 'custom_abc'], 'not-a-number');
  assert.deepEqual(fromArray, {
    selected: ['w_front'],
    custom_selected: ['custom_abc'],
    total_shown: 0
  });
});

test('mapSubmitQuoteError maps rate-limit errors to rate_limited', () => {
  const rpcRateLimit = mapSubmitQuoteError(400, {
    code: 'P0001',
    message: 'Rate limit exceeded for this proposal link'
  });
  assert.equal(rpcRateLimit.code, 'rate_limited');
  assert.equal(rpcRateLimit.message, 'rate_limited');

  const http429 = mapSubmitQuoteError(429, {});
  assert.equal(http429.code, 'rate_limited');

  const otherErr = mapSubmitQuoteError(400, { message: 'Invalid or unavailable proposal link' });
  assert.equal(otherErr.code, 'submit_failed');
  assert.equal(otherErr.message, 'Invalid or unavailable proposal link');
});

test('buildShareHtml transforms index.html with exact single substitutions and robots meta', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const out = buildShareHtml(indexHtml);

  const robotsMatches = out.match(/<meta name="robots" content="noindex,nofollow">/g) || [];
  assert.equal(robotsMatches.length, 1);

  const scriptBundle = '<script src="/app.js"></script><script src="/share/config.js"></script><script src="/share/share.js"></script>';
  assert.equal(out.split(scriptBundle).length - 1, 1);

  assert.equal(out.split('href="/style.css"').length - 1, 1);
  assert.equal(out.split('href="/logo.png"').length - 1, 2);
  assert.equal(out.split('src="/vendor/jspdf.umd.min.js"').length - 1, 1);
  assert.equal(out.split('src="/presets.js"').length - 1, 1);

  assert.equal(out.includes('href="style.css"'), false);
  assert.equal(out.includes('href="logo.png"'), false);
  assert.equal(out.includes('src="presets.js"'), false);
  assert.equal(out.includes('src="app.js"'), false);
  assert.equal(out.includes('src="vendor/jspdf.umd.min.js"'), false);

  assert.throws(() => buildShareHtml('<html><head></head><body></body></html>'), /Expected exactly 1 match/);
});
