import express from "express";
import cors from "cors";

import {
  connectToDb,
  getDatabaseClient,
  getIsDatabaseConnected,
} from "./databaseConnection";

import { MAZMO_API_URL, ROULETTE_ID } from "./helpers/constants";
import { getCasinoBalance } from "./helpers";
import { printNonCasinoWelcome, printCasinoHelp } from "./helpers/sendMessages";

connectToDb();

const mongodbClient = getDatabaseClient();

const app = express();
const port = process.env.PORT ?? 8081;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

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

app.post("/joined", (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  console.log("============= JOINED =============");
  console.log(req.body);
  console.log("============= JOINED =============");

  const channelCredentials = {
    id: req.body.message.channel.id,
    key: req.body.key,
  };

  if (req.body.message.channel.id === process.env.MAZMO_CASINO_ID) {
    printCasinoHelp(req.body.message.author.id, channelCredentials);
  } else {
    printNonCasinoWelcome(req.body.message.author.id, channelCredentials);
  }
});

app.post("/bets", async (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  const { transaction } = req.body || {};

  console.log("================== BET ==================");
  console.log(req.body);
  console.log("================== BET ==================");

  if (transaction?.data) {
    if (transaction.data.gameId === ROULETTE_ID) {
      if (typeof transaction.data.placeId === "string") {
        // await addBet(
        //   transaction.from.owner.id,
        //   transaction.amount,
        //   transaction.data.placeId
        // );
      }
    }

    // if (transaction.data.gameId === BLACKJACK_ID) {
    //   if (transaction.data.type === "inscription") {
    //     signToPlay(transaction.from.owner.id, transaction.amount);
    //   }

    //   if (transaction.data.type === "doubleDown") {
    //     doubleDown(
    //       transaction.from.owner.id,
    //       transaction.amount,
    //       transaction.data.roundId
    //     );
    //   }
    // }

    // if (transaction.data.gameId === SPANK_YOUR_SUB_ID) {
    //   if (transaction.data.type === "start") {
    //     createAndEmitHash(
    //       transaction.data.socketId,
    //       transaction.from.owner.id,
    //       transaction.amount
    //     );
    //   }
    // }

    // if (
    //   transaction.data.gameId === MULTICHANNEL_LOTTERY_ID &&
    //   transaction.data.channelId
    // ) {
    //   const lotteryApp = getAppInstance(
    //     MULTICHANNEL_LOTTERY_ID,
    //     transaction.data.channelId
    //   );
    //   if (transaction.data.type === "start") {
    //     lotteryApp.processPayment(
    //       transaction.amount,
    //       transaction.data,
    //       transaction.from.owner.id
    //     );
    //   }

    //   if (transaction.data.type === "doubleChances") {
    //     lotteryApp.doubleChances(transaction.from.owner.id, transaction.amount);
    //   }
    // }
  }
  return res.status(200).send("OK");
});

app.get("/bot-balance", async (req, res) => {
  const balance = await getCasinoBalance();
  console.log("============= balance =============");
  console.log(balance);
  console.log("============= balance =============");

  res.send("OK");
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
