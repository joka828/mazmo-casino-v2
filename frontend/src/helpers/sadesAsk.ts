import { betPlacesInfo } from "./constants";
import { BetPlace } from "../api/roulette/types";

// const to =
//   process.env.NODE_ENV === "production"
//     ? { id: "605e44f6aa16af00183f9fce", type: "BOT" }
//     : { id: "60719b985095e800113dc707", type: "BOT" };

const to = { type: "BOT", id: process.env.NEXT_PUBLIC_MAZMO_BOT_ID };

const postMessage = (message: unknown) => {
  window.parent.postMessage(message, "*");
};

const askForSades = {
  blackJackAskToSit: () => {
    const message = JSON.stringify({
      to,
      fixed: false,
      amount: process.env.NODE_ENV === "production" ? 10 : 0.1,
      max: 20,
      transferData: { gameId: "blackjack", type: "inscription" },
    });
    postMessage(message);
  },
  blackJackDoubleDown: (amount: number) => {
    const message = JSON.stringify({
      to,
      fixed: true,
      amount,
      transferData: { gameId: "blackjack", type: "doubleDown" },
    });
    postMessage(message);
  },
  rouletteBet: (placeId: BetPlace, roundId?: string) => {
    const placeMultiplier = betPlacesInfo[placeId].multiplier;
    const max = 90 / placeMultiplier;
    const message = JSON.stringify({
      to,
      amount: process.env.NODE_ENV === "production" ? 2 : 0.01,
      max,
      fixed: false,
      transferData: { gameId: "roulette", type: "bet", placeId, roundId },
    });
    postMessage(message);
  },
  spankYourSubStart: (socketId: string) => {
    const message = JSON.stringify({
      to,
      amount: process.env.NODE_ENV === "production" ? 0.5 : 0.05,
      fixed: true,
      transferData: { gameId: "spankYourSub", type: "start", socketId },
    });
    postMessage(message);
  },
  lotteryDoubleChances: (channelId: string) => {
    const message = JSON.stringify({
      to,
      amount: process.env.NODE_ENV === "production" ? 1 : 0.01,
      fixed: true,
      transferData: {
        gameId: "multiChannelLottery",
        type: "doubleChances",
        channelId,
      },
    });
    postMessage(message);
  },
  bingoCardBuy: () => {
    const message = JSON.stringify({
      to,
      amount: process.env.NODE_ENV === "production" ? 5 : 0.02,
      fixed: true,
      transferData: { gameId: "bingo", type: "cardBuy" },
    });
    postMessage(message);
  }
};

export default askForSades;
