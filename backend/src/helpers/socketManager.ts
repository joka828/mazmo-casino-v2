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

export const CASINO_STATUS_UPDATED = "casinoStatusUpdated";

export const BINGO_ROUND_CREATED = "bingoRoundCreated";
export const BINGO_PLAYER_ADDED = "bingoPlayerAdded";
export const BINGO_NUMBER_DRAWN = "bingoNumberDrawn";
export const BINGO_ROUND_ENDED = "bingoRoundEnded";
