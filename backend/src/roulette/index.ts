import {
  getSocket,
  ROULETTE_BET_ADDED,
  ROULETTE_ROUND_CREATED,
  ROULETTE_ROUND_ENDED,
} from "../helpers/socketManager";
import { BetPlace, RouletteRound, RouletteState, RouletteUser } from "./types";
import { v4 as uuid } from "uuid";
import { shuffle } from "lodash";
import { delay, getUser } from "../helpers";
import { getDatabaseClient, getDatabaseCollection } from "../helpers/dbManager";
import { betPlacesInfo, numberColors } from "./constants";

const ROUND_TIME = 20000;

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

export const placeBet = async (bet: {
  placeId: BetPlace;
  amount: number;
  userId: string;
}) => {
  const mazmoUser = await getUser(bet.userId);

  const user = {
    id: mazmoUser.id,
    name: mazmoUser.displayname,
    color: chipColors[chipColorIndex % chipColors.length],
    avatar: mazmoUser.avatar["150w"]
      ? mazmoUser.avatar["150w"].jpeg
      : mazmoUser.avatar.default,
  };

  const currentRound = await getCurrentRound();
  const currentRoundId = currentRound?.id;

  const testTimestamp = Date.now();

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

  const finishDateTimestamp = Date.now() + ROUND_TIME;

  const collection = await getDatabaseCollection("roulette");
  await collection.insertOne({
    id: currentRoundId,
    finishDateTimestamp,
    status: "openBets",
    bets: initialBets ?? {},
    users: initialUsers ?? {},
  });

  const socket = getSocket();
  socket.emit(ROULETTE_ROUND_CREATED, {
    roundId: currentRoundId,
    finishDateTimestamp,
  });

  // const winnerNumber = Math.floor(Math.random() * 37);
  const winnerNumber = 2;

  setTimeout(() => {
    endRound(winnerNumber);
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

const getWinners = (
  winnerNumber: number,
  placedBets: RouletteRound["bets"]
) => {
  const winnerPlaces = getWinnerPlaces(winnerNumber);
  const winners = {};
  const placeIds = Object.keys(placedBets);

  placeIds.forEach((placeId) => {
    const usersBets = Object.keys(placedBets[placeId]);
    usersBets.forEach((userId) => {
      if (winnerPlaces.includes(placeId)) {
        if (!winners[userId]) {
          winners[userId] = 0;
        }

        winners[userId] +=
          placedBets[placeId][userId] * betPlacesInfo[placeId].multiplier;
      }
    });
  });

  return winners;
};

export const endRound = async (winnerNumber: number) => {
  const collection = await getDatabaseCollection("roulette");
  const socket = getSocket();

  const currentRound = await getCurrentRound();
  const currentBets = currentRound.bets;
  const winners = getWinners(winnerNumber, currentBets);

  await collection.updateOne(
    { status: { $ne: "finished" } },
    {
      $set: {
        status: "finished",
        winnerNumber,
        winners,
      },
    }
  );
  socket.emit(ROULETTE_ROUND_ENDED, {
    winnerNumber,
    winners,
  });

  chipColorIndex = 0;
  chipColors = shuffle(chipColorsList);
};

export const getRouletteStatus: () => Promise<
  RouletteRound | { status: "inactive" }
> = async () => {
  const currentRound = await getCurrentRound();

  if (!currentRound) return { status: "inactive" };

  return currentRound;
};
