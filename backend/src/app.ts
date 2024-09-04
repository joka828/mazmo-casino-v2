import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import { connectToDb, getIsDatabaseConnected } from "./helpers/dbManager";

import {
  BINGO_ID,
  CASINO_ADMIN_IDS,
  CASINO_ID,
  CASINO_PROD_CHANNEL_ID,
  MANAGEMENT_ID,
  MAZMO_API_URL,
  ROULETTE_ID,
} from "./helpers/constants";
import { getCasinoBalance, getUserByTag, transferToUser } from "./helpers";
import {
  printNonCasinoWelcome,
  printCasinoHelp,
  setChannelCredentials,
  sendMessageToGameChannel,
} from "./helpers/channelMessages";
import { initializeSocket } from "./helpers/socketManager";
import { getRouletteStatus, initializeRoulette, placeBet } from "./roulette";
import managementRouter, { getCasinoStatus } from "./management";
import { authMiddleware, AuthRequest } from "./helpers/jwtAuth";
import { addBingoPlayer, createNextRound, declareBingo, getBingoStatus, startBingoRound } from "./bingo";

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
  const bingoStatus = await getBingoStatus();

  socket.emit("initialize", {
    roulette: rouletteStatus,
    bingo: bingoStatus,
  });
});

initializeRoulette();

app.get("/health", (req, res) => {
  res.status(200);
  res.send("OK");
});

app.get("/mongodb-health", async (req, res) => {
  if (await getIsDatabaseConnected()) {
    res.status(200);
    res.send("OK");
  } else {
    res.status(502);
    res.send("ERROR");
  }
});

app.get("/casino-auth", authMiddleware, async (req: AuthRequest, res) => {
  const casinoStatusData = await getCasinoStatus();
  res.status(200);
  res.send({ ...req.claims, status: casinoStatusData?.status ?? "active" });
});

// DO NOT COMMIT THIS ENDPOINT
app.get("/bingo-start", authMiddleware, async (req: AuthRequest, res) => {
  if (req.claims.id !== 91644) {
    return res.status(403).send("Forbidden");
  }

  startBingoRound();

  res.status(200);
  res.send("OK");
});

app.get("/bingo-create", authMiddleware, async (req: AuthRequest, res) => {
  if (req.claims.id !== 91644) {
    return res.status(403).send("Forbidden");
  }

  createNextRound();

  res.status(200);
  res.send("OK");
});

app.post("/message", async (req, res) => {
  if (req.headers["bot-secret"] !== process.env.MAZMO_BOT_SECRET)
    return res.status(401).send("UNAUTHORIZED");

  const messageContent: string = req.body.message.payload.rawContent;
  if (!messageContent) return res.status(204).send("Nothing to do");
  let parts = messageContent.toLowerCase().split(" ");

  const channelKey = req.body.key;
  const channelId = req.body.message.channel.id;
  const authorId = req.body.message.author.id;
  const isAdmin = CASINO_ADMIN_IDS.includes(authorId);

  parts = parts.filter((part) => part !== "/dev" && part !== "/test");

  if (parts.length === 1 && (parts[0] === "bingo" || parts[0] === "bingo!")) {
    declareBingo(authorId);
  }

  if (isAdmin) {
    if (parts[0] === "/casino") {
      if (parts[1] === "test" && parts[2] === "notice") {
        await sendMessageToGameChannel({
          message: "If you can see this, something is wrong with notices",
          gameId: MANAGEMENT_ID,
          to: authorId,
        });
      }

      if (parts[1] === "cargar") {
        sendMessageToGameChannel({
          message: `Dame sades`,
          gameId: MANAGEMENT_ID,
          sadesAsk: {
            amount: 10,
            fixed: false,
          },
        });
      }

      if (parts[1] === "retirar" && authorId === 91644) {
        try {
          const amount = parseFloat(parts[2]);
          await transferToUser(authorId, amount);
          await sendMessageToGameChannel({
            message: `Retiro exitoso de ${amount} sades`,
            gameId: MANAGEMENT_ID,
            to: authorId,
          });
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.log(e.message);
          }
          await sendMessageToGameChannel({
            message: `Error retirando: ${e.message}`,
            gameId: MANAGEMENT_ID,
            to: authorId,
          });
        }
      }
      if (parts[1] === "transfer") {
        try {
          const userTag = parts[2];
          const user = await getUserByTag(userTag.replace("@", ""));

          const amount = parseFloat(parts[3]);
          await transferToUser(user.id, amount);
          await sendMessageToGameChannel({
            message: `Transfer succesfull`,
            gameId: MANAGEMENT_ID,
          });
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.log(e);
          }
          await sendMessageToGameChannel({
            message: `Error transferring: ${e.message}`,
            gameId: MANAGEMENT_ID,
          });
        }
      }
      if (parts[1] === "set" && parts[2] === "credentials") {
        console.log("SETTING CREDENTIALS");
        if (parts[3] === "management") {
          await setChannelCredentials({
            gameId: MANAGEMENT_ID,
            id: channelId,
            key: channelKey,
          });

          await sendMessageToGameChannel({
            message: "Management credentials set",
            gameId: MANAGEMENT_ID,
            to: authorId,
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

          await setChannelCredentials({
            gameId: BINGO_ID,
            id: channelId,
            key: channelKey,
          });

          await sendMessageToGameChannel({
            message: "Credentials set",
            gameId: ROULETTE_ID,
            to: authorId,
          });
        }
      }

      if (parts[1] === "balance") {
        try {
          const balance = await getCasinoBalance();
          await sendMessageToGameChannel({
            message: `Balance: ${balance}`,
            gameId: MANAGEMENT_ID,
            to: authorId,
          });
        } catch (e) {
          await sendMessageToGameChannel({
            message: `Error getting balance`,
            gameId: MANAGEMENT_ID,
            to: authorId,
          });
        }
      }

      if (parts[1] === "bingo") {
        if (parts[2] === "create") {
          createNextRound();
        }
        
        if (parts[2] === "start") {
          
        }
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

  if (req.body.message.channel.id === CASINO_PROD_CHANNEL_ID) {
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

    if (transaction.data.gameId === BINGO_ID) {
      if (transaction.data.type === "cardBuy") {
        await addBingoPlayer(transaction.from.owner.id);
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

app.use("/management", managementRouter);

httpServer.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

