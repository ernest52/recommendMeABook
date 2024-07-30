import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import engine from "ejs-mate";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import {
  localsRep,
  asyncWrap,
  errorApp,
  errorHandler,
  nbFormValidator,
} from "./public/utilities/index.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
const db = new pg.Client({
  user: "postgres",
  database: "recomendMeABook",
  port: 5432,
  password: "gyhdEede3RDeede3",
});
db.connect();

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SECRET || "aniaMaFajneButy";
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "recommedMeABook",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());
app.use(localsRep);
app.engine("ejs", engine);

app.get("/", async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM books ORDER BY rating DESC LIMIT $1",
    [5]
  );

  res.render("index", { books: rows });
});
app.get("/newBook", (req, res) => {
  res.render("newBook");
});
app.get("/books/:genres", async (req, res) => {
  const { genres } = req.params;
  const { rows } = await db.query("SELECT * FROM books WHERE genres=$1", [
    genres,
  ]);

  res.render("index", { books: rows });
});
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { genres } = req.query;
 const result= await db.query("DELETE FROM books WHERE id=$1 RETURNING *",[id]);
  res.redirect(`/books/${genres}`);
});
// app.get("/error", (req, res) => {
//   res.render("error", {});
// });
app.get("*", (req, res) => {
  throw new errorApp("such page doens't exist", 404);
});
app.post(
  "/addBook",
  nbFormValidator,
  asyncWrap(async (req, res) => {
    const { title, author, written, genres, description, rating, isbn } =
      req.body;
    const src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
    req.body.src = src;
    // id
    // title
    // author
    // written
    // genres
    // src
    // description
    // rating
    // isbn
    const { rows } = await db.query(
      "INSERT INTO books (title,author,written,genres ,src ,description ,rating,isbn) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        title.trim(),
        author.trim(),
        written,
        genres,
        src,
        description.trim(),
        rating,
        isbn.trim(),
      ]
    );

    res.send(req.body);
  })
);

app.use(errorHandler);

app.listen(port, () => {
  console.log("server work on port", port);
});
