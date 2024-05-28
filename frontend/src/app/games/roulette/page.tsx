"use client";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Box, Button, styled, Tooltip, Typography } from "@mui/material";
import Row from "../../../components/Row";
import Column from "../../../components/Column";
import Chip from "./Chip";
import Counter from "./Counter";
import { BetPlace, RouletteState } from "../../../api/roulette/types";
import { useRouletteState } from "@/api/roulette";
import ChipsContainer from "./ChipsContainer";
import { numberColors } from "@/helpers/constants";
import askForSades from "@/helpers/sadesAsk";
import Image from "next/image";
import RouletteWheel from "./Wheel";

const HandOverlay = styled(Box)`
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #00000080;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NoMoreBetsText = styled(Typography)`
  background-color: #000;
  border-radius: 1rem;
  padding: 0.5rem 1rem;

  margin-top: 4rem;
  font-size: 2.5rem;
  font-weight: 500;
`;

const StyledImage = styled(Image)`
  position: absolute;
  top: 0;
  right: 0;
  transform: rotate(-90deg);

  animation: noVaMas 2.5s linear 0s 1 normal none;

  @keyframes noVaMas {
    0% {
      opacity: 0;
      transform: translateY(-50%) rotate(-90deg);
    }

    30% {
      opacity: 1;
    }

    50% {
      opacity: 1;
      transform: translateY(calc(50vh - 50%)) rotate(-90deg);
    }

    70% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translateY(calc(100vh - 50%)) rotate(-90deg);
    }
  }
`;

const Board = styled(Row)`
  justify-content: center;
  align-items: stretch;
  position: relative;

  .MuiButton-root {
    color: #fafafa;
    box-shadow: none;
  }
`;

const PlayersWrapper = styled(Row)`
  gap: 1rem;
  position: absolute;
  transform-origin: top right;
  top: -4rem;
  right: 2rem;
`;

const LeftColumn = styled(Column)`
  align-items: center;
`;

const CounterWrapper = styled(Box)`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 3rem;
  padding: 0.5rem;
`;

const CounterText = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #444;
  border-radius: 0.5rem;

  & span {
    font-size: 1.5rem;
    text-align: center;
  }
`;

const GroupsWrapper = styled(Row)`
  flex-grow: 1;
  flex-basis: 100%;
  align-items: center;
  justify-content: center;
`;

const GroupsColumn = styled(Column)`
  width: 3.2rem;
  height: 100%;
  border: 0.3rem solid #fafafa;
  border-right-width: 0;

  :first-of-type {
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
  }

  & .MuiButton-root:first-of-type {
    border-top-width: 0;
  }

  & .MuiButton-root:last-of-type {
    border-bottom-width: 0;
  }
`;

const Group = styled(Button)`
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  position: relative;
  border-radius: 0;

  border: 0.15rem solid #fafafa;
  border-right-width: 0;
  border-left-width: 0;

  transition: background-color 0.3s;
  :hover {
    background-color: #00000060;
  }

  & .rotate-text {
    position: absolute;
    text-align: center;
    min-width: 5rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    font-size: 1.5rem;
    font-weight: 500;
  }
`;

const Halves = styled(Group)`
  flex-basis: 16.6667%;
`;

const Dozen = styled(Group)`
  flex-basis: 33.3333%;
`;

const NumbersSection = styled(Row)`
  flex-wrap: wrap;
  width: 70%;
  min-width: 12rem;
`;

const Number = styled(Button)<{ index: number }>`
  border-radius: 0;
  border: 0.3rem solid #fafafa;
  border-top-width: 0;
  border-right-width: ${({ index }) => (index % 3 === 0 ? 0.3 : 0)}rem;
  flex-basis: 33.3333%;
  height: 3rem;
  font-size: 1.5rem;
  font-weight: 500;
  justify-content: center;
  cursor: pointer;

  background-color: ${({ index }) =>
    index === 0 ? "" : numberColors[index] === "red" ? "#ff0000" : "#000000"};

  transition: background-color 0.3s;

  ${({ index }) =>
    index === 0
      ? "border-top-left-radius: 1rem; border-top-right-radius: 1rem;"
      : ""}

  :last-of-type {
    border-bottom-right-radius: 1rem;
  }

  :hover {
    background-color: ${({ index }) =>
      index === 0
        ? "#00000060"
        : numberColors[index] === "red"
        ? "#ff8080"
        : "#606060"};
  }
`;

const chipColors = [
  "#000000",
  "#072475",
  "#13563B",
  "#A46928",
  "#E4A700",
  "#C70000",
  "#7B1414",
];

const randomWinner = Math.floor(Math.random() * 37);

export default function Roulette() {
  const { setRouletteStatus, ...rouletteState } = useRouletteState();

  const areBetsOpen = rouletteState.status === "openBets";

  const onBet = (betPlace: BetPlace) => {
    const userId = `${Math.floor(Math.random() * 1000)}`;
    rouletteState.addBet(userId, betPlace, 1);
    // askForSades.rouletteBet(betPlace);

    // setRouletteStatus("spinning");
    if (areBetsOpen) {
      setRouletteStatus("inactive");
      setTimeout(() => {
        setRouletteStatus("openBets");
      });
    } else {
      setRouletteStatus("openBets");
    }
  };

  const chips = useMemo(
    () =>
      Object.keys(rouletteState.bets).reduce<
        Record<string, Array<{ color: string; name: string; userId: string }>>
      >((acc, placeId) => {
        const placeBets = rouletteState.bets[placeId as BetPlace];
        Object.keys(placeBets).forEach((userId) => {
          const chip = {
            userId,
            color: rouletteState.users[userId].color,
            name: rouletteState.users[userId].name,
          };

          acc[placeId as BetPlace] = acc[placeId as BetPlace] ?? [];
          acc = {
            ...acc,
            [placeId]: [...acc[placeId as BetPlace], chip],
          };
        });

        return acc;
      }, {}),
    [rouletteState.bets, rouletteState.users]
  );

  return (
    <Board>
      {(rouletteState.status === "noMoreBets" ||
        rouletteState.status === "spinning") && (
        <HandOverlay>
          <NoMoreBetsText>¡No va mas!</NoMoreBetsText>
          {rouletteState.status === "noMoreBets" ? (
            <StyledImage
              src="/hand.svg"
              alt="croupier hand"
              width={400}
              height={500}
              onAnimationEnd={() => {
                // 2500ms
                setRouletteStatus("spinning");
              }}
            />
          ) : (
            <RouletteWheel
              // winnerNumber={rouletteState.winnerNumber ?? 2}
              winnerNumber={randomWinner}
              onFinishSpin={() => rouletteState.finishRound()}
            />
          )}
        </HandOverlay>
      )}
      <PlayersWrapper>
        {Object.keys(rouletteState.users).map((userId) => {
          const user = rouletteState.users[userId];
          return <Chip key={userId} color={user.color} name={user.name} />;
        })}
      </PlayersWrapper>
      <LeftColumn>
        <CounterWrapper>
          <CounterText>
            {areBetsOpen ? (
              <Counter
                initialValue={3}
                onCountingEnd={() => {
                  setRouletteStatus("noMoreBets");
                }}
              />
            ) : (
              "-"
            )}
          </CounterText>
        </CounterWrapper>
        <GroupsWrapper>
          <GroupsColumn>
            <Halves
              onClick={() => {
                onBet("firstHalf");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.firstHalf} />
              <span className="rotate-text">1-18</span>
            </Halves>
            <Halves
              onClick={() => {
                onBet("even");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.even} />
              <span className="rotate-text">Par</span>
            </Halves>
            <Halves
              sx={{
                backgroundColor: "red",
                ":hover": {
                  backgroundColor: "#ff8080",
                },
              }}
              onClick={() => {
                onBet("red");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.red} />
              <span className="rotate-text"></span>
            </Halves>
            <Halves
              sx={{
                backgroundColor: "black",
                ":hover": {
                  backgroundColor: "#606060",
                },
              }}
              onClick={() => {
                onBet("black");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.black} />
              <span className="rotate-text"></span>
            </Halves>
            <Halves
              onClick={() => {
                onBet("odd");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.odd} />
              <span className="rotate-text">Impar</span>
            </Halves>
            <Halves
              onClick={() => {
                onBet("secondHalf");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.secondHalf} />
              <span className="rotate-text">19-36</span>
            </Halves>
          </GroupsColumn>
          <GroupsColumn>
            <Dozen
              onClick={() => {
                onBet("firstDozen");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.firstDozen} />
              <span className="rotate-text">1-12</span>
            </Dozen>
            <Dozen
              onClick={() => {
                onBet("secondDozen");
              }}
            >
              <ChipsContainer
                orientation="vertical"
                users={chips.secondDozen}
              />
              <span className="rotate-text">13-24</span>
            </Dozen>
            <Dozen
              onClick={() => {
                onBet("thirdDozen");
              }}
            >
              <ChipsContainer orientation="vertical" users={chips.thirdDozen} />
              <span className="rotate-text">25-36</span>
            </Dozen>
          </GroupsColumn>
        </GroupsWrapper>
      </LeftColumn>
      <NumbersSection>
        <Number
          index={0}
          sx={{ flexBasis: "100%", borderTopWidth: "0.3rem" }}
          onClick={() => {
            onBet("0");
          }}
        >
          <ChipsContainer orientation="horizontal" users={chips["0"]} />0
        </Number>
        {Array.from({ length: 36 }).map((_, index) => (
          <Number
            variant="contained"
            key={index + 1}
            index={index + 1}
            onClick={() => {
              onBet(`${index + 1}` as BetPlace);
            }}
          >
            <ChipsContainer
              orientation="horizontal"
              users={chips[`${index + 1}` as BetPlace]}
            />
            <span>{index + 1}</span>
          </Number>
        ))}
      </NumbersSection>
    </Board>
  );
}
