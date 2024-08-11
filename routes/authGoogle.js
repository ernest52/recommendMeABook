import express from "express";
import passport from "passport";
const GoogleAuthRouter = express.Router();
GoogleAuthRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
GoogleAuthRouter.get(
  "/auth/google/userPanel",
  passport.authenticate("google", {
    failureRedirect: "/logIn",
    // successRedirect: "/",
  }),
  (req, res) => {
    req.session.success = "Successfully logged In";
    res.redirect("/");
  }
);

export default GoogleAuthRouter;
