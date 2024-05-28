import { BetPlace } from "./types";

const currentRoundId = "asd";

export const placeBet = async (bet: {
  place: BetPlace;
  amount: number;
  userId: string;
}) => {
  console.log("bet placed", bet);
};
