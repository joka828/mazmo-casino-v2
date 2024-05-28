import { BetPlace, RouletteState, RouletteUser } from "./types";
import { create } from "zustand";

interface Methods {
  setRouletteStatus: (state: RouletteState["status"]) => void;
  addBet: (
    betPlace: BetPlace,
    amount: number,
    user: {
      id: string;
      name: string;
      color: string;
    }
  ) => void;
  startRound: (roundId: string, finishTimestamp: string) => void;
  noMoreBets: (winnerNumber: number, winners: Array<{}>) => void;
  endRound: () => void;
}

const initialBets = {
  red: {},
  black: {},
  green: {},
  even: {},
  odd: {},
  firstHalf: {},
  secondHalf: {},
  firstDozen: {},
  secondDozen: {},
  thirdDozen: {},
  "0": {},
  "1": {},
  "2": {},
  "3": {},
  "4": {},
  "5": {},
  "6": {},
  "7": {},
  "8": {},
  "9": {},
  "10": {},
  "11": {},
  "12": {},
  "13": {},
  "14": {},
  "15": {},
  "16": {},
  "17": {},
  "18": {},
  "19": {},
  "20": {},
  "21": {},
  "22": {},
  "23": {},
  "24": {},
  "25": {},
  "26": {},
  "27": {},
  "28": {},
  "29": {},
  "30": {},
  "31": {},
  "32": {},
  "33": {},
  "34": {},
  "35": {},
  "36": {},
};

export const useRouletteState = create<RouletteState & Methods>((set) => {
  return {
    status: "inactive",
    users: {},
    bets: initialBets,
    finishTimestamp: undefined,
    currentRoundId: undefined,
    winnerNumber: undefined,
    startRound: (roundId: string, finishTimestamp: string) =>
      set({ status: "openBets", finishTimestamp, currentRoundId: roundId }),
    noMoreBets: (winnerNumber: number, winners: Array<{}>) =>
      set({ status: "spinning", winnerNumber }),
    endRound: () => set({ status: "inactive", users: {}, bets: initialBets }),
    setRouletteStatus: (status: RouletteState["status"]) => set({ status }),
    addBet: (
      betPlace: BetPlace,
      amount: number,
      user: { id: string; color: string; name: string }
    ) =>
      set((state) => {
        let newUser = undefined;
        if (state.users[user.id] === undefined) {
          newUser = user;
        }

        const newAmount = state.bets[betPlace][user.id]
          ? state.bets[betPlace][user.id] + amount
          : amount;

        return {
          bets: {
            ...state.bets,
            [betPlace]: { ...state.bets[betPlace], [user.id]: newAmount },
          },
          status: "openBets",
          users: newUser ? { ...state.users, [user.id]: newUser } : state.users,
        };
      }),
  };
});
