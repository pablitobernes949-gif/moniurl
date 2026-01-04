// Simple test server for monitoring system
const http = require('http');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle HEAD and GET
  if (req.method === 'HEAD' || req.method === 'GET') {
    // Simulate different endpoints
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (req.method === 'GET') {
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      } else {
        res.end();
      }
    } else if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      if (req.method === 'GET') {
        res.end('<h1>Test Server Running</h1>');
      } else {
        res.end();
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  } else {
    res.writeHead(405);
    res.end();
  }
});

const PORT = 3001;
server.listen(PORT, 'localhost', () => {
  console.log(`✓ Test server running on http://localhost:${PORT}`);
  console.log(`  - GET http://localhost:${PORT}/ - returns HTML`);
  console.log(`  - GET http://localhost:${PORT}/api/health - returns JSON status`);
});
