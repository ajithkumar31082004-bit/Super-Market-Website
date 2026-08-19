const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initDatabase() {
    console.log(`Connecting to MySQL at ${process.env.DB_HOST || 'localhost'} as ${process.env.DB_USER || 'root'}...`);
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root'
        });

        const dbName = process.env.DB_NAME || 'supermarket_db';
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Database "${dbName}" verified.`);

        await conn.changeUser({ database: dbName });

        const schemaFile = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaFile)) {
            const sql = fs.readFileSync(schemaFile, 'utf8');
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const stmt of statements) {
                try {
                    await conn.query(stmt);
                } catch (err) {
                    // Ignore if table/data already exists
                    if (!err.message.includes('already exists') && !err.message.includes('Duplicate entry')) {
                        console.warn('Notice on statement:', err.message);
                    }
                }
            }
            console.log(`Schema tables & initial data initialized in "${dbName}".`);
        }

        await conn.end();
        console.log('✅ Database setup and connection test completed successfully!');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
}

initDatabase();
