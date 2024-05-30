"use client";
import { Wheel } from "spin-wheel";
import { numberColors } from "@/helpers/constants";
import { styled } from "@mui/material";
import { easeInOutQuad } from "easing-utils";
import { useEffect, useMemo } from "react";
import Image from "next/image";
// import { Wheel } from "react-custom-roulette";

const black = "#000000";
const red = "#eb1000";
const green = "#289e4b";

const numbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const data = numbers.map((number) => ({
  label: number.toString(),
  backgroundColor: numberColors[number] === "red" ? red : black,
}));

data[0].backgroundColor = green;

const getWinnerIndex = (winnerNumber: number) => {
  const index = numbers.findIndex(
    (numberOption) => numberOption === winnerNumber
  );

  return index;
};

const WheelContainer = styled("div")`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100vw;
  height: 100vw;
`;

const Pointer = styled(Image)`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -70%);
`;

interface Props {
  onRestDuration?: number;
  duration?: number;
  onFinishSpin?: () => void;
  winnerNumber: number;
}

const wheelProps = {
  items: data,
  itemLabelRotation: 90,
  isInteractive: false,
  itemLabelRadius: 0.88,
  itemLabelFont: "Roboto",
  itemLabelFontSizeMax: 32,
  itemLabelColors: ["#ffffff"],
  itemLabelAlign: "center",
  borderColor: "#753416",
  borderWidth: 10,
  lineColor: "#E4A700",
  lineWidth: 2,
};

const RouletteWheel = ({
  duration: durationProp,
  onRestDuration,
  onFinishSpin,
  winnerNumber,
}: Props) => {
  const winnerIndex = useMemo(
    () => getWinnerIndex(winnerNumber),
    [winnerNumber]
  );

  useEffect(() => {
    const container = document.querySelector(".wheel-container");
    const wheel = new Wheel(container, wheelProps);
    const duration = durationProp ?? 10000;
    wheel.onRest = () => {
      if (onFinishSpin) {
        setTimeout(() => {
          onFinishSpin();
        }, onRestDuration ?? 2000);
      }
    };

    // Random number between 5 and 10
    const spinsAmount = Math.floor(Math.random() * 6) + 5;

    wheel.spinToItem(
      winnerIndex,
      duration,
      false,
      spinsAmount,
      1,
      easeInOutQuad
    );

    () => {
      wheel.remove();
    };
  }, []);

  return (
    <WheelContainer className="wheel-container">
      <Pointer
        src="/roulette-pointer.png"
        alt="roulette-pointer"
        width={100}
        height={100}
      />
    </WheelContainer>
  );
};

export default RouletteWheel;
