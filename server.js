import express from "express";
import dotenv from "dotenv";
// import pg from "pg";
import engine from "ejs-mate";
import session from "express-session";
import flash from "connect-flash";
import methodOverride from "method-override";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth20";
import { localsRep, errorApp, errorHandler } from "./public/utilities/index.js";
import db from "./pgConnection/db.js";
import {
  userRouter,
  BooksRouter,
  GoogleAuthRouter,
  selectedUserRouter,
} from "./routes/index.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SESSION_SECRET || "aniaMaFajneButy";

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
  res.locals.sideNav = req.session?.sideNav || "main";
  // console.log("req.session.sideNav: ", req.session?.sideNav);
  if (req.session?.sideNav) {
    delete req.session.sideNav;
  }

  // console.log("res.locals.sideNav: ", res.locals.sideNav);

  let books;
  if (req.session.books) {
    books = req.session.books;
    delete req.session.books;
  } else {
    const { rows } = await db.query(
      "SELECT * FROM books ORDER BY rating DESC LIMIT $1",
      [5]
    );
    books = rows;
  }

  if (req.session?.success) {
    res.locals.success = req.session.success;
    delete req.session.success;
  }

  res.render("index", { books });
});
app.use("/user", userRouter);
app.use("/user/:id", selectedUserRouter);

app.use("/books", BooksRouter);
app.use("/auth/google", GoogleAuthRouter);

app.get("*", (req, res) => {
  throw new errorApp("such page doens't exist", 404);
});

passport.use(
  "local",
  new Strategy(async function (username, password, cb) {
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE username=$1", [
        username,
      ]);
      if (rows.length) {
        const user = rows[0];
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
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL: process.env.GOOGLE_USER_PROFILE_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      // console.log("profile: ", profile);
      // console.log("profile._jon.email: ", profile._json.email);
      // console.log("OBJECT.KEYS[profile]", Object.keys(profile));
      const result = await db.query("SELECT * FROM users WHERE email=$1", [
        profile._json.email,
      ]);
      if (!result.rows.length) {
        try {
          const { rows } = await db.query(
            "INSERT INTO users (username,email,password) VALUES($1,$2,$3) RETURNING*",
            [profile.displayName, profile._json.email, "google"]
          );
          const newUser = rows[0];
          cb(null, newUser);
        } catch (err) {
          cb(err, null);
        }
      } else {
        // console.log("user: ");

        cb(null, result.rows[0]);
      }
    }
  )
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
