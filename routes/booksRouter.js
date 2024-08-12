import express from "express";
import { asyncWrap, validatorFactorer } from "../public/utilities/index.js";
import {
  addNewBook,
  selectBook,
  updateBook,
  deleteBook,
} from "../controlers/books.js";
import db from "../pgConnection/db.js";
const BooksRouter = express.Router();
BooksRouter.route("/new")
  .get((req, res) => {
    res.locals.func = "new";
    res.render("newBook");
  })
  .post(validatorFactorer("nbForm"), addNewBook);
BooksRouter.route("/:id").get(selectBook).patch(updateBook).delete(deleteBook);

BooksRouter.get("/genres/:genres", async (req, res) => {
  const { genres } = req.params;
  const { rows } = await db.query("SELECT * FROM books WHERE genres=$1", [
    genres,
  ]);

  // res.render("index", { books: rows });
  req.session.books = rows;
  res.redirect("/");
});

export default BooksRouter;
