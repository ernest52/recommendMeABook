import express from "express";
import { asyncWrap, validatorFactorer } from "../public/utilities/index.js";
import { addNewBook } from "../controlers/books.js";
import db from "../pgConnection/db.js";
const BooksRouter = express.Router();
BooksRouter.route("/new")
  .get((req, res) => {
    res.render("newBook");
  })
  .post(validatorFactorer("nbForm"), addNewBook);

BooksRouter.get("/genres/:genres", async (req, res) => {
  const { genres } = req.params;
  const { rows } = await db.query("SELECT * FROM books WHERE genres=$1", [
    genres,
  ]);

  // res.render("index", { books: rows });
  req.session.books = rows;
  res.redirect("/");
});
BooksRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { genres } = req.query;
  const result = await db.query("DELETE FROM books WHERE id=$1 RETURNING *", [
    id,
  ]);
  res.redirect(`/books/${genres}`);
});

export default BooksRouter;
