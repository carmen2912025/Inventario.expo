const mysql = require('mysql2');
const dbConfig = require('./db.config');

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();

// Script para mostrar el threadId de una conexión MySQL
if (require.main === module) {
  const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port || 3306,
  });
  connection.connect((err) => {
    if (err) {
      console.error('Error de conexión:', err.message);
      process.exit(1);
    }
    console.log('Thread ID:', connection.threadId);
    connection.end();
  });
}
