import express from "express";
import passport from "passport";
const GoogleAuthRouter = express.Router();
GoogleAuthRouter.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
GoogleAuthRouter.get(
  "/userPanel",
  passport.authenticate("google", {
    failureRedirect: "/user/logIn",
    // successRedirect: "/",
  }),
  (req, res) => {
    req.session.success = "Successfully logged In";
    res.redirect("/");
  }
);

export default GoogleAuthRouter;
