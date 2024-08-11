import express from "express";
import { validatorFactorer } from "../public/utilities/index.js";
import { registerNewUser } from "../controlers/user.js";
import passport from "passport";
const userRouter = express.Router();
userRouter
  .route("/register")
  .get((req, res) => {
    res.render("userForm", { func: "register" });
  })
  .post(validatorFactorer("register"), registerNewUser);
userRouter
  .route("/logIn")
  .get((req, res) => {
    res.render("userForm", { func: "logIn" });
  })
  .post(
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/user/logIn",
    })
  );

userRouter.post("/logOut", (req, res) => {
  req.logOut((err) => {
    if (err) console.log("error occured wirh log out:", err);
    req.session.success = "successfully logged out";
    res.redirect("/");
  });
});

export default userRouter;
