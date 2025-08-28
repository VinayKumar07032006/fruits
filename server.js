const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/storedb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  age: Number,
  email: String,
  password: String
});

const purchaseSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String
});

const User = mongoose.model("User", userSchema);
const Purchase = mongoose.model("Purchase", purchaseSchema);

// ---------------- Routes ---------------- //

// Homepage
app.get("/", (req, res) => {
  res.render("title"); // login page
  
});

// Login Page
app.get("/login", (req, res) => {
  res.render("title");
});

// Handle Login
app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  let isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send("Invalid credentials");

  // Generate token (optional)
  let token = jwt.sign({ id: user._id }, "secretKey");
  res.cookie("token", token, { httpOnly: true });

  res.redirect("/home");
});

// Register Page
app.get("/register", (req, res) => {
  res.render("create"); // create.ejs
});

// Handle Register
app.post("/register", async (req, res) => {
  let { name, username, age, email, passward } = req.body; // note: in create.ejs you used passward not password

  let user = await User.findOne({ email });
  if (user) return res.status(400).send("User already exists");

  const hash = await bcrypt.hash(passward, 10);

  let newUser = await User.create({
    name,
    username,
    age,
    email,
    password: hash,
  });

  res.status(201).send("✅ User registered successfully");
});

// Store Home Page
app.get("/home", (req, res) => {
  res.render("index"); // index.ejs
});

// Purchase Page
app.get("/perchase", (req, res) => {
  res.render("perchase");
});

app.post("/perchase", async (req, res) => {
  let { name, email, phone, address } = req.body;

  let newOrder = await Purchase.create({
    name,
    email,
    phone,
    address
  });

  res.render("placed");
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
