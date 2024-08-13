import express from "express";
import db from "../pgConnection/db.js";
import { asyncWrap } from "../public/utilities/index.js";
const selectedUserRouter = express.Router({ mergeParams: true });
selectedUserRouter.post(
  "/favs",
  asyncWrap(async (req, res) => {
    const { id } = req.params;
    const { book } = req.body;
    const { rows } = await db.query(
      "INSERT INTO favs (user_id,book_id) VALUES ($1,$2) RETURNiNG *",
      [id, book]
    );

    const book_id = rows[0].book_id;

    req.session.userFavs.push(book_id);

    req.session.success = "book added to your favs";
    res.redirect("/");
  })
);
selectedUserRouter.get("/myPanel", (req, res) => {
  req.session.sideNav = "userPanel";
  res.redirect("/");
});
export default selectedUserRouter;
