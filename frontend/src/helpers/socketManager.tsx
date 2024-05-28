"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

import { useMenuState } from "@/api/menus";
import {
  ROULETTE_BET_ADDED,
  ROULETTE_ROUND_CREATED,
  ROULETTE_ROUND_ENDED,
  ROULETTE_ROUND_NO_MORE_BETS,
  useSocket,
} from "@/api/socket";
import { BetPlace, RouletteState } from "@/api/roulette/types";
import { useRouletteState } from "@/api/roulette";

export default function useSocketEvents() {
  const { socketStatus, setSocketStatus } = useMenuState();
  const rouletteState = useRouletteState();
  const { setSocket } = useSocket();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "");

    socket.on("connect", () => {
      setSocketStatus(true);
      socket.on(
        "initialize",
        (initialData: { roulette: Partial<RouletteState> }) => {
          console.log("initialize", initialData);
        }
      );

      socket.on(
        ROULETTE_BET_ADDED,
        (data: {
          betPlace: BetPlace;
          amount: number;
          player: {
            id: string;
            name: string;
            color: string;
          };
        }) => {
          rouletteState.addBet(data.betPlace, data.amount, data.player);
          console.log("bet added", data);
        }
      );

      socket.on(
        ROULETTE_ROUND_CREATED,
        (data: { roundId: string; finishTimestamp: string }) => {
          rouletteState.startRound(data.roundId, data.finishTimestamp);
          console.log("round created", data);
        }
      );

      socket.on(
        ROULETTE_ROUND_NO_MORE_BETS,
        (data: { winnerNumber: number; winners: Array<{}> }) => {
          // rouletteState.endRound(data.winnerNumber, data.winners);
          // console.log("round ended", data);
        }
      );

      socket.on(
        ROULETTE_ROUND_ENDED,
        (data: { winnerNumber: number; winners: Array<{}> }) => {
          rouletteState.noMoreBets(data.winnerNumber, data.winners);
          console.log("round ended", data);
        }
      );
    });
  }, []);
}
