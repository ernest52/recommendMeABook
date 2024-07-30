export default (error, req, res, next) => {
  const { message = "sth went wrong", status = 500, page = "error" } = error;
  // req.flash("error", `error occured with status ${status} message: ${message}`);
  const errorMessage = `error occured with status ${status} message: ${message}`;

  res.render(page, { error: errorMessage });
  // res.redirect(req.path);
};
