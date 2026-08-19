const pool = require('./config/db');

async function createReviewsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_name VARCHAR(100) DEFAULT 'Verified Customer',
                rating DECIMAL(2,1) NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Reviews table verified in MySQL supermarket_db!');

        // Insert sample reviews
        const [existing] = await pool.query('SELECT COUNT(*) as count FROM reviews');
        if (existing[0].count === 0) {
            await pool.query(`
                INSERT INTO reviews (product_id, user_name, rating, comment) VALUES
                (1, 'Ananya Sharma', 5.0, 'Incredibly fresh and crisp apples! Loved the packaging.'),
                (3, 'Rajesh Kumar', 5.0, 'Best Alphonso mangoes I ordered online. Very sweet and aromatic.'),
                (21, 'Deepak Patel', 4.5, 'Pure fresh cow milk, boiling quality is superb.')
            `);
            console.log('✅ Seed reviews added!');
        }
        await pool.end();
    } catch (e) {
        console.error('Reviews init error:', e.message);
    }
}

createReviewsTable();
