const router = require("express").Router();
const db = require("../models");
const auth = require("./verifyToken");
const fs = require("fs");
router.get("/get_user", auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user._id);
    if (user) {
      let tempUser = { ...user.dataValues, password: null };
      console.log(tempUser);
      res.status(200).send({ user: tempUser });
    } else {
      res.status(201).send({ error: "User does not exist" });
    }
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

router.post("/update_user", auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user._id);
    if (user) {
      user.firstName = req.body.firstName;
      user.email = req.body.email;
      user.phone = req.body.phone;
      user.save();
      let tempUser = { ...user.dataValues, password: null };
      res.status(200).send({ user: tempUser });
    } else {
      res.status(201).send({ error: "User does not exist" });
    }
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

router.post("/uploadfile", auth, async (req, res) => {
  try {
    if (req.files === null) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const file = req.files.file;
    let fileobj = {
      fileName: file.name,
      location: `/uploads/${req.user._id}/${file.name}`,
      creator: req.user._id,
    };

    db.Files.create(fileobj);

    const dir = `${__dirname}/uploads/${req.user._id}/`;
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    } catch (err) {
      console.error(err);
    }
    file.mv(`${__dirname}/uploads/${req.user._id}/${file.name}`, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      res.json({
        fileName: file.name,
        filePath: `/uploads/${req.user._id}/${file.name}`,
      });
    });
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

router.get("/getfiles", auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user._id);
    let files = null;
    if (user.userType === 1) {
      files = await db.Files.findAll({ include: db.User });
    } else {
      files = await db.Files.findAll({
        where: { creator: req.user._id },
        include: db.User,
      });
    }
    res.status(200).send({ files: files });
  } catch (e) {
    res.status(400).send({ error: e.errors });
  }
});

router.post("/fetch-pdf", auth, async (req, res) => {
  const file = await db.Files.findByPk(req.body.id);
  if (file)
    res.sendFile(`${__dirname}/uploads/${req.user._id}/${file.fileName}`);
  else res.status(400).send({ error: "cannot get file" });
});

module.exports = router;
