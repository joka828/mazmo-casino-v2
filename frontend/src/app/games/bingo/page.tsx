"use client";
import { useMemo } from "react";
import { Box, Button, IconButton, styled, Tooltip, Typography } from "@mui/material";

import { useBingoState } from "@/api/bingo";
import { useCurrentUserState } from "@/api/currentUser";
import askForSades from "@/helpers/sadesAsk";

import Column from "@/components/Column";
import Row from "@/components/Row";

import BingoWheel from "./Wheel";
import BingoCard from "./Card";

const NumbersWrapper = styled(Row)`
  align-items: stretch;

  @media (max-width: 400px) {
    flex-direction: column;
    align-items: center;
  }
`

const NumbersDrawnWrapper = styled(Row)`
  gap: 6px;
  flex-wrap: wrap;
  flex-grow: 1;
  border: 4px solid #753416;
  padding: 8px;
  box-sizing: border-box;
  align-content: flex-start;
  align-items: flex-start;

  @media (max-width: 400px) {
    justify-content: center;
  }
`;

const NumberDrawn = styled(Box)`
  background-color: #fafafa;
  color: #000;
  border-radius: 50%;
  fontSize: 24px;
  padding: 8px;
  aspect-ratio: 1;
  width: 20px;
  box-sizing: content-box;
  text-align: center;
`;



export default function Bingo() {
  const { userId: currentUserId } = useCurrentUserState();
  const bingoState = useBingoState();

  const currentUserCard = useMemo(() => {
    if (!bingoState.users || !currentUserId) {
      return undefined;
    }

    return bingoState.users[currentUserId].card;
  }, [currentUserId, bingoState]);

  return (
    <Column sx={{ gap: '2rem', flexGrow: '1', width: '100%', alignItems: 'stretch' }}>
      <NumbersWrapper>
        <BingoWheel numbersDrawn={bingoState.numbersDrawn} status={bingoState.status} />
        <NumbersDrawnWrapper>
          {bingoState.numbersDrawn.map((number) => (<NumberDrawn key={number}>{number}</NumberDrawn>))}
        </NumbersDrawnWrapper>
      </NumbersWrapper>
      <Box>
        {
          currentUserCard
            ? <BingoCard numbers={currentUserCard.numbers} numbersDrawn={bingoState.numbersDrawn} />
            : (
              <Button variant="contained" color="primary" onClick={() => { askForSades.bingoCardBuy() }}>
                Comprar cartón
              </Button>
            )
        }
      </Box>
    </Column>
  );
}
