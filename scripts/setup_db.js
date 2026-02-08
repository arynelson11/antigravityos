const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Caminho do banco na raiz do projeto
const dbPath = path.join(__dirname, '..', 'apos.db');

// Remove banco antigo se existir (Começar do zero)
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('🗑️ Banco antigo removido.');
}

const db = new Database(dbPath);
console.log('✨ Novo banco apos.db criado.');

// 1. CRIAÇÃO DAS TABELAS (SCHEMA PRD 3.0)
const schema = `
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar_url TEXT,
        theme_color TEXT,
        is_admin BOOLEAN DEFAULT 0
    );

    CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL DEFAULT 0,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE credit_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        closing_day INTEGER NOT NULL,
        due_day INTEGER NOT NULL,
        limit_amount REAL,
        color_theme TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT,
        type TEXT NOT NULL,
        account_id INTEGER,
        card_id INTEGER,
        user_id INTEGER,
        installment_number INTEGER,
        total_installments INTEGER,
        parent_transaction_id INTEGER,
        is_paid BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        is_done BOOLEAN DEFAULT 0,
        due_date TEXT,
        list_name TEXT DEFAULT 'Geral',
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        location TEXT,
        is_all_day BOOLEAN DEFAULT 0,
        user_id INTEGER,
        color TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    );
`;

db.exec(schema);
console.log('✅ Tabelas criadas com sucesso.');

// 2. INSERÇÃO DE DADOS (SEED)

// A. Usuários (Casal)
const insertUser = db.prepare('INSERT INTO users (name, theme_color, is_admin) VALUES (?, ?, ?)');
const user1 = insertUser.run('Siyam', 'blue', 1).lastInsertRowid;
const user2 = insertUser.run('Parceira', 'purple', 0).lastInsertRowid;
console.log(`👤 Usuários criados: Siyam (ID: ${user1}), Parceira (ID: ${user2})`);

// B. Contas Bancárias
const insertAccount = db.prepare('INSERT INTO accounts (name, type, balance, user_id) VALUES (?, ?, ?, ?)');
const acc1 = insertAccount.run('Nubank Conta', 'checking', 15450.00, user1).lastInsertRowid;
const acc2 = insertAccount.run('Inter Invest', 'investment', 45000.00, user1).lastInsertRowid;
const acc3 = insertAccount.run('Itaú Conjunto', 'checking', 3200.50, null).lastInsertRowid;
console.log(`💳 Contas criadas: Nubank (R$ 15.450), Inter (R$ 45.000), Itaú Conjunto (R$ 3.200)`);

// C. Cartões de Crédito
const insertCard = db.prepare('INSERT INTO credit_cards (name, closing_day, due_day, limit_amount, color_theme, user_id) VALUES (?, ?, ?, ?, ?, ?)');
const card1 = insertCard.run('Nubank Ultravioleta', 10, 17, 50000, 'violet', user1).lastInsertRowid;
const card2 = insertCard.run('XP Visa Infinite', 5, 12, 35000, 'black', user1).lastInsertRowid;
console.log(`💳 Cartões criados: Nubank Ultravioleta, XP Visa Infinite`);

// D. Transações (Onde a mágica acontece)
const insertTx = db.prepare(`
    INSERT INTO transactions (description, amount, date, category, type, account_id, card_id, user_id, installment_number, total_installments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// D1. Salário (Receita)
insertTx.run('Salário Mensal', 12000, new Date().toISOString(), 'Salário', 'income', acc1, null, user1, null, null);

// D2. Despesa Simples (Débito)
insertTx.run('Supermercado Semanal', -850.50, new Date().toISOString(), 'Alimentação', 'expense', acc1, null, user1, null, null);
insertTx.run('Conta de Luz', -245.00, new Date().toISOString(), 'Casa', 'expense', acc1, null, user1, null, null);
insertTx.run('Internet Vivo', -149.90, new Date().toISOString(), 'Casa', 'expense', acc1, null, user1, null, null);

// D3. A COMPRA PARCELADA (Motor de Parcelas)
const valorTotal = -7000;
const parcelas = 10;
const valorParcela = valorTotal / parcelas;
const dataCompra = new Date();

console.log('🔄 Gerando parcelamento inteligente (iPhone 15 Pro 10x)...');

for (let i = 1; i <= parcelas; i++) {
    let dataParcela = new Date(dataCompra);
    dataParcela.setMonth(dataCompra.getMonth() + (i - 1));

    insertTx.run(
        `iPhone 15 Pro (${i}/${parcelas})`,
        valorParcela,
        dataParcela.toISOString(),
        'Eletrônicos',
        'expense',
        null,
        card1,
        user1,
        i,
        parcelas
    );
}

// D4. Transações da Parceira
insertTx.run('Salário Parceira', 8500, new Date().toISOString(), 'Salário', 'income', acc3, null, user2, null, null);
insertTx.run('Farmácia', -89.90, new Date().toISOString(), 'Saúde', 'expense', acc3, null, user2, null, null);

// E. Tarefas
const insertTask = db.prepare('INSERT INTO tasks (title, is_done, list_name, user_id) VALUES (?, ?, ?, ?)');
insertTask.run('Pagar Condomínio', 0, 'Casa', user1);
insertTask.run('Marcar revisão do carro', 0, 'Carro', user1);
insertTask.run('Comprar ração', 1, 'Casa', user1);
insertTask.run('Organizar armário', 0, 'Casa', user2);
insertTask.run('Dentista sexta-feira', 0, 'Saúde', user2);
console.log('📋 Tarefas de exemplo criadas.');

// F. Eventos
const insertEvent = db.prepare('INSERT INTO events (title, start_time, end_time, is_all_day, user_id, color) VALUES (?, ?, ?, ?, ?, ?)');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
insertEvent.run('Jantar com amigos', tomorrow.toISOString(), null, 0, user1, 'blue');
insertEvent.run('Dentista', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), null, 0, user2, 'purple');
console.log('📅 Eventos de exemplo criados.');

console.log('\n🚀 Banco de dados PRD 3.0 populado e pronto para o Next.js!');
console.log(`   Saldo Total: R$ ${(15450 + 45000 + 3200.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
db.close();
