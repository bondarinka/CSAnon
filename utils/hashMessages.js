const { Pool } = require('pg');

// was causing authentication errors with the connectionString for some reason
// needed the information added explicitly
const db = new Pool({
  user: 'sxxfhsmp',
  password: '24uEPIYvk4WgTARJKU3CWztooRTxxlNV',
  host: 'ruby.db.elephantsql.com',
  database: 'sxxfhsmp',
  port: 5432,
});

const createUsersTableQuery = `CREATE TABLE users
(
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(3000),
  pic_url VARCHAR(3000)
)`;

const createMessagesTableQuery = `CREATE TABLE messages
(
  id SERIAL PRIMARY KEY,
  timestamp DATE,
  user_id INTEGER REFERENCES users(user_id), 
  message VARCHAR(3000)
)`;

//db.query(createUsersTableQuery);
db.query(createMessagesTableQuery);