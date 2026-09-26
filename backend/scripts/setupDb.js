const fs = require('fs');
const path = require('path');
const pool = require('../mysql.config');

async function setupDatabase() {
    try {
        const sqlPath = path.join(__dirname, '../db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon, but be careful with procedures or complex strings
        // For our simple db.sql, splitting by ; is mostly fine if we filter empty strings
        const queries = sql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        console.log('Starting database setup...');

        for (let query of queries) {
            try {
                await pool.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            } catch (err) {
                // If it's a "CREATE DATABASE" error because it exists, we might ignore or log
                if (err.code === 'ER_DB_CREATE_EXISTS') {
                    console.log('Database already exists.');
                } else {
                    console.error(`Error executing query: ${err.message}`);
                }
            }
        }

        console.log('Database setup completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to setup database:', err.message);
        process.exit(1);
    }
}

setupDatabase();
