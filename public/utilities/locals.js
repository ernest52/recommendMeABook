import menu from "./sideNav.js";
const localsRep = (req, res, next) => {
  res.locals.menu = menu;
  res.locals.success = null;
  res.locals.isAuth = req.isAuthenticated();
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    // console.log("res.locals.user: ", res.locals.user);
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
