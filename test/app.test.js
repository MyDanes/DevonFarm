const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.join(__dirname, '..');
const port = 3200;

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['server.js'], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Timed out starting server'));
    }, 10000);

    child.stdout.on('data', () => {
      if (child.exitCode !== null) {
        clearTimeout(timeout);
        reject(new Error('Server process exited unexpectedly'));
        return;
      }

      clearTimeout(timeout);
      resolve(child);
    });

    child.stderr.on('data', (chunk) => {
      const message = chunk.toString();
      if (message.includes('EADDRINUSE')) {
        clearTimeout(timeout);
        reject(new Error('Port already in use'));
      }
    });
  });
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
  });
}

test('index page includes horse farm sales content', async () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /Horse Farm & Sales/i);
  assert.match(html, /Available horses/i);
  assert.match(html, /Devon Farm/i);
  assert.match(html, /\$7,800|\$9,200|\$11,500/);
});

test('server serves the homepage successfully', async () => {
  const child = await startServer();

  try {
    const response = await fetchPage(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    assert.match(response.body, /Horse Farm & Sales/i);
    assert.match(response.body, /Available horses/i);
  } finally {
    child.kill('SIGTERM');
  }
});
