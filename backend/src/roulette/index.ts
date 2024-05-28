import {
  getSocket,
  ROULETTE_BET_ADDED,
  ROULETTE_ROUND_CREATED,
  ROULETTE_ROUND_ENDED,
  ROULETTE_ROUND_NO_MORE_BETS,
} from "../helpers/socketManager";
import { BetPlace } from "./types";
import { v4 as uuid } from "uuid";
import { shuffle } from "lodash";
import { getUser } from "../helpers";

let currentRoundId = null;

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

export const placeBet = async (bet: {
  placeId: BetPlace;
  amount: number;
  userId: string;
}) => {
  if (!currentRoundId) {
    await createRound();
  }

  const socket = getSocket();

  const user = await getUser(bet.userId);

  socket.emit(ROULETTE_BET_ADDED, {
    betPlace: bet.placeId,
    amount: bet.amount,
    player: {
      id: bet.userId,
      name: user.displayname,
      color: chipColors[chipColorIndex % chipColors.length],
      avatar: user.avatar["150w"]
        ? user.avatar["150w"].jpeg
        : user.avatar.default,
    },
  });

  chipColorIndex = chipColorIndex + 1;

  console.log("bet placed", bet);
};

export const createRound = async () => {
  currentRoundId = uuid();
  console.log("round created", currentRoundId);
  const socket = getSocket();

  socket.emit(ROULETTE_ROUND_CREATED, { roundId: currentRoundId });

  setTimeout(() => {
    currentRoundId = null;
    socket.emit(ROULETTE_ROUND_NO_MORE_BETS, {
      winnerNumber: Math.floor(Math.random() * 37),
      winners: [],
    });
  }, 10000);
};

export const endRound = async () => {
  const socket = getSocket();

  chipColorIndex = 0;
  chipColors = shuffle(chipColorsList);
  currentRoundId = null;
};
