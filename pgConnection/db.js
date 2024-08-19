import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  database: process.env.PG_DB,
  port: process.env.PG_PORT,
  password: process.env.PG_PASSWORD,
});

db.connect();
export default db;
