const http = require('http');
const https = require('https');
const TARGET = 'https://tokenharbor.ai';

const server = http.createServer((req, res) => {
  let u;
  try { u = new URL(req.url, TARGET); } catch (e) { res.writeHead(400); return res.end('bad url'); }
  const headers = Object.assign({}, req.headers);
  headers.host = u.hostname;
  delete headers['connection']; delete headers['transfer-encoding'];
  const p = https.request({
    hostname: u.hostname, port: 443, path: u.pathname + u.search,
    method: req.method, headers: headers, timeout: 120000
  }, (r) => {
    res.writeHead(r.statusCode, r.headers);
    r.pipe(res);
  });
  p.on('timeout', () => p.destroy(new Error('upstream timeout')));
  p.on('error', (e) => { try { res.writeHead(502); res.end('upstream: ' + e.message); } catch (_) {} });
  req.pipe(p);
});
server.listen(8080, '0.0.0.0', () => console.log('relay listening on 8080 -> ' + TARGET));
