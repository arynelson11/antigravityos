
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

        console.log(`Found ${tools.length} tools. Replacing Schema and Helper Logic...`);

        // 1. Antigravity_AddTransaction
        const addTransactionNode = tools.find(n => n.name === 'Antigravity_AddTransaction');
        if (addTransactionNode) {
            // Define clean Schema (NO ONE-OF, OPTIONAL PORTOUGUESE ALIASES)
            const schema = {
                type: "object",
                properties: {
                    value: { type: "string", description: "Amount (Ex: 50.00)" },
                    valor: { type: "string", description: "Alias for value (Ex: 50)" },
                    direction: { type: "string", enum: ["expense", "income"], description: "Direction" },
                    tipo: { type: "string", description: "Alias for direction (gasto, ganho)" },
                    memo: { type: "string", description: "Description/Memo" },
                    descricao: { type: "string", description: "Alias for memo" },
                    group: { type: "string", description: "Category" },
                    categoria: { type: "string", description: "Alias for group" },
                    method: { type: "string", description: "Payment Method" },
                    metodo: { type: "string", description: "Alias for method" }
                }
            };

            addTransactionNode.parameters.specifyInputSchema = true;
            addTransactionNode.parameters.jsonSchemaExample = JSON.stringify(schema);

            // Update Logic to handle aliases
            const uriMatch = addTransactionNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addTransactionNode.parameters.jsCode = `
// Parse Input
let data = {};
try {
    if (typeof query === 'string') data = JSON.parse(query);
    else if (typeof query === 'object') data = query;
} catch(e) { data = {}; }

// Sanitize Amount (check aliases)
let rawAmount = data.value || data.valor || data.amount || "0";
if (typeof rawAmount === 'string') {
    rawAmount = rawAmount.replace(/[^0-9.,-]/g, '').replace(',', '.');
}
const amount = parseFloat(rawAmount) || 0;

// Sanitize Direction
let direction = (data.direction || data.tipo || data.type || 'expense').toLowerCase();
if (direction.includes('gasto') || direction.includes('saída') || direction.includes('debito')) direction = 'expense';
else if (direction.includes('ganho') || direction.includes('entrada') || direction.includes('receita')) direction = 'income';
else direction = 'expense'; // default

// Sanitize Others
const category = data.group || data.categoria || data.category || 'Geral';
const method = data.method || data.metodo || data.paymentMethod || 'debit';
const memo = data.memo || data.descricao || data.description || 'Transação via Assistente';

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
            const schema = {
                type: "object",
                properties: {
                    title: { type: "string", description: "Task Title" },
                    titulo: { type: "string", description: "Alias for title" },
                    priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority" },
                    prioridade: { type: "string", description: "Alias for priority" }
                }
            };
            addTaskNode.parameters.specifyInputSchema = true;
            addTaskNode.parameters.jsonSchemaExample = JSON.stringify(schema);

            const uriMatch = addTaskNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addTaskNode.parameters.jsCode = `
let data = {};
try {
    if (typeof query === 'string') data = JSON.parse(query);
    else if (typeof query === 'object') data = query;
} catch(e) { data = {}; }

const title = data.title || data.titulo || "Nova Tarefa";
let priority = (data.priority || data.prioridade || 'medium').toLowerCase();
if (priority.includes('alta')) priority = 'high';
else if (priority.includes('baixa')) priority = 'low';
else priority = 'medium';

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
            const schema = {
                type: "object",
                properties: {
                    title: { type: "string", description: "Event Title" },
                    titulo: { type: "string", description: "Alias for title" },
                    startTime: { type: "string", description: "Start Time (ISO or YYYY-MM-DD HH:MM)" },
                    inicio: { type: "string", description: "Alias for startTime" },
                    isAllDay: { type: "boolean", description: "Is All Day Event" },
                    diaTodo: { type: "boolean", description: "Alias for isAllDay" }
                }
            };
            addEventNode.parameters.specifyInputSchema = true;
            addEventNode.parameters.jsonSchemaExample = JSON.stringify(schema);

            const uriMatch = addEventNode.parameters.jsCode.match(/uri:\s*('[^']+'|"[^"]+")/);
            const currentUri = uriMatch ? uriMatch[1] : "'https://d79e165ca5be51.lhr.life/api/n8n'";

            addEventNode.parameters.jsCode = `
let data = {};
try {
    if (typeof query === 'string') data = JSON.parse(query);
    else if (typeof query === 'object') data = query;
} catch(e) { data = {}; }

const title = data.title || data.titulo || "Novo Evento";
let startTime = data.startTime || data.inicio || new Date().toISOString();
const isAllDay = data.isAllDay === true || data.diaTodo === true || String(data.isAllDay) === 'true';

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

        // 4. Update Agent Prompt (System Message) to mention new aliases? Not strictly necessary if tools have schema.
        // But let's check input of Agent node to update system message if possible.
        // The Agent node is hard to identify by generic name. Let's list nodes.
        // For now, updating Tools is safer.

        // Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending Schema & Logic Update to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Tools updated with CLEAN Schema and ALIAS Logic!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
