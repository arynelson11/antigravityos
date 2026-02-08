
const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjFmYTllYy1jOGRlLTQ4M2EtOTFmMi0wMzA4NTRmOTQ0MmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmZjMTQ4MWUtYjNjNi00Y2EwLWJmZDktOTM0NjUwMGM2M2JiIiwiaWF0IjoxNzcwNTA4NzA3fQ._ZloOth3qAWLW4ONw1Ew2pqDp9JbpBrk1NKrYDxEPzg';
const baseUrl = 'https://n8n.aiodevelopers.com.br/api/v1';
const workflowId = 'uqzK8iPJmbZRAU5H';
// NEW URL FROM LOCALTUNNEL OUTPUT
const newUrl = 'https://antigravity-family.loca.lt/api/n8n';

(async () => {
    try {
        console.log(`Fetching workflow ${workflowId}...`);
        const getRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);

        const workflowData = await getRes.json();

        // Update Code Tools (look for 'Antigravity_')
        const tools = workflowData.nodes.filter(n => n.name.startsWith('Antigravity_') && n.type === '@n8n/n8n-nodes-langchain.toolCode');

        if (tools.length === 0) {
            console.error('No Code Tools found!');
            return;
        }

        console.log(`Found ${tools.length} Code Tools. Updating URL to ${newUrl}...`);

        // Regex to replace URI
        // Matches: uri: 'https://...'
        const urlRegex = /uri:\s*['"]https:\/\/[^'"]+['"]/;

        tools.forEach(tool => {
            let jsCode = tool.parameters.jsCode;
            if (urlRegex.test(jsCode)) {
                tool.parameters.jsCode = jsCode.replace(urlRegex, `uri: '${newUrl}'`);
            } else {
                console.warn(`Could not find URI in tool ${tool.name}`);
            }
        });

        // Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending URL update to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Tools updated with new Tunnel URL!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
