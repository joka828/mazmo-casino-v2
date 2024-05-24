import { Box, BoxProps, styled } from "@mui/material";

interface Props extends BoxProps {
  name: string;
  color: string;
}

const defaultChipColor = "#f77925";

const ChipWrapper = styled(Box)<{ color: string }>`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${({ color }) => color ?? defaultChipColor};
  overflow: hidden;

  .line {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    width: 15%;
    background-color: white;
  }

  .line:nth-child(2) {
    transform: translateX(-50%) rotate(45deg);
  }
  .line:nth-child(3) {
    transform: translateX(-50%) rotate(90deg);
  }
  .line:nth-child(4) {
    transform: translateX(-50%) rotate(-45deg);
  }
`;

const Interior = styled(Box)<{ color: string }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background-color: ${({ color }) => color ?? defaultChipColor};
`;

const Infill = styled(Box)<{ color: string }>`
  position: absolute;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  color: ${({ color }) => color ?? defaultChipColor};
  font-weight: 500;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Chip = ({ name, color, ...props }: Props) => {
  return (
    <ChipWrapper className="chip" color={color} {...props}>
      <Box className="line" />
      <Box className="line" />
      <Box className="line" />
      <Box className="line" />
      <Interior className="interior" color={color}>
        <Infill color={color}>
          <span style={{ color: color }}>{name.substring(0, 1)}</span>
        </Infill>
      </Interior>
    </ChipWrapper>
  );
};

export default Chip;
