import { BetPlace, RouletteRound, RouletteState, RouletteUser } from "./types";
import { create } from "zustand";

interface Methods {
  initializeData: (
    initialData: RouletteRound & { history: RouletteState["history"] }
  ) => void;
  setRouletteStatus: (state: RouletteState["status"]) => void;
  addBet: (betPlace: BetPlace, amount: number, user: RouletteUser) => void;
  startRound: (roundId: string, finishTimestamp: number) => void;
  noMoreBets: (winnerNumber: number, winners: RouletteState["winners"]) => void;
  startSpinning: () => void;
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
    winners: {},
    history: [],
    initializeData: (
      initialData: RouletteRound & { history: RouletteState["history"] }
    ) => {
      if (initialData.id) {
        set({
          status: initialData.status,
          finishTimestamp: initialData.finishTimestamp,
          currentRoundId: initialData.id,
          bets: {
            ...initialBets,
            ...initialData.bets,
          },
          users: {
            ...initialData.users,
          },
          history: initialData.history,
        });
      } else {
        set({ status: initialData.status, history: initialData.history });
      }
    },
    startRound: (roundId: string, finishTimestamp: number) =>
      set({ status: "openBets", finishTimestamp, currentRoundId: roundId }),
    noMoreBets: (winnerNumber: number, winners: RouletteState["winners"]) => {
      setTimeout(() => {
        set({ status: "spinning" });
      }, 2500);

      setTimeout(() => {
        set((state) => {
          const newHistory = [
            winnerNumber,
            ...state.history.slice(0, state.history.length - 1),
          ];

          return {
            currentRoundId: undefined,
            status: "finished",
            users: {},
            bets: initialBets,
            history: newHistory,
          };
        });
      }, 2500 + 10000 + 2000);

      return set((state) => {
        return {
          status: "spinning",
          winnerNumber,
          winners,
        };
      });
    },
    startSpinning: () => set({ status: "spinning" }),
    endRound: () =>
      set({
        currentRoundId: undefined,
        status: "finished",
        users: {},
        bets: initialBets,
      }),
    setRouletteStatus: (status: RouletteState["status"]) => set({ status }),
    addBet: (betPlace: BetPlace, amount: number, user: RouletteUser) =>
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
