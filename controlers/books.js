import { asyncWrap } from "../public/utilities/index.js";
const addNewBook = asyncWrap(async (req, res) => {
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
});

export { addNewBook };
