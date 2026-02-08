
const https = require('https');

const url = 'https://d79e165ca5be51.lhr.life/api/n8n'; // Updated with localhost.run URL
const method = 'POST';
const headers = { 'Authorization': 'Bearer antigravity_secret_key_123', 'Content-Type': 'application/json' };
const body = JSON.stringify({ action: 'add_task', payload: { title: 'Test Localhost Run', priority: 'medium' } });

(async () => {
    console.log(`Testing ${url}...`);
    const startTime = Date.now();

    const req = https.request(url, { method, headers }, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        let data = '';
        res.on('data', chuck => data += chuck);
        res.on('end', () => {
            console.log(`Response received in ${Date.now() - startTime}ms`);
            console.log('BODY:', data);
        });
    });

    req.on('error', (e) => console.error('Error:', e.message));
    req.write(body);
    req.end();
})();
