import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { connectToDb, getIsDatabaseConnected } from "./helpers/dbManager";

import {
  CASINO_ID,
  MANAGEMENT_ID,
  MAZMO_API_URL,
  ROULETTE_ID,
} from "./helpers/constants";
import { getCasinoBalance } from "./helpers";
import {
  printNonCasinoWelcome,
  printCasinoHelp,
  setChannelCredentials,
  sendMessageToGameChannel,
} from "./helpers/channelMessages";
import { initializeSocket } from "./helpers/socketManager";
import { getRouletteStatus, placeBet } from "./roulette";

connectToDb();

const app = express();
const port = process.env.PORT ?? 8081;

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

const corsOptions = {
  origin: [MAZMO_API_URL, FRONTEND_URL, "http://localhost:3000"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:3000"],
  },
});

initializeSocket(io);

io.on("connect", async (socket) => {
  const rouletteStatus = await getRouletteStatus();
  socket.emit("initialize", {
    roulette: rouletteStatus,
  });
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

app.post("/message", async (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  const messageContent: string = req.body.message.payload.rawContent;
  if (!messageContent) return res.status(204).send("Nothing to do");
  const parts = messageContent.toLowerCase().split(" ");

  const channelKey = req.body.key;
  const channelId = req.body.message.channel.id;
  const userId = req.body.message.author.id;
  const isAdmin = userId === 91644;

  if (isAdmin) {
    if (parts[0] === "/casino") {
      if (parts[1] === "set" && parts[2] === "credentials") {
        if (parts[3] === "management") {
          await setChannelCredentials({
            gameId: MANAGEMENT_ID,
            id: channelId,
            key: channelKey,
          });

          await sendMessageToGameChannel({
            message: "Credentials set",
            gameId: MANAGEMENT_ID,
            to: userId,
          });
        } else {
          await setChannelCredentials({
            gameId: ROULETTE_ID,
            id: channelId,
            key: channelKey,
          });

          await setChannelCredentials({
            gameId: CASINO_ID,
            id: channelId,
            key: channelKey,
          });

          await sendMessageToGameChannel({
            message: "Credentials set",
            gameId: ROULETTE_ID,
            to: userId,
          });
        }
      }

      if (parts[1] === "balance") {
        const balance = await getCasinoBalance();
        await sendMessageToGameChannel({
          message: `Balance: ${balance}`,
          gameId: MANAGEMENT_ID,
          to: userId,
        });
      }
    }
  }

  return res.status(200).send("OK");
});

app.post("/joined", (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  const channelCredentials = {
    id: req.body.message.channel.id,
    key: req.body.key,
  };

  if (req.body.message.channel.id === process.env.MAZMO_CASINO_ID) {
    printCasinoHelp(req.body.message.author.id, channelCredentials);
  } else {
    printNonCasinoWelcome(req.body.message.author.id, channelCredentials);
  }

  return res.status(200).send("OK");
});

app.post("/bets", async (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  const { transaction } = req.body || {};

  if (transaction?.data) {
    if (transaction.data.gameId === ROULETTE_ID) {
      if (typeof transaction.data.placeId === "string") {
        await placeBet({
          userId: transaction.from.owner.id,
          amount: transaction.amount,
          placeId: transaction.data.placeId,
          roundId: transaction.data.roundId,
        });
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

httpServer.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
