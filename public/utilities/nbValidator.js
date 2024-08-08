import Joi from "joi";
export default async (req, res, next) => {
  let errObj = null;
  const formSchema = Joi.object({
    title: Joi.string().min(5).max(100).required(),
    author: Joi.string().min(5).max(50).required(),
    written: Joi.string().required(),
    genres: Joi.string().required(),
    description: Joi.string().required().max(500).min(20),
    rating: Joi.number().min(0).max(10).required(),
    isbn: Joi.string().required().min(10).max(13),
  }).required();
  const { isbn, genres } = req.body;
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg?default=false`;
  const respond = await fetch(url);
  if (respond?.status == 404) {
    errObj = {
      key: "isbn",
      message: `book with this: ${isbn} isbn number probably doesn't exist. Check this number and try again`,
    };
  }
  if (isbn.length !== 10 && isbn.length !== 13) {
    errObj = {
      key: "isbn",
      message: "isbn can only contain 10 or 13 characters",
    };
  }
  if (genres === "default") {
    errObj = {
      key: "genres",
      message: "genres isn't correct",
    };
  }
  const { error } = formSchema.validate(req.body);
  if (error || errObj) {
    errObj = error
      ? {
          key: error.details[0].context?.key,
          message: error.details[0].message,
        }
      : errObj;
    req.session.error = errObj;
    req.session.oldNbFormData = JSON.stringify(req.body);
    res.redirect("/newBook");
  } else {
    next();
  }
};
