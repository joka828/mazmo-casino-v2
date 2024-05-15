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
const port = process.env.PORT || 8081;

const MAZMO_API_URL = "https://prod.mazmoapi.net";

const corsOptions = {
  origin: [
    MAZMO_API_URL,
    "joka.vip",
    "https://joka.vip",
    "http://localhost:3000",
  ],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
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
