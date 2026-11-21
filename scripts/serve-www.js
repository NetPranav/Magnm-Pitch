#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WWW_DIR = path.join(ROOT_DIR, 'www');
const VERCEL_CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function matchVercelPattern(pattern, pathname) {
  if (pattern === pathname) return true;
  if (pattern.endsWith('/:path*')) {
    const prefix = pattern.slice(0, -'/:path*'.length) + '/';
    return pathname.startsWith(prefix);
  }
  if (pattern.endsWith('/:id')) {
    const prefix = pattern.slice(0, -'/:id'.length) + '/';
    if (!pathname.startsWith(prefix)) return false;
    const rest = pathname.slice(prefix.length);
    return rest.length > 0 && !rest.includes('/');
  }
  return false;
}

function resolveDestination(pathname) {
  for (const rule of VERCEL_CONFIG.rewrites || []) {
    if (matchVercelPattern(rule.source, pathname)) {
      return rule.destination;
    }
  }
  return pathname === '/' ? '/index.html' : pathname;
}

function applyHeaders(res, pathname) {
  for (const block of VERCEL_CONFIG.headers || []) {
    if (matchVercelPattern(block.source, pathname)) {
      for (const hdr of block.headers || []) {
        res.setHeader(hdr.key, hdr.value);
      }
    }
  }
}

function safeFileInWww(urlPath) {
  const cleanRel = urlPath.replace(/^\/+/, '');
  const resolved = path.resolve(WWW_DIR, cleanRel);
  if (!resolved.startsWith(WWW_DIR + path.sep)) return null;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return null;
  return resolved;
}

const port = Number(process.argv[2] || process.env.PORT || 4173);

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
  const pathname = decodeURIComponent(reqUrl.pathname);
  const destPath = resolveDestination(pathname);
  const filePath = safeFileInWww(destPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  applyHeaders(res, pathname);
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving www/ at http://127.0.0.1:${port}`);
});
