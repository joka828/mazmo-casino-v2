"use client";
import Link from "next/link";
import {
  Box,
  Button,
  IconButton,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Row from "../../../components/Row";
import Column from "../../../components/Column";
import Chip from "./chip";

const Board = styled(Row)`
  justify-content: center;
  align-items: stretch;
  margin-top: 1rem;

  .MuiButton-root {
    color: #fafafa;
    box-shadow: none;
  }
`;

const RightColumn = styled(Column)`
  align-items: center;
`;

const CounterWrapper = styled(Box)`
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 3.2rem;
  padding: 0.5rem;
`;

const Counter = styled(Box)`
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
    min-width: 4rem;
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

  &:last-of-type {
    border-bottom-right-radius: 1rem;
  }
`;

const Number = styled(Button)<{ index: number }>`
  border-radius: 0;
  border: 0.3rem solid #fafafa;
  border-top-width: 0;
  border-right-width: ${({ index }) => (index % 3 === 0 ? 0.3 : 0)}rem;
  flex-basis: 33.3333%;
  height: 3.2rem;
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

  :hover {
    background-color: ${({ index }) =>
      index === 0
        ? "#00000060"
        : numberColors[index] === "red"
        ? "#ff8080"
        : "#303030"};
  }
`;

const numberColors: Record<number, string> = {
  0: "green",
  1: "red",
  3: "red",
  5: "red",
  7: "red",
  9: "red",
  12: "red",
  14: "red",
  16: "red",
  18: "red",
  19: "red",
  21: "red",
  23: "red",
  25: "red",
  27: "red",
  30: "red",
  32: "red",
  34: "red",
  36: "red",
  2: "black",
  4: "black",
  6: "black",
  8: "black",
  10: "black",
  11: "black",
  13: "black",
  15: "black",
  17: "black",
  20: "black",
  22: "black",
  24: "black",
  26: "black",
  28: "black",
  29: "black",
  31: "black",
  33: "black",
  35: "black",
};

const chipColors = [
  "#000000",
  "#072475",
  "#13563B",
  "#A46928",
  "#E4A700",
  "#C70000",
  "#7B1414",
];

export default function Roulette() {
  return (
    <Board>
      <RightColumn>
        <CounterWrapper>
          <Counter>
            <span>0</span>
          </Counter>
        </CounterWrapper>
        <GroupsWrapper>
          <GroupsColumn>
            <Halves>
              <span className="rotate-text">1-18</span>
            </Halves>
            <Halves>
              <span className="rotate-text">Par</span>
            </Halves>
            <Halves
              sx={{
                backgroundColor: "red",
                ":hover": {
                  backgroundColor: "#ff8080",
                },
              }}
            >
              <span className="rotate-text"></span>
            </Halves>
            <Halves
              sx={{
                backgroundColor: "black",
                ":hover": {
                  backgroundColor: "#303030",
                },
              }}
            >
              <span className="rotate-text"></span>
            </Halves>
            <Halves>
              <span className="rotate-text">Impar</span>
            </Halves>
            <Halves>
              <span className="rotate-text">19-36</span>
            </Halves>
          </GroupsColumn>
          <GroupsColumn>
            <Dozen>
              <span className="rotate-text">1-12</span>
            </Dozen>
            <Dozen>
              <span className="rotate-text">13-24</span>
            </Dozen>
            <Dozen>
              <span className="rotate-text">25-36</span>
            </Dozen>
          </GroupsColumn>
        </GroupsWrapper>
      </RightColumn>
      <NumbersSection>
        <Number index={0} sx={{ flexBasis: "100%", borderTopWidth: "0.3rem" }}>
          0
        </Number>
        {Array.from({ length: 36 }).map((_, index) => (
          <Number variant="contained" key={index + 1} index={index + 1}>
            <span>{index + 1}</span>
          </Number>
        ))}
      </NumbersSection>
      <Column sx={{ position: "absolute" }}>
        {chipColors.map((color) => (
          <Chip key={color} color={color} name="Joka" />
        ))}
      </Column>
    </Board>
  );
}
