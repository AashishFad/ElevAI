const http = require('http');

const payload = JSON.stringify({
  model: 'qwen2.5:7b',
  prompt: 'Return ONLY JSON: {"status": "ok", "message": "hello ElevAI"}',
  stream: false,
  format: 'json',
});

const req = http.request(
  'http://127.0.0.1:11434/api/generate',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: 30000,
  },
  (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      try {
        const parsed = JSON.parse(d);
        console.log('QWEN GENERATED:', parsed.response);
        console.log('DURATION (TOTAL):', (parsed.total_duration / 1e9).toFixed(2), 's');
      } catch (e) {
        console.log('RAW RESPONSE:', d);
      }
    });
  }
);

req.on('error', (e) => console.error('OLLAMA ERROR:', e.message));
req.write(payload);
req.end();
