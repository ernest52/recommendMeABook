import db from "../pgConnection/db.js";
const saltRounds = 10;
const registerNewUser = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE username=$1 ", [
      username,
    ]);
    if (rows.length) {
      req.session.error = "Such user already exists try to log in";
      res.redirect("/user/logIn");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) console.log("error with hashing: ", err);
        else {
          const { rows } = await db.query(
            "INSERT INTO users (username,email,password) VALUES($1,$2,$3) RETURNING*",
            [username, email, hash]
          );
          const user = rows[0];
          console.log("created user: ", user);
          req.login(user, (err) => {
            if (err) console.log("occured errror with log in: ", err);
            res.redirect("/");
          });
        }
      });
    }
  } catch (err) {
    req.session.error = err?.message || "register process failed";
    res.redirect("/");
  }
};

export { registerNewUser };
