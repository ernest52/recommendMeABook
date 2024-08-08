import express from "express";
import dotenv from "dotenv";
import pg from "pg";
import engine from "ejs-mate";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import {
  localsRep,
  asyncWrap,
  errorApp,
  errorHandler,
  validatorFactorer,
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
const secret = process.env.SESSION_SECRET || "aniaMaFajneButy";
const saltRounds = 10;
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
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(localsRep);
app.engine("ejs", engine);

app.get("/", async (req, res) => {
  if (req?.user) {
    console.log("req.user: ", req.user);
  }
  const { rows } = await db.query(
    "SELECT * FROM books ORDER BY rating DESC LIMIT $1",
    [5]
  );
  if (req.session?.success) {
    res.locals.success = req.session.success;
    delete req.session.success;
  }

  res.render("index", { books: rows });
});
app.get(
  "/newBook",
  asyncWrap(async (req, res) => {
    const { rows } = await db.query("SELECT * FROM books WHERE id=$1 ", [2]);
    let defData = null;
    if (rows.length) {
      defData = {
        ...rows[0],
        written: rows[0].written.toISOString().split("T")[0],
      };
    }

    res.render("newBook", { defData: JSON.stringify(defData) });
  })
);
app.get("/books/:genres", async (req, res) => {
  const { genres } = req.params;
  const { rows } = await db.query("SELECT * FROM books WHERE genres=$1", [
    genres,
  ]);

  res.render("index", { books: rows });
});
app.get("/register", (req, res) => {
  res.render("userForm", { func: "register" });
});

app.post("/register", validatorFactorer("register"), async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username=$1 ", [
      username,
    ]);
    if (rows.length) {
      req.session.error = "Such user already exists try to log in";
      res.redirect("/logIn");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) console.log("error with hashing: ", err);
        else {
          const { rows } = await db.query(
            "INSERT INTO users (username,email,password) VALUES($1,$2,$3) RETURNING*",
            [username, email, hash]
          );
          const user = rows[0];
          console.log("created user: ", user);
          req.login(user, (err) => {
            if (err) console.log("occured errror with log in: ", err);
            res.redirect("/");
          });
        }
      });
    }
  } catch (err) {
    req.session.error = err?.message || "register process failed";
    res.redirect("/");
  }
});
app.get("/logIn", (req, res) => {
  res.render("userForm", { func: "logIn" });
});

app.post(
  "/logIn",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/logIn",
  })
);
app.post("/logOut", (req, res) => {
  req.logOut((err) => {
    if (err) console.log("error occured wirh log out:", err);
    req.session.success = "successfully logged out";
    res.redirect("/");
  });
});
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { genres } = req.query;
  const result = await db.query("DELETE FROM books WHERE id=$1 RETURNING *", [
    id,
  ]);
  res.redirect(`/books/${genres}`);
});
app.get("*", (req, res) => {
  throw new errorApp("such page doens't exist", 404);
});
app.post(
  "/addBook",
  validatorFactorer("nbForm"),
  asyncWrap(async (req, res) => {
    const { title, author, written, genres, description, rating, isbn } =
      req.body;
    const src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
    req.body.src = src;

    await db.query(
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

    res.redirect("/");
  })
);

passport.use(
  "local",
  new Strategy(async function (username, password, cb) {
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE username=$1", [
        username,
      ]);
      if (rows.length) {
        const user = rows[0];
        const hashedPassword = user.password;

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            console.log(err);
            return cb(err);
          }
          if (result) {
            return cb(null, user);
          } else {
            return cb(null, false);
          }
        });
      } else {
        return cb("auth failed");
      }
    } catch (err) {
      return cb(err);
    }
  })
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});
app.use(errorHandler);
app.listen(port, () => {
  console.log("server work on port", port);
});
