import { asyncWrap } from "../public/utilities/index.js";
import db from "../pgConnection/db.js";
const addNewBook = asyncWrap(async (req, res) => {
  const { title, author, written, genres, description, rating, isbn } =
    req.body;
  const src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;

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

const selectBook = asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query("SELECT * FROM books WHERE id=$1", [id]);
  const book = rows[0];
  const date = new Date(book.written).toISOString().split("T")[0];
  const data = { ...book, written: date };
  res.locals.oldNbFormData = JSON.stringify(data);
  res.locals.func = "update";
  res.locals.id = data.id;
  res.render("newBook");
});

const updateBook = asyncWrap(async (req, res) => {
  const { id } = req.params;
  let { title, author, written, genres, src, description, rating, isbn } =
    req.body;
  const { rows } = await db.query("SELECT * FROM books WHERE id=$1", [id]);
  const oldData = rows[0];
  title = title || oldData.title;
  author = author || oldData.author;
  written = written || oldData.written;
  genres = genres || oldData.genres;
  description = description || oldData.description;
  rating = rating || oldData.rating;
  isbn = isbn || oldData.isbn;
  src =
    src ||
    oldData.src ||
    `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;

  const result = await db.query(
    "UPDATE books SET title=$1,author=$2,written=$3,genres=$4,src=$5,description=$6,rating=$7,isbn=$8 WHERE id=$9 RETURNING * ",
    [title, author, written, genres, src, description, rating, isbn, id]
  );
  // console.log("result: ", result.rows[0]);
  req.session.success = "Book updated";
  res.redirect("/");
});
const deleteBook = asyncWrap(async (req, res) => {
  const { id } = req.params;
  // const { genres } = req.query;
  // console.log(`id: ${id}, genres: ${genres}`);
  const { rows } = await db.query("DELETE FROM books WHERE id=$1 RETURNING *", [
    id,
  ]);
  const deletedBook = rows[0];
  console.log("deletedBook: ", deletedBook);
  const { title, author, written, genres, src, description, rating, isbn } =
    deletedBook;
  const responseFromInseting = await db.query(
    "INSERT INTO books (title,author,written,genres ,src ,description ,rating,isbn,id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [title, author, written, genres, src, description, rating, isbn, id]
  );
  console.log("responseFromInseting: ", responseFromInseting);
  req.session.success = "book removed";
  res.redirect(`/books/genres/${genres}`);
});

export { addNewBook, selectBook, updateBook, deleteBook };
