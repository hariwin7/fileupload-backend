const router = require("express").Router();
const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  let userObj = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    userObj.password = await bcrypt.hash(userObj.password, salt);
    const user = await db.User.create(userObj);
    res.status(200).send({ message: "created user" });
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

router.post("/signin", async (req, res) => {
  const signIn = req.body;
  try {
    const user = await db.User.findOne({ where: { email: signIn.email } });
    if (user) {
      if (await bcrypt.compare(signIn.password, user.password)) {
        //create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "24h",
        });
        let tempUser = { ...user.dataValues, password: null };
        res.status(200).send({ token, message: "logged in", user: tempUser });
      } else
        res
          .status(400)
          .send({ error: [{ message: "Password wrong", path: "password" }] });
    } else
      res
        .status(400)
        .send({ error: [{ message: "User does not exist", path: "email" }] });
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

module.exports = router;
