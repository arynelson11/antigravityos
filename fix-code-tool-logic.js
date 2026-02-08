
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
        const tools = workflowData.nodes.filter(n => n.name.startsWith('Antigravity_') && n.type === '@n8n/n8n-nodes-langchain.toolCode');

        if (tools.length === 0) {
            console.error('No Code Tools found!');
            return;
        }

        console.log(`Found ${tools.length} tools. Applying strict logic sanitization...`);

        /*
            We need to replace the entire JS Code block for each tool with a ROBUST version.
            Previous versions were concise but fragile.
        */

        // 1. Antigravity_AddTransaction
        const addTransactionNode = tools.find(n => n.name === 'Antigravity_AddTransaction');
        if (addTransactionNode) {
            console.log('Updating Antigravity_AddTransaction Logic...');
            // Extract current URI if possible
            const uriMatch = addTransactionNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addTransactionNode.parameters.jsCode = `
// Parse Input safely
let data = {};
try {
    if (typeof query === 'string') {
        data = JSON.parse(query);
    } else if (typeof query === 'object') {
        data = query;
    }
} catch(e) {
    data = {}; // Fallback
}

// Sanitize Amount
let rawAmount = data.value || data.amount || "0";
if (typeof rawAmount === 'string') {
    // Remove R$, spaces, replace comma with dot
    rawAmount = rawAmount.replace(/[^0-9.,-]/g, '').replace(',', '.');
}
const amount = parseFloat(rawAmount) || 0;

// Sanitize Direction/Type
let direction = (data.direction || data.type || 'expense').toLowerCase();
if (direction.includes('gasto') || direction.includes('saída') || direction.includes('debito')) direction = 'expense';
if (direction.includes('ganho') || direction.includes('entrada') || direction.includes('receita')) direction = 'income';

// Sanitize Category
const category = data.group || data.category || 'Geral';
const method = data.method || data.paymentMethod || 'debit';
const memo = data.memo || data.description || 'Transação via Assistente';

const body = {
  action: 'add_transaction',
  payload: {
    description: memo,
    amount: amount,
    type: direction,
    category: category,
    paymentMethod: method
  }
};

const response = await this.helpers.request({ 
    method: 'POST', 
    uri: ${currentUri}, 
    body, 
    json: true,
    headers: { 'Authorization': 'Bearer antigravity_secret_key_123' }
});

return JSON.stringify(response);
`;
        }


        // 2. Antigravity_AddTask
        const addTaskNode = tools.find(n => n.name === 'Antigravity_AddTask');
        if (addTaskNode) {
            console.log('Updating Antigravity_AddTask Logic...');
            const uriMatch = addTaskNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addTaskNode.parameters.jsCode = `
let data = {};
try {
    if (typeof query === 'string') data = JSON.parse(query);
    else if (typeof query === 'object') data = query;
} catch(e) { data = {}; }

const title = data.title || data.value || "Nova Tarefa"; // fallback if model sends payload in 'value'
const priority = (data.priority || 'medium').toLowerCase();

const body = {
  action: 'add_task',
  payload: { title, priority }
};

const response = await this.helpers.request({ 
    method: 'POST', 
    uri: ${currentUri}, 
    body, 
    json: true,
    headers: { 'Authorization': 'Bearer antigravity_secret_key_123' }
});

return JSON.stringify(response);
`;
        }

        // 3. Antigravity_AddEvent
        const addEventNode = tools.find(n => n.name === 'Antigravity_AddEvent');
        if (addEventNode) {
            console.log('Updating Antigravity_AddEvent Logic...');
            const uriMatch = addEventNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addEventNode.parameters.jsCode = `
let data = {};
try {
    if (typeof query === 'string') data = JSON.parse(query);
    else if (typeof query === 'object') data = query;
} catch(e) { data = {}; }

const title = data.title || "Novo Evento";
let startTime = data.startTime || new Date().toISOString();
const isAllDay = data.isAllDay === true || data.isAllDay === 'true';

const body = {
  action: 'add_event',
  payload: { title, startTime, isAllDay }
};

const response = await this.helpers.request({ 
    method: 'POST', 
    uri: ${currentUri}, 
    body, 
    json: true,
    headers: { 'Authorization': 'Bearer antigravity_secret_key_123' }
});

return JSON.stringify(response);
`;
        }

        // Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending Logic Fix to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Tools updated with ROBUST Logic (Sanitization)!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
