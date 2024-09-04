export interface BingoRound {
  id: string;
  numbersDrawn: number[];
  users: {
    [userId: number]: {
      card: BingoCard;
    };
  };
  startTimestamp: string;
  status: BingoRoundStatus;
  currentPrize: number;
}

export type BingoRoundStatus = "inscriptionsOpen" | "started" | "finished";

export interface BingoCard {
  id: string;
  numbers: number[];
}

export interface BingoState {
  currentRoundId?: string;
  users: Record<number, any>;
  status: BingoRoundStatus;
  numbersDrawn: number[];
  startTimestamp: string;
}