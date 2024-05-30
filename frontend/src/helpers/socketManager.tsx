"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

import { useMenuState } from "@/api/menus";
import {
  BetPlace,
  RouletteRound,
  RouletteState,
  RouletteUser,
} from "@/api/roulette/types";
import { useRouletteState } from "@/api/roulette";

export const ROULETTE_BET_ADDED = "rouletteBetAdded";
export const ROULETTE_ROUND_CREATED = "rouletteRoundCreated";
export const ROULETTE_ROUND_ENDED = "rouletteRoundEnded";

export default function useSocketEvents() {
  const { setSocketStatus } = useMenuState();
  const rouletteState = useRouletteState();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "");

    socket.on("connect", () => {
      setSocketStatus(true);
    });

    socket.on("initialize", (initialData: { roulette: RouletteRound }) => {
      console.log("initialize", initialData);
      if (initialData.roulette.id) {
        rouletteState.initializeData(initialData.roulette);
      } else {
        rouletteState.setRouletteStatus(initialData.roulette.status);
      }
      rouletteState.setRouletteStatus(initialData.roulette.status);
    });

    socket.on(
      ROULETTE_BET_ADDED,
      (data: { betPlace: BetPlace; amount: number; user: RouletteUser }) => {
        rouletteState.addBet(data.betPlace, data.amount, data.user);
        console.log("bet added", data);
      }
    );

    socket.on(
      ROULETTE_ROUND_CREATED,
      (data: { roundId: string; finishTimestamp: number }) => {
        rouletteState.startRound(data.roundId, data.finishTimestamp);
        console.log("round created", data);
      }
    );

    socket.on(
      ROULETTE_ROUND_ENDED,
      (data: { winnerNumber: number; winners: RouletteState["winners"] }) => {
        rouletteState.noMoreBets(data.winnerNumber, data.winners);
        console.log("round ended, no more bets", data);
      }
    );
  }, []);
}
