
const fs = require('fs');

const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNjFmYTllYy1jOGRlLTQ4M2EtOTFmMi0wMzA4NTRmOTQ0MmIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNmZjMTQ4MWUtYjNjNi00Y2EwLWJmZDktOTM0NjUwMGM2M2JiIiwiaWF0IjoxNzcwNTA4NzA3fQ._ZloOth3qAWLW4ONw1Ew2pqDp9JbpBrk1NKrYDxEPzg';
const baseUrl = 'https://n8n.aiodevelopers.com.br/api/v1';
const workflowId = 'uqzK8iPJmbZRAU5H';
const tunnelUrl = 'https://spotty-guests-shop.loca.lt/api/n8n';

// Use this common System Message
const NEW_SYSTEM_MESSAGE = `=# Identidade e Missão
Você é a **Lia**, a assistente pessoal executiva.
Sua missão é organizar finanças, tarefas e agenda.

## Ferramentas (Action Tools)
Você tem ferramentas de Código para executar ações:
1. \`Antigravity_AddTransaction\`: Registra gastos/receitas.
   Ex: "Gastei 50 no posto" -> { value: "50", memo: "Gasolina", direction: "expense", group: "Transporte" }

2. \`Antigravity_AddTask\`: Cria tarefas.
   Ex: "Comprar leite" -> { title: "Comprar leite", priority: "medium" }

3. \`Antigravity_AddEvent\`: Cria eventos.
   Ex: "Reunião amanhã às 10h" -> { title: "Reunião", startTime: "2024-02-15T10:00" }

## Instruções
- Use sempre as tools para ações.
- Se faltar info, pergunte.
- Confirme a ação feita.`;

// Helper to make Code Tools
const makeCodeTools = () => {
    return [
        {
            "name": "Antigravity_AddTransaction",
            "type": "@n8n/n8n-nodes-langchain.toolCode",
            "typeVersion": 1,
            "position": [280, 800],
            "parameters": {
                "name": "Antigravity_AddTransaction",
                "description": "Register a financial transaction (expense/income).",
                "jsCode": `
const body = {
  action: 'add_transaction',
  payload: { 
    description: input.memo || "Gasto diverso", 
    amount: input.value, 
    type: input.direction || "expense", 
    category: input.group || "Geral", 
    paymentMethod: input.method || "debit" 
  }
};
return await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
                `,
                "schemaType": "manual",
                // Manual Schema JSON
                "inputSchema": `{
  "type": "object",
  "properties": {
    "memo": { "type": "string", "description": "Description of expense" },
    "value": { "type": "string", "description": "Numeric value (e.g. 50.00)" },
    "direction": { "type": "string", "description": "'expense' or 'income'" },
    "group": { "type": "string", "description": "Category" },
    "method": { "type": "string", "description": "'credit' or 'debit'" }
  },
  "required": ["value"] 
}`
            }
        },
        {
            "name": "Antigravity_AddTask",
            "type": "@n8n/n8n-nodes-langchain.toolCode",
            "typeVersion": 1,
            "position": [280, 1000],
            "parameters": {
                "name": "Antigravity_AddTask",
                "description": "Create a new task.",
                "jsCode": `
const body = {
  action: 'add_task',
  payload: { 
    title: input.title, 
    priority: input.priority || "medium" 
  }
};
return await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
                `,
                "schemaType": "manual",
                "inputSchema": `{
  "type": "object",
  "properties": {
    "title": { "type": "string", "description": "Task description" },
    "priority": { "type": "string", "description": "low, medium, high" }
  },
  "required": ["title"]
}`
            }
        },
        {
            "name": "Antigravity_AddEvent",
            "type": "@n8n/n8n-nodes-langchain.toolCode",
            "typeVersion": 1,
            "position": [280, 1200],
            "parameters": {
                "name": "Antigravity_AddEvent",
                "description": "Create a calendar event.",
                "jsCode": `
const body = {
  action: 'add_event',
  payload: { 
    title: input.title, 
    startTime: input.startTime || new Date().toISOString(), 
    isAllDay: input.isAllDay || "false" 
  }
};
return await this.helpers.request({ method: 'POST', uri: '${tunnelUrl}', body, json: true });
                `,
                "schemaType": "manual",
                "inputSchema": `{
  "type": "object",
  "properties": {
    "title": { "type": "string", "description": "Event title" },
    "startTime": { "type": "string", "description": "ISO DateTime" },
    "isAllDay": { "type": "string", "description": "true/false" }
  },
  "required": ["title"]
}`
            }
        }
    ];
};

(async () => {
    try {
        console.log(`Fetching workflow ${workflowId}...`);
        const getRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.status}`);

        const workflowData = await getRes.json();

        // 1. Remove OLD Tools (V1 and V2 names)
        const oldToolNames = [
            'Antigravity_AddTask', 'Antigravity_AddTransaction', 'Antigravity_AddEvent',
            'Antigravity_AddTask_V2', 'Antigravity_AddTransaction_V2', 'Antigravity_AddEvent_V2',
            'Antigravity API'
        ];
        workflowData.nodes = workflowData.nodes.filter(n => !oldToolNames.includes(n.name));
        oldToolNames.forEach(name => { delete workflowData.connections[name]; });

        // 2. Add Code Tools
        const newNodes = makeCodeTools();
        workflowData.nodes.push(...newNodes);

        // 3. Connect to Agent
        newNodes.forEach(node => {
            workflowData.connections[node.name] = {
                "ai_tool": [
                    [
                        {
                            "node": "Agente Pessoal Completo",
                            "type": "ai_tool",
                            "index": 0
                        }
                    ]
                ]
            };
        });

        // 4. Update Agent Prompt
        const agentNode = workflowData.nodes.find(n => n.name === 'Agente Pessoal Completo');
        if (agentNode) {
            console.log('Updating System Message for Code Tools...');
            if (!agentNode.parameters.options) agentNode.parameters.options = {};
            agentNode.parameters.options.systemMessage = NEW_SYSTEM_MESSAGE;
        }

        // 5. Update Workflow
        const payload = {
            name: workflowData.name,
            nodes: workflowData.nodes,
            connections: workflowData.connections,
            settings: { executionOrder: 'v1' }
        };

        console.log('Sending Code Tool update to n8n...');
        const updateRes = await fetch(`${baseUrl}/workflows/${workflowId}`, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (updateRes.ok) {
            console.log('✅ Replaced with Code Tools successfully!');
        } else {
            console.error(`❌ Update failed: ${updateRes.status}`);
            console.error(await updateRes.text());
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
})();
