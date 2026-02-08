const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'apos.db');
const db = new Database(dbPath);

console.log('🔄 Executando migração...');

try {
    // Adiciona coluna priority se não existir
    const columns = db.prepare("PRAGMA table_info(tasks)").all();
    const hasPriority = columns.some((c) => c.name === 'priority');

    if (!hasPriority) {
        db.exec("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'low'");
        console.log('✅ Coluna "priority" adicionada à tabela tasks.');
    } else {
        console.log('ℹ️ Coluna "priority" já existe.');
    }

    // Atualiza tarefas existentes para ter prioridade default
    db.prepare("UPDATE tasks SET priority = 'low' WHERE priority IS NULL").run();
    console.log('✅ Tarefas existentes atualizadas com prioridade padrão.');

} catch (error) {
    console.error('❌ Erro na migração:', error.message);
}

db.close();
console.log('🚀 Migração concluída!');
