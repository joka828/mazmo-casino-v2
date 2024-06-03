import {
  getSocket,
  ROULETTE_BET_ADDED,
  ROULETTE_ROUND_CREATED,
  ROULETTE_ROUND_ENDED,
} from "../helpers/socketManager";
import { BetPlace, RouletteRound, RouletteState, RouletteUser } from "./types";
import { v4 as uuid } from "uuid";
import { shuffle } from "lodash";
import { getUser, getUsers, transferToUser } from "../helpers";
import { getDatabaseCollection } from "../helpers/dbManager";
import { betPlacesInfo, numberColors } from "./constants";
import { sendMessageToGameChannel } from "../helpers/channelMessages";

const ROUND_TIME = process.env.NODE_ENV === "development" ? 5000 : 40000;

const chipColorsList = [
  "#000000",
  "#072475",
  "#13563B",
  "#A46928",
  "#E4A700",
  "#C70000",
  "#7B1414",
];

let chipColors = shuffle(chipColorsList);
let chipColorIndex = 0;

const getCurrentRound = async () => {
  const collection = await getDatabaseCollection("roulette");

  const currentRound = await collection.findOne<RouletteRound>({
    status: { $ne: "finished" },
  });

  return currentRound;
};

const getRound = async (roundId: string) => {
  const collection = await getDatabaseCollection("roulette");

  const currentRound = await collection.findOne<RouletteRound>({
    id: roundId,
  });

  return currentRound;
};

const getHistory = async () => {
  const collection = await getDatabaseCollection("roulette");

  const history = await collection
    .find<RouletteRound>({ status: "finished" })
    .sort({ finishTimestamp: -1 })
    .limit(10)
    .toArray();

  return history.map((round) => round.winnerNumber);
};

export const initializeRoulette = async () => {
  const currentRound = await getCurrentRound();

  if (!currentRound) return;

  console.log(
    "Initializing with a started round",
    currentRound.finishTimestamp - Date.now()
  );
  setTimeout(() => {
    const winnerNumber =
      process.env.NODE_ENV === "development"
        ? 2
        : Math.floor(Math.random() * 37);

    endRound(winnerNumber, currentRound.id);
  }, currentRound.finishTimestamp - Date.now());
};

export const placeBet = async (bet: {
  placeId: BetPlace;
  amount: number;
  userId: string;
  roundId?: string;
}) => {
  let currentRound;
  let currentRoundId;

  if (bet.roundId) {
    currentRoundId = bet.roundId;
    currentRound = await getRound(bet.roundId);
  }

  if (currentRoundId && currentRound?.status === "finished") {
    await transferToUser(bet.userId, bet.amount);
    sendMessageToGameChannel({
      gameId: "roulette",
      message: `La ronda ya terminó, tus ${bet.amount.toFixed(
        2
      )} sades han sido devueltos.`,
      to: parseInt(bet.userId),
    });

    return;
  }

  const mazmoUser = await getUser(bet.userId);

  const user = {
    id: mazmoUser.id,
    name: mazmoUser.displayname,
    color: chipColors[chipColorIndex % chipColors.length],
    avatar: mazmoUser.avatar["150w"]
      ? mazmoUser.avatar["150w"].jpeg
      : mazmoUser.avatar.default,
  };

  if (!currentRoundId) {
    await createRound({
      initialUsers: { [user.id]: user },
      initialBets: { [bet.placeId]: { [user.id]: bet.amount } },
    });
  } else {
    const collection = await getDatabaseCollection("roulette");

    const currentBetAmount = currentRound.bets?.[bet.placeId]?.[user.id] ?? 0;
    const amount = bet.amount + currentBetAmount;

    const setQuery: Record<string, any> = {
      [`bets.${bet.placeId}.${user.id}`]: amount,
    };

    if (!currentRound.users[user.id]) {
      setQuery[`users.${user.id}`] = user;
    }

    await collection.updateOne(
      { id: currentRoundId },
      {
        $set: {
          [`bets.${bet.placeId}.${user.id}`]: amount,
          [`users.${user.id}`]: user,
        },
      }
    );
  }

  const socket = getSocket();

  socket.emit(ROULETTE_BET_ADDED, {
    betPlace: bet.placeId,
    amount: bet.amount,
    user,
  });

  chipColorIndex = chipColorIndex + 1;
};

export const createRound = async ({
  initialBets,
  initialUsers,
}: {
  initialUsers?: Record<string, RouletteUser>;
  initialBets?: Partial<RouletteState["bets"]>;
}) => {
  const currentRoundId = uuid();

  const finishTimestamp = Date.now() + ROUND_TIME;

  const collection = await getDatabaseCollection("roulette");
  await collection.insertOne({
    id: currentRoundId,
    finishTimestamp,
    status: "openBets",
    bets: initialBets ?? {},
    users: initialUsers ?? {},
  });

  const socket = getSocket();
  socket.emit(ROULETTE_ROUND_CREATED, {
    roundId: currentRoundId,
    finishTimestamp,
  });

  setTimeout(() => {
    const winnerNumber =
      process.env.NODE_ENV === "development"
        ? 2
        : Math.floor(Math.random() * 37);

    endRound(winnerNumber, currentRoundId);
  }, ROUND_TIME);
};

const getWinnerPlaces = (winnerNumber: number) => {
  const winners = [String(winnerNumber)];

  if (winnerNumber !== 0) {
    winners.push(numberColors[winnerNumber]);
    winners.push(winnerNumber % 2 === 0 ? "even" : "odd");
    winners.push(winnerNumber < 19 ? "firstHalf" : "secondHalf");

    if (winnerNumber < 13) winners.push("firstDozen");
    if (winnerNumber > 12 && winnerNumber < 25) winners.push("secondDozen");
    if (winnerNumber > 24) winners.push("thirdDozen");
  }
  return winners;
};

const getResults = (
  winnerNumber: number,
  placedBets: RouletteRound["bets"]
) => {
  const winnerPlaces = getWinnerPlaces(winnerNumber);
  const winners = {};
  const placeIds = Object.keys(placedBets);

  placeIds.forEach((placeId) => {
    const usersBets = Object.keys(placedBets[placeId]);
    usersBets.forEach((userId) => {
      if (!winners[userId]) {
        winners[userId] = 0;
      }
      if (winnerPlaces.includes(placeId)) {
        winners[userId] +=
          placedBets[placeId][userId] * betPlacesInfo[placeId].multiplier;
      }
    });
  });

  return winners;
};

export const endRound = async (winnerNumber: number, roundId: string) => {
  const collection = await getDatabaseCollection("roulette");
  const socket = getSocket();

  const currentRound = await getRound(roundId);
  const currentBets = currentRound.bets;
  const results = getResults(winnerNumber, currentBets);

  await collection.updateOne(
    { status: { $ne: "finished" } },
    {
      $set: {
        status: "finished",
        winnerNumber,
        winners: results,
      },
    }
  );
  socket.emit(ROULETTE_ROUND_ENDED, {
    winnerNumber,
    winners: results,
  });

  setTimeout(async () => {
    const lines = [];

    const winnerIds = Object.keys(results).filter((id) => results[id] > 0);
    const winnerUsers = await getUsers(winnerIds);

    winnerIds.forEach(async (userId) => {
      const amount = results[userId];
      lines.push(
        `@${winnerUsers[userId].username} llevándose ${results[userId].toFixed(
          2
        )}§`
      );

      // JS rounding 🤷🏻‍♂️
      transferToUser(userId, amount);
      //   await sendMessageToGameChannel({
      //     gameId: "roulette",
      //     message: `El ganador es el **${winnerNumber}**! \n\n🤑 Ganaste ${amount.toFixed(
      //       2
      //     )} sades en la ruleta! 🤑`,
      //     to: parseInt(userId),
      //   });
      // } else {
      //   await sendMessageToGameChannel({
      //     gameId: "roulette",
      //     message: `El ganador es el **${winnerNumber}**! \n\nPerdiste :(`,
      //     to: parseInt(userId),
      //   });
      // }
    });

    console.log("===================== WINNERS =====================");
    console.log(winnerIds, lines);
    console.log("===================== WINNERS =====================");
    const winnersText = lines.length ? lines.join(`\n`) : `La casa :moneybag:`;

    await sendMessageToGameChannel({
      gameId: "roulette",
      message: `El ganador es el **${winnerNumber}**! \n\n Los ganadores son: \n ${winnersText}\n\n¡¡Felicidades!! :money_mouth_face::money_mouth_face:`,
    });
  }, 8000);

  chipColorIndex = 0;
  chipColors = shuffle(chipColorsList);
};

export const getRouletteStatus: () => Promise<
  RouletteRound | { status: "inactive" }
> = async () => {
  const currentRound = await getCurrentRound();
  const history = await getHistory();

  if (!currentRound) return { status: "inactive", history };

  return { ...currentRound, history };
};
