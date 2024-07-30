import menu from "./sideNav.js";
const localsRep = (req, res, next) => {
  res.locals.menu = menu;
  // //console.log("req.flash(error)");
  // //console.log(req.flash("error"));
  res.locals.error = null;
  res.locals.oldNbFormData = null;
  //console.log("req");
  //console.log(req.session);

  if (req.session?.error) {
    res.locals.error = req.session.error;

    delete req.session.error;
  }
  if (req.session?.oldNbFormData) {
    res.locals.oldNbFormData = req.session.oldNbFormData;
    delete req.session.oldNbFormData;
  }
  // //console.log("res.locals.error: ");
  // //console.log(res.locals.error);

  next();
};
export default localsRep;
