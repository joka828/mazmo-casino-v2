import { Box, styled, Typography } from "@mui/material";
import Column from "@/components/Column";
import Row from "@/components/Row";
import { useMemo } from "react";

const CardWrapper = styled(Column)`
  gap: 12px;
  background-color: #ed4c3d;
  padding: 24px 48px;
  border-radius: 8px;
  align-items: stretch;

  @media (max-width: 400px) {
    padding: 12px;
  }
`;

const NumbersWrapper = styled(Column)`
  border: 8px solid white;
  border-radius: 16px;
  align-items: stretch;
`;

const NumbersRow = styled(Row)`
  :last-of-type {
    > div {
      border-bottom-width: 0;
    }
  }
`;

const Number = styled(Box)`
  border: 0 solid white;
  border-bottom-width: 4px;
  border-right-width: 4px;
  flex-grow: 1;
  width: 20%;
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;

  @media (max-width: 400px) {
    font-size: 24px;
  }

  :last-of-type {
    border-right-width: 0;
  }
`;

const NumberDrawnIndicator = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;

  @media (max-width: 400px) {
    font-size: 16px;
  }
`;

const BingoCard = ({ numbers, numbersDrawn }: { numbers: number[], numbersDrawn: number[] }) => {
  const groups = useMemo(() => numbers.reduce<number[][]>((acc, number, index) => {
    const groupIndex = Math.floor(index / 5);
    if (!acc[groupIndex]) {
      acc[groupIndex] = [];
    }

    acc[groupIndex].push(number);

    return acc;
  }, []), [numbers]);

  const matchedNumbers = useMemo(() =>
    numbersDrawn.filter((number) => numbers.includes(number)),
    [numbers, numbersDrawn]
  );

  return (
    <Column sx={{ gap: '12px', alignItems: 'stretch' }}>
      <Typography fontSize={16} textAlign={'center'}>Si tenés todos los números, cantá &quot;BINGO!&quot; en el chat!</Typography>
      {matchedNumbers.length === 15 &&
        <Typography sx={{ backgroundColor: '#000', padding: '8px 16px', fontSize: '24px', textAlign: 'center', borderRadius: '8px' }}>
          ¡Ya podés cantar bingo en el chat!
        </Typography>
      }
      <CardWrapper>
        <Typography fontSize={36} textAlign={'center'} letterSpacing={4} lineHeight={1}>Bingo!</Typography>
        <NumbersWrapper>
          {groups.map((row, rowIndex) => (
            <NumbersRow key={rowIndex}>
              {row.map((number, numberIndex) => (
                <Number key={numberIndex}>
                  <span>{number}</span>
                  {matchedNumbers.includes(number) && <NumberDrawnIndicator>🍑</NumberDrawnIndicator>}
                </Number>
              ))}
            </NumbersRow>
          ))}
        </NumbersWrapper>
      </CardWrapper>
    </Column>
  );
}

export default BingoCard;