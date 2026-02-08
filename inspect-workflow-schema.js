
const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjFmYTllYy1jOGRlLTQ4M2EtOTFmMi0wMzA4NTRmOTQ0MmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmZjMTQ4MWUtYjNjNi00Y2EwLWJmZDktOTM0NjUwMGM2M2JiIiwiaWF0IjoxNzcwNTA4NzA3fQ._ZloOth3qAWLW4ONw1Ew2pqDp9JbpBrk1NKrYDxEPzg';
const baseUrl = 'https://n8n.aiodevelopers.com.br/api/v1';
const workflowId = 'uqzK8iPJmbZRAU5H';

(async () => {
    try {
        const getRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);

        const workflowData = await getRes.json();

        // Find Code Tools
        const tools = workflowData.nodes.filter(n => n.name.startsWith('Antigravity_') && n.type === '@n8n/n8n-nodes-langchain.toolCode');

        console.log(`Found ${tools.length} Code Tools.\nDumping configurations...`);

        tools.forEach(tool => {
            console.log(`\n### Tool: ${tool.name} ###\n`);
            console.log(JSON.stringify(tool.parameters, null, 2));
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
