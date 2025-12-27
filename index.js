// index.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = 5000;

// ===== CORS =====
app.use(cors({
  origin: "http://localhost:5173", // React frontend
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// ===== Body parser =====
app.use(express.json());

// ===== Users file =====
const USERS_FILE = "./users.json";
const readUsers = () =>
  fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, "utf8")) : [];
const writeUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// ===== Register =====
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const users = readUsers();
  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const encryptedPassword = CryptoJS.AES.encrypt(password, "secret-key").toString();
  users.push({ username, email, password: encryptedPassword });
  writeUsers(users);

  res.json({ message: "User registered successfully" });
});

// ===== Login =====
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const decryptedPassword = CryptoJS.AES.decrypt(user.password, "secret-key").toString(CryptoJS.enc.Utf8);
  if (decryptedPassword !== password)
    return res.status(400).json({ message: "Wrong password" });

  res.json({ message: "Login successful", user: { username: user.username, email: user.email } });
});

// ===== Start server =====
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
