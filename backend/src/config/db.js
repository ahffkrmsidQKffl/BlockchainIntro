// src/config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config(); // .env 파일에서 DB 설정 불러오기

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blockchain',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;