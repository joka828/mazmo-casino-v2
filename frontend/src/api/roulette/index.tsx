import { BetPlace, RouletteState, RouletteUser } from "./types";
import { create } from "zustand";

interface Methods {
  finishRound: () => void;
  setRouletteStatus: (state: RouletteState["status"]) => void;
  addBet: (
    userId: RouletteUser["id"],
    betPlace: BetPlace,
    amount: number
  ) => void;
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

const chipColors = [
  "#000000",
  "#072475",
  "#13563B",
  "#A46928",
  "#E4A700",
  "#C70000",
  "#7B1414",
];

export const useRouletteState = create<RouletteState & Methods>((set) => {
  return {
    status: "inactive",
    users: {},
    bets: initialBets,
    finishRound: () =>
      set({ status: "inactive", users: {}, bets: initialBets }),
    setRouletteStatus: (status: RouletteState["status"]) => set({ status }),
    addBet: (userId: RouletteUser["id"], betPlace: BetPlace, amount: number) =>
      set((state) => {
        console.log("adding bet", userId, betPlace, amount);
        let newUser = undefined;
        if (state.users[userId] === undefined) {
          newUser = {
            id: userId,
            name: userId,
            color: chipColors[Math.floor(Math.random() * 100) % 7],
          };
        }

        const newAmount = state.bets[betPlace][userId]
          ? state.bets[betPlace][userId] + amount
          : amount;

        return {
          bets: {
            ...state.bets,
            [betPlace]: { ...state.bets[betPlace], [userId]: newAmount },
          },
          status: "openBets",
          users: newUser ? { ...state.users, [userId]: newUser } : state.users,
        };
      }),
  };
});
