const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Users ko JSON file me save karenge
const USERS_FILE = "./users.json";

// Helper: users read karna
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, "utf8");
  return data ? JSON.parse(data) : [];
};

// Helper: users write karna
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Register API
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const users = readUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ message: "User already exists" });

  // Encrypt password
  const encryptedPassword = CryptoJS.AES.encrypt(password, "secret-key").toString();

  const newUser = { username, email, password: encryptedPassword };
  users.push(newUser);

  writeUsers(users);

  res.json({ message: "User registered successfully" });
});

// Login API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  // Decrypt password
  const decryptedPassword = CryptoJS.AES.decrypt(user.password, "secret-key").toString(CryptoJS.enc.Utf8);

  if (decryptedPassword !== password)
    return res.status(400).json({ message: "Wrong password" });

  res.json({ message: "Login successful", user: { username: user.username, email: user.email } });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
