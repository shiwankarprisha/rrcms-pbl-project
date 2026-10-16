
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    application: "RRCMS API",
    message: "Backend is running successfully",
  });
});

app.listen(PORT, () => {
  console.log(`RRCMS API running at http://localhost:${PORT}`);
});