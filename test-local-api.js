
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/n8n',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer antigravity_secret_key_123'
    }
};

const data = JSON.stringify({ action: 'add_task', payload: { title: 'Test Local Task', priority: 'medium' } });

const startTime = Date.now();
console.log('Sending request...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Response received in ${Date.now() - startTime}ms`);
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
