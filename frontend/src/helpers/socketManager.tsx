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
import { BingoRound } from "@/api/bingo/types";
import { useCurrentUserState } from "@/api/currentUser";
import { useBingoState } from "@/api/bingo";

export const ROULETTE_BET_ADDED = "rouletteBetAdded";
export const ROULETTE_ROUND_CREATED = "rouletteRoundCreated";
export const ROULETTE_ROUND_ENDED = "rouletteRoundEnded";

export const CASINO_STATUS_UPDATED = "casinoStatusUpdated";

export default function useSocketEvents() {
  const { setSocketStatus, setLoading } = useMenuState();
  const rouletteState = useRouletteState();
  const currentUserState = useCurrentUserState();
  const bingoState = useBingoState();

  useEffect(() => {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL ?? "")
    const socket = io(url.origin ?? "", { path: `${url.pathname}/socket` });

    socket.on("connect", () => {
      setSocketStatus(true);
    });

    socket.on(
      "initialize",
      (initialData: {
        roulette: RouletteRound & { history: RouletteState["history"] };
        bingo: BingoRound;
      }) => {
        rouletteState.initializeData(initialData.roulette);
        // bingoState.initializeData(initialData.bingo);
        setLoading(false);
      }
    );

    socket.on(
      ROULETTE_BET_ADDED,
      (data: { betPlace: BetPlace; amount: number; user: RouletteUser }) => {
        rouletteState.addBet(data.betPlace, data.amount, data.user);
      }
    );

    socket.on(
      ROULETTE_ROUND_CREATED,
      (data: { roundId: string; finishTimestamp: number }) => {
        rouletteState.startRound(data.roundId, data.finishTimestamp);
      }
    );

    socket.on(
      ROULETTE_ROUND_ENDED,
      (data: { winnerNumber: number; results: RouletteState["results"] }) => {
        rouletteState.noMoreBets(data.winnerNumber, data.results);
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
