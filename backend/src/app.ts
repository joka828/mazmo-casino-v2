import express from "express";
import cors from "cors";

import {
  connectToDb,
  getDatabaseClient,
  getIsDatabaseConnected,
} from "./databaseConnection";

connectToDb();

const mongodbClient = getDatabaseClient();

const app = express();
const port = process.env.PORT ?? 8081;

const MAZMO_API_URL = "https://prod.mazmoapi.net";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

console.log("=============== CORS ===============");
console.log("FRONTEND_URL:", FRONTEND_URL);
console.log("MAZMO_API_URL:", MAZMO_API_URL);
console.log("=============== CORS ===============");

const corsOptions = {
  origin: [MAZMO_API_URL, FRONTEND_URL],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send(
    `Hello World! ${process.env.FRONTEND_URL ?? "Error reading FRONTEND_URL"}`
  );
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/mongodb-health", async (req, res) => {
  if (await getIsDatabaseConnected()) {
    res.send("OK");
  } else {
    res.status(502);
    res.send("ERROR");
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
