const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
app.use(fileUpload());
var cors = require("cors");
dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//import routes
const authRoute = require("./routes/auth");
const user = require("./routes/user");

//route middleware
app.use("/api/user", authRoute);
app.use("/api", user);

app.listen(process.env.PORT, () =>
  console.log(`Server Started at ${process.env.PORT}`)
);
