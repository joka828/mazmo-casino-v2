import { create } from "zustand";
import { Socket } from "socket.io-client";

export const useSocket = create<{
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
}>((set) => {
  return {
    socket: null,
    setSocket: (socket: Socket) => set({ socket }),
  };
});

export const ROULETTE_BET_ADDED = "rouletteBetAdded";
export const ROULETTE_ROUND_CREATED = "rouletteRoundCreated";
export const ROULETTE_ROUND_ENDED = "rouletteRoundEnded";
export const ROULETTE_ROUND_NO_MORE_BETS = "rouletteRoundNoMoreBets";
