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
import { useCurrentUserState } from "@/api/currentUser";

export const ROULETTE_BET_ADDED = "rouletteBetAdded";
export const ROULETTE_ROUND_CREATED = "rouletteRoundCreated";
export const ROULETTE_ROUND_ENDED = "rouletteRoundEnded";

export const CASINO_STATUS_UPDATED = "casinoStatusUpdated";

export default function useSocketEvents() {
  const { setSocketStatus, setLoading } = useMenuState();
  const rouletteState = useRouletteState();
  const currentUserState = useCurrentUserState();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "");

    socket.on("connect", () => {
      setSocketStatus(true);
    });

    socket.on(
      "initialize",
      (initialData: {
        roulette: RouletteRound & { history: RouletteState["history"] };
      }) => {
        console.log("initialize", initialData);
        setLoading(false);
        rouletteState.initializeData(initialData.roulette);
      }
    );

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
      (data: { winnerNumber: number; results: RouletteState["results"] }) => {
        rouletteState.noMoreBets(data.winnerNumber, data.results);
        console.log("round ended, no more bets", data);
      }
    );

    socket.on(CASINO_STATUS_UPDATED, ({ status }: { status: string }) => {
      currentUserState.setCasinoStatus(status);
    });

    return () => {
      socket.off("connect");
      socket.off("initialize");
      socket.off(ROULETTE_BET_ADDED);
      socket.off(ROULETTE_ROUND_CREATED);
      socket.off(ROULETTE_ROUND_ENDED);
      socket.off(CASINO_STATUS_UPDATED);
    };
  }, []);
}
