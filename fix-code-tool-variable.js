
const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjFmYTllYy1jOGRlLTQ4M2EtOTFmMi0wMzA4NTRmOTQ0MmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmZjMTQ4MWUtYjNjNi00Y2EwLWJmZDktOTM0NjUwMGM2M2JiIiwiaWF0IjoxNzcwNTA4NzA3fQ._ZloOth3qAWLW4ONw1Ew2pqDp9JbpBrk1NKrYDxEPzg';
const baseUrl = 'https://n8n.aiodevelopers.com.br/api/v1';
const workflowId = 'uqzK8iPJmbZRAU5H';
const tunnelUrl = 'https://spotty-guests-shop.loca.lt/api/n8n';

(async () => {
    try {
        console.log(`Fetching workflow ${workflowId}...`);
        const getRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);

        const workflowData = await getRes.json();

        // 1. Find Code Tools (by type)
        const tools = workflowData.nodes.filter(n => n.type === '@n8n/n8n-nodes-langchain.toolCode');

        if (tools.length === 0) {
            console.error('No Code Tools found!');
            return;
        }

        console.log(`Found ${tools.length} Code Tools to update.`);

        // 2. Update Code (input -> query)
        tools.forEach(tool => {
            let jsCode = tool.parameters.jsCode;

            // Replaces: input.xyz -> query.xyz
            // Using strict regex for `input.` variable access
            jsCode = jsCode.replace(/input\./g, 'query.');

            // Also, need to handle parsing if query is string?
            // "const queryParsed = typeof query === 'string' ? JSON.parse(query) : query;"
            // But let's assume n8n parses structured input if schemaType is manual.

            // Add safety check/parsing at top
            const prefix = `
// Ensure query is object
let data = query;
try {
    if (typeof query === 'string') data = JSON.parse(query);
} catch (e) { /* ignore parse error */ }
`;
            // Replace `query.` with `data.`
            jsCode = jsCode.replace(/query\./g, 'data.');

            // Prepend prefix to original code (minus potential const body/return logic if already there?)
            // Just replace the whole thing properly.

            if (tool.name === 'Antigravity_AddTransaction') {
                tool.parameters.jsCode = `
// Parse Input
let data = query;
try { if (typeof query === 'string') data = JSON.parse(query); } catch(e) {}

const body = {
  action: 'add_transaction',
  payload: { 
    description: data.memo || "Gasto diverso", 
    amount: data.value, 
    type: data.direction || "expense", 
    category: data.group || "Geral", 
    paymentMethod: data.method || "debit" 
  }
};
const response = await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
return JSON.stringify(response);
`;
            } else if (tool.name === 'Antigravity_AddTask') {
                tool.parameters.jsCode = `
// Parse Input
let data = query;
try { if (typeof query === 'string') data = JSON.parse(query); } catch(e) {}

const body = {
  action: 'add_task',
  payload: { 
    title: data.title, 
    priority: data.priority || "medium" 
  }
};
const response = await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
return JSON.stringify(response);
`;
            } else if (tool.name === 'Antigravity_AddEvent') {
                tool.parameters.jsCode = `
// Parse Input
let data = query;
try { if (typeof query === 'string') data = JSON.parse(query); } catch(e) {}

const body = {
  action: 'add_event',
  payload: { 
    title: data.title, 
    startTime: data.startTime || new Date().toISOString(), 
    isAllDay: data.isAllDay || "false" 
  }
};
const response = await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
return JSON.stringify(response);
`;
            }
        });

        // 3. Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending Code Tool fix (input->query) to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Code Tools updated to use `query` variable!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
