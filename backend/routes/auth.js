import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readUsers, writeUsers } from "../utils/db.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function publicUser(user) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

/* POST /api/auth/signup */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const users = readUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    return res.status(201).json({
      message: "Account created successfully",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

/* POST /api/auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      message: "Logged in successfully",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

/* GET /api/auth/me - verify token and return current user */
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

export default router;
