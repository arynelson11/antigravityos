
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

console.log('Testing connection...');
console.log('URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

async function test() {
    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('🕒 Current time from DB:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    }
}

test();
