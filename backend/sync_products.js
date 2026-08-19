const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function syncAllProducts() {
    console.log('Connecting to MySQL supermarket_db to sync 52 products...');
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'supermarket_db'
        });

        // Clear existing product records to reseed cleanly
        await conn.query('DELETE FROM order_items WHERE 1=1');
        await conn.query('DELETE FROM products WHERE 1=1');
        await conn.query('ALTER TABLE products AUTO_INCREMENT = 1');

        const productsJsonPath = path.join(__dirname, '../data/products.json');
        const data = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
        const productsList = data.products || [];

        console.log(`Inserting ${productsList.length} products into MySQL...`);

        for (const p of productsList) {
            await conn.query(
                `INSERT INTO products (id, name, description, price, original_price, category, image, stock, featured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    p.id,
                    p.name,
                    p.description,
                    p.price,
                    p.originalPrice || null,
                    p.category,
                    p.image,
                    p.stock || 50,
                    p.featured ? 1 : 0
                ]
            );
        }

        const [rows] = await conn.query('SELECT COUNT(*) as total, category, COUNT(id) as cat_count FROM products GROUP BY category');
        const [totalRows] = await conn.query('SELECT COUNT(*) as total FROM products');

        console.log(`✅ SUCCESS: ${totalRows[0].total} products successfully synced into MySQL database "supermarket_db"!`);
        await conn.end();
    } catch (err) {
        console.error('❌ Sync Error:', err.message);
    }
}

syncAllProducts();
