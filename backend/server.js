import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ecomm-backend" });
});

/* Auth routes */
app.use("/api/auth", authRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`ecomm-backend running on http://localhost:${PORT}`);
});
