import { asyncWrap } from "../public/utilities/index.js";
import db from "../pgConnection/db.js";
const getFavs = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(
    "SELECT id,title,author,written,genres,src,description FROM favs JOIN books ON  favs.book_id=books.id WHERE favs.user_id=$1",
    [id]
  );
  req.session.books = rows;
  req.session.func = "favs";
  req.session.sideNav = "userPanel";

  res.redirect("/");
});
const addFav = asyncWrap(async (req, res) => {
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
});

const deleteFav = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { book } = req.body;
  await db.query("DELETE FROM favs WHERE book_id=$1 AND user_id=$2", [
    book,
    id,
  ]);
  req.session.success = "book removed from favs list";
  res.redirect("/");
});

export { addFav, deleteFav, getFavs };
