const { Pool } = require('pg');

const pool = new Pool({
  user: 'iot_user',
  host: 'localhost',
  database: 'iot_health',
  password: '123456',
  port: 5432,
});

module.exports = pool;