export interface RouletteUser {
  id: number;
  name: string;
  color: string;
  avatar: string;
}

export type BetPlace =
  | "red"
  | "black"
  | "even"
  | "odd"
  | "firstHalf"
  | "secondHalf"
  | "firstDozen"
  | "secondDozen"
  | "thirdDozen"
  | "firstColumn"
  | "secondColumn"
  | "thirdColumn"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32"
  | "33"
  | "34"
  | "35"
  | "36";

export interface RouletteState {
  currentRoundId?: string;
  finishTimestamp?: number;
  users: Record<number, RouletteUser>;
  bets: Record<BetPlace, Record<RouletteUser["id"], number>>;
  status: "inactive" | "openBets" | "noMoreBets" | "spinning" | "finished";
  results?: Record<string, number>;
  winnerNumber?: number;
  history: number[];
}

export interface RouletteRound {
  id: string;
  finishTimestamp: number;
  status: RouletteState["status"];
  bets: RouletteState["bets"];
  users: RouletteState["users"];
  results?: RouletteState["results"];
  winnerNumber?: number;
}
