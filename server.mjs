import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import * as candidatesApi from './functions/api/candidates.js';
import * as opportunitiesApi from './functions/api/opportunities.js';
import * as applyApi from './functions/api/apply.js';
import * as requestApi from './functions/api/request.js';
import * as interestApi from './functions/api/interest.js';
import * as adminApi from './functions/api/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || 'localhost';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'openstem.sqlite');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'openstem-admin-development-token-32chars';
const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT || 'openstem-development-rate-limit-salt';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'shahriyarkarimsiam@gmail.com';

// Initialize SQLite database
const sqliteDb = new DatabaseSync(DB_PATH);
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
sqliteDb.exec(schemaSql);
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS email_notifications (
    id TEXT PRIMARY KEY,
    recipient TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

// Cloudflare D1 compatibility layer for node:sqlite
function createD1Adapter(db) {
  return {
    prepare(sql) {
      let boundArgs = [];
      const stmtObj = {
        bind(...args) {
          boundArgs = args;
          return stmtObj;
        },
        async first() {
          const stmt = db.prepare(sql);
          return stmt.get(...boundArgs) || null;
        },
        async all() {
          const stmt = db.prepare(sql);
          return { results: stmt.all(...boundArgs) };
        },
        async run() {
          const stmt = db.prepare(sql);
          if (/RETURNING/i.test(sql)) {
            const res = stmt.get(...boundArgs);
            return { success: true, meta: { changes: 1 }, ...res };
          }
          const info = stmt.run(...boundArgs);
          return { success: true, meta: { changes: info.changes } };
        }
      };
      return stmtObj;
    }
  };
}

const env = {
  DB: createD1Adapter(sqliteDb),
  ADMIN_TOKEN,
  RATE_LIMIT_SALT
};

const API_ROUTES = {
  '/api/candidates': {
    GET: candidatesApi.onRequestGet,
  },
  '/api/opportunities': {
    GET: opportunitiesApi.onRequestGet,
  },
  '/api/apply': {
    POST: applyApi.onRequestPost,
  },
  '/api/request': {
    POST: requestApi.onRequestPost,
  },
  '/api/interest': {
    POST: interestApi.onRequestPost,
  },
  '/api/admin': {
    GET: adminApi.onRequestGet,
    PATCH: adminApi.onRequestPatch,
    DELETE: adminApi.onRequestDelete,
  },
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

async function nodeReqToFetchReq(req, origin) {
  const url = new URL(req.url, origin);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }
  }

  if (!headers.has('CF-Connecting-IP')) {
    headers.set('CF-Connecting-IP', req.socket.remoteAddress || '127.0.0.1');
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    init.body = Buffer.concat(chunks);
    init.duplex = 'half';
  }

  return new Request(url.href, init);
}

async function sendFetchResponse(res, webRes) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((val, key) => {
    res.setHeader(key, val);
  });
  const buf = Buffer.from(await webRes.arrayBuffer());
  res.end(buf);
}

function serveStatic(req, res, pathname) {
  let relativePath = pathname;
  if (relativePath === '/' || relativePath === '') {
    relativePath = '/index.html';
  }

  let filePath = path.normalize(path.join(__dirname, relativePath));

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  // If path doesn't have an extension, try appending .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    }
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<h1>404 Not Found</h1>');
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      filePath = indexPath;
    } else {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Cache-Control', 'no-cache');

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const origin = `http://${req.headers.host || `${HOST}:${PORT}`}`;
    const url = new URL(req.url, origin);
    const pathname = url.pathname;

    // Check API routes
    if (pathname.startsWith('/api/')) {
      const routeHandlers = API_ROUTES[pathname];
      if (!routeHandlers) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API route not found' }));
        return;
      }

      const handler = routeHandlers[req.method];
      if (!handler) {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Method ${req.method} not allowed` }));
        return;
      }

      const webReq = await nodeReqToFetchReq(req, origin);
      const context = {
        request: webReq,
        env,
        params: {}
      };

      const webRes = await handler(context);

      // Notification hook for admin email
      if (req.method === 'POST' && webRes.status === 201) {
        console.log(`\n======================================================`);
        console.log(`📬 EMAIL NOTIFICATION CONNECTED TO ${ADMIN_EMAIL}`);
        console.log(`======================================================`);
        console.log(`Event:       New ${pathname.replace('/api/', '').toUpperCase()} Submission`);
        console.log(`Timestamp:   ${new Date().toISOString()}`);
        console.log(`Recipient:   ${ADMIN_EMAIL}`);
        console.log(`Delivery:    Logged & forwarded via FormSubmit`);
        console.log(`======================================================\n`);

        try {
          sqliteDb.prepare(`
            INSERT INTO email_notifications (id, recipient, category, created_at)
            VALUES (?, ?, ?, ?)
          `).run(crypto.randomUUID(), ADMIN_EMAIL, pathname, new Date().toISOString());

          fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              _subject: `OpenSTEM Match — New Server Submission (${pathname.replace('/api/', '')})`,
              _template: 'table',
              _captcha: 'false',
              endpoint: pathname,
              submission_time: new Date().toISOString()
            })
          }).catch(() => {});
        } catch(e) {}
      }

      await sendFetchResponse(res, webRes);
      return;
    }

    // Serve static files
    serveStatic(req, res, pathname);
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 OpenSTEM Match is running on localhost!`);
  console.log(`======================================================`);
  console.log(`🌐 Website:       http://${HOST}:${PORT}/`);
  console.log(`🛡️  Admin Console: http://${HOST}:${PORT}/admin.html`);
  console.log(`🔑 Admin Token:   ${ADMIN_TOKEN}`);
  console.log(`📧 Connected To:  ${ADMIN_EMAIL}`);
  console.log(`📁 Database:      ${DB_PATH}`);
  console.log(`======================================================\n`);
});
