import express from "express";
import db from "../pgConnection/db.js";
import { asyncWrap } from "../public/utilities/index.js";
const selectedUserRouter = express.Router({ mergeParams: true });
selectedUserRouter.post(
  "/favs",
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const { book } = req.body;
    const { rows } = await db.query(
      "INSERT INTO favs (user_id,book_id) VALUES ($1,$2) RETURNiNG *",
      [id, book]
    );

    const book_id = rows[0].book_id;

    req.session.userFavs.push(book_id);

    req.session.success = "book added to your favs";
    res.redirect("/");
  })
);
selectedUserRouter.get("/myPanel", (req, res) => {
  req.session.sideNav = "userPanel";
  res.redirect("/");
});
selectedUserRouter.get("/books", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT title,author,written,genres,src,description FROM books WHERE creator_id=$1 ",
    [id]
  );
  console.log("rows from books: ", rows);
  req.session.books = rows;
  req.session.sideNav = "userPanel";
  res.redirect("/");
});
selectedUserRouter.get("/favs", async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT title,author,written,genres,src,description FROM favs JOIN books ON  favs.book_id=books.id WHERE favs.user_id=$1",
    [id]
  );
  console.log("rows from favs: ", rows);
  req.session.books = rows;
  req.session.sideNav = "userPanel";

  res.redirect("/");
});
export default selectedUserRouter;
