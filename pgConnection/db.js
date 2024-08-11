import pg from "pg";
const db = new pg.Client({
  user: "postgres",
  database: "recomendMeABook",
  port: 5432,
  password: "gyhdEede3RDeede3",
});
db.connect();
export default db;
