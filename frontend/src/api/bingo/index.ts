import { BingoState } from "./types";
import { create } from "zustand";

interface Methods {
  initializeData: (initialData: BingoState) => void;
}

export const useBingoState = create<BingoState & Methods>((set) => {
  return {
    status: "inscriptionsOpen",
    users: {},
    startTimestamp: new Date().toISOString(),
    numbersDrawn: [],
    initializeData: (
      initialData: BingoState
    ) => {
      if (!initialData.currentRoundId) throw new Error("No current bingo round");
      set({
        status: initialData.status,
        startTimestamp: initialData.startTimestamp,
        currentRoundId: initialData.currentRoundId,
        users: initialData.users,
        numbersDrawn: initialData.numbersDrawn,
      });
    },
  };
});
