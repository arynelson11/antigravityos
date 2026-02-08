
const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjFmYTllYy1jOGRlLTQ4M2EtOTFmMi0wMzA4NTRmOTQ0MmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmZjMTQ4MWUtYjNjNi00Y2EwLWJmZDktOTM0NjUwMGM2M2JiIiwiaWF0IjoxNzcwNTA4NzA3fQ._ZloOth3qAWLW4ONw1Ew2pqDp9JbpBrk1NKrYDxEPzg';
const baseUrl = 'https://n8n.aiodevelopers.com.br/api/v1';
const workflowId = 'uqzK8iPJmbZRAU5H';

(async () => {
    try {
        console.log(`Fetching workflow ${workflowId}...`);
        const getRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);

        const workflowData = await getRes.json();

        // Find Code Tools
        const tools = workflowData.nodes.filter(n => n.name.startsWith('Antigravity_') && n.type === '@n8n/n8n-nodes-langchain.toolCode');

        if (tools.length === 0) {
            console.error('No Code Tools found!');
            return;
        }

        console.log(`Found ${tools.length} tools. Injecting Authorization header...`);

        // Regex to find `this.helpers.request({` and inject headers
        // But better to parse the JS code or just replace the call.
        // The call is always: `const response = await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });`
        // Or similar.

        /*
        Current Code Structure:
        // ...
        const body = { ... };
        const response = await this.helpers.request({ method: 'POST', uri: '...', body, json: true });
        return JSON.stringify(response);
        */

        const requestRegex = /this\.helpers\.request\(\{\s*method:\s*'POST',\s*uri:\s*('[^']+'|"[^"]+"),\s*body,\s*json:\s*true\s*\}\);/;

        tools.forEach(tool => {
            let jsCode = tool.parameters.jsCode;

            // Replaces: this.helpers.request({...})
            // With: this.helpers.request({... , headers: { ... }})

            if (jsCode.includes('this.helpers.request')) {
                // We'll replace the closing `});` of that specific call with `, headers: { 'Authorization': 'Bearer antigravity_secret_key_123' } });`
                // BUT this is risky if regex fails due to spacing.

                // Let's rewrite the REQUEST line completely using connection.
                // Or just append the headers property.

                // Let's use a robust replace
                const newRequestLine = `
const response = await this.helpers.request({ 
    method: 'POST', 
    uri: '${tool.name === "Antigravity_AddTransaction" || tool.name === "Antigravity_AddTask" || tool.name === "Antigravity_AddEvent" ?
                        // Need to extract the URI from existing code? Yes.
                        jsCode.match(/uri:\s*('[^']+'|"[^"]+")/)[1] // Extract URL string with quotes
                        : "'UNKNOWN_URL'"}', 
    body, 
    json: true,
    headers: { 'Authorization': 'Bearer antigravity_secret_key_123' }
});`;

                // Replace the existing logic
                // Check if we can find the old request block
                // Instead of regex replace, let's just REPLACE THE WHOLE BLOCK if we know the structure.
                // But structure varies by tool.

                // Let's use string replacement for the options object end.
                // "json: true });" -> "json: true, headers: { 'Authorization': 'Bearer antigravity_secret_key_123' } });"

                if (jsCode.includes('json: true });')) {
                    tool.parameters.jsCode = jsCode.replace('json: true });', "json: true, headers: { 'Authorization': 'Bearer antigravity_secret_key_123' } });");
                    console.log(`Updated ${tool.name}`);
                } else {
                    console.warn(`Could not find request pattern in ${tool.name}`);
                    // Fallback: try replacing `});` if it's the only one? No.
                }
            }
        });

        // Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending Auth Fix to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Tools updated with Authorization Header!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
