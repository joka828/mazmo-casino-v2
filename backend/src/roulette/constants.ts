import { BetPlace } from "./types";

export const betPlacesInfo: Record<
  BetPlace,
  { name: string; multiplier: number }
> = {
  red: { name: "Rojo", multiplier: 2 },
  black: { name: "Negro", multiplier: 2 },
  odd: { name: "Impar", multiplier: 2 },
  even: { name: "Par", multiplier: 2 },
  firstHalf: { name: "Primera mitad", multiplier: 2 },
  secondHalf: { name: "Segunda mitad", multiplier: 2 },
  firstDozen: { name: "Primera docena", multiplier: 3 },
  secondDozen: { name: "Segunda docena", multiplier: 3 },
  thirdDozen: { name: "Tercera docena", multiplier: 3 },
  "0": { name: "0", multiplier: 36 },
  "1": { name: "1", multiplier: 36 },
  "2": { name: "2", multiplier: 36 },
  "3": { name: "3", multiplier: 36 },
  "4": { name: "4", multiplier: 36 },
  "5": { name: "5", multiplier: 36 },
  "6": { name: "6", multiplier: 36 },
  "7": { name: "7", multiplier: 36 },
  "8": { name: "8", multiplier: 36 },
  "9": { name: "9", multiplier: 36 },
  "10": { name: "10", multiplier: 36 },
  "11": { name: "11", multiplier: 36 },
  "12": { name: "12", multiplier: 36 },
  "13": { name: "13", multiplier: 36 },
  "14": { name: "14", multiplier: 36 },
  "15": { name: "15", multiplier: 36 },
  "16": { name: "16", multiplier: 36 },
  "17": { name: "17", multiplier: 36 },
  "18": { name: "18", multiplier: 36 },
  "19": { name: "19", multiplier: 36 },
  "20": { name: "20", multiplier: 36 },
  "21": { name: "21", multiplier: 36 },
  "22": { name: "22", multiplier: 36 },
  "23": { name: "23", multiplier: 36 },
  "24": { name: "24", multiplier: 36 },
  "25": { name: "25", multiplier: 36 },
  "26": { name: "26", multiplier: 36 },
  "27": { name: "27", multiplier: 36 },
  "28": { name: "28", multiplier: 36 },
  "29": { name: "29", multiplier: 36 },
  "30": { name: "30", multiplier: 36 },
  "31": { name: "31", multiplier: 36 },
  "32": { name: "32", multiplier: 36 },
  "33": { name: "33", multiplier: 36 },
  "34": { name: "34", multiplier: 36 },
  "35": { name: "35", multiplier: 36 },
  "36": { name: "36", multiplier: 36 },
};
