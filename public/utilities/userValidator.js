import Joi from "joi";
export default async (req, res, next) => {
  const formSchema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().min(7).max(50).required(),
    password: Joi.string().min(8).required(),
  }).required();
  const { error } = formSchema.validate(req.body);
  if (error) {
    let errObj = {
      key: error.details[0].context?.key,
      message: error.details[0].message,
    };
    req.session.error = errObj;
    req.session.oldNbFormData = JSON.stringify(req.body);
    res.redirect("/user/register");
  } else {
    next();
  }
};
