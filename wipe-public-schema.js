
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function wipeSchema() {
    try {
        console.log('Connecting to DB...');
        await client.connect();

        console.log('🚨 WIPING PUBLIC SCHEMA...');
        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');
        await client.query('GRANT ALL ON SCHEMA public TO postgres');
        await client.query('GRANT ALL ON SCHEMA public TO public');
        await client.query('COMMENT ON SCHEMA public IS \'standard public schema\'');

        console.log('✅ Public Schema Reset!');
        await client.end();
    } catch (err) {
        console.error('❌ Error wiping schema:', err);
    }
}

wipeSchema();
