import { Server, Socket } from "socket.io";

let socketServer: Server | null = null;

export const initializeSocket = (server: Server) => {
  socketServer = server;
};

export const getSocket = () => {
  return socketServer;
};

// Events
export const ROULETTE_ROUND_CREATED = "rouletteRoundCreated";
export const ROULETTE_BET_ADDED = "rouletteBetAdded";
export const ROULETTE_ROUND_ENDED = "rouletteRoundEnded";
export const ROULETTE_ROUND_NO_MORE_BETS = "rouletteRoundNoMoreBets";
