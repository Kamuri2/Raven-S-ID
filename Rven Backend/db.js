import pkg from 'pg';
const { Pool } = pkg;

const db = new Pool({
  user: 'RavenID',
  host: 'localhost',
  database: 'sistema_validacion',
  password: 'Kaoriko2',
  port: 5432,
});

export default db;