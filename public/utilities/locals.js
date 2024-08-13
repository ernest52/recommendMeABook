import db from "../../pgConnection/db.js";
import menu from "./sideNav.js";
const localsRep = async (req, res, next) => {
  res.locals.menu = menu;
  res.locals.success = null;
  res.locals.isAuth = req.isAuthenticated();
  res.locals.sideNav = "main";

  res.locals.books = null;
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    if (req.session?.sideNav) {
      res.locals.sideNav = req.session.sideNav;
    }
    if (!req.session?.userBooks) {
      const { rows: userBooks } = await db.query(
        "SELECT * FROM books WHERE creator_id=$1",
        [req.user.id]
      );
      req.session.userBooks = userBooks.map((el) => el.id);
      // console.log("req.session.userBooks: ", req.session.userBooks);
    }
    if (!req.session?.userFavs) {
      const { rows: userFavs } = await db.query(
        "SELECT book_id FROM favs WHERE user_id=$1",
        [req.user.id]
      );
      req.session.userFavs = userFavs.map((el) => el.book_id);
    }
    res.locals.userBooks = req.session.userBooks;
    res.locals.userFavs = req.session.userFavs;
  } else {
    res.locals.userBooks = null;
    res.locals.userFavs = null;
    if (req.session?.userBooks) {
      delete req.session.userBooks;
    }
    if (req.session?.userFavs) {
      delete req.session.userFavs;
    }
    if (req.session?.sideNav) {
      delete req.session.sideNav;
    }
  }
  res.locals.error = null;
  res.locals.oldNbFormData = null;

  if (req.session?.error) {
    res.locals.error = req.session.error;

    delete req.session.error;
  } else if (req.flash("error")) {
    res.locals.error = req.flash("error");
  }

  if (req.session?.oldNbFormData) {
    res.locals.oldNbFormData = req.session.oldNbFormData;
    delete req.session.oldNbFormData;
  }

  next();
};
export default localsRep;
