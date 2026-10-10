/**
 * Server Entrypoint
 * Starts HTTP Server and Verifies Database Connection
 */

require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// Test PostgreSQL Database Connection before serving
db.query('SELECT current_database(), current_user, version()')
  .then((res) => {
    const dbInfo = res.rows[0];
    console.log('================================================================');
    console.log('🚀 MALL MANAGEMENT SYSTEM - BACKEND API SERVER');
    console.log('🏛️  Case Study: Phoenix Marketcity, Mumbai');
    console.log('================================================================');
    console.log(`✅ PostgreSQL Connected Successfully`);
    console.log(`📦 Database: ${dbInfo.current_database}`);
    console.log(`👤 User:     ${dbInfo.current_user}`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`🩺 Health check:      http://localhost:${PORT}/api/health`);
    console.log('================================================================');
  })
  .catch((err) => {
    console.error('⚠️  Failed to connect to PostgreSQL database on startup:');
    console.error(err.message);
    console.log('👉 Ensure PostgreSQL service is running and database "mini_project_172_173" is created.');
    console.log('👉 See database/01_create_database.sql and database/04_sample_data.sql');
  });

app.listen(PORT, () => {
  // Server initialized
});
