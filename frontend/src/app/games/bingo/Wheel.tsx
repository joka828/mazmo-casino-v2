"use client";
import { useEffect, useMemo } from "react";
import { Wheel } from "spin-wheel";
import Image from "next/image";

import { styled } from "@mui/material";
import { BingoRoundStatus } from "@/api/bingo/types";

const black = "#000000";
const white = "#ffffff";

const numbers = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
  47, 48, 49, 50,
];

const data = numbers.map((number) => ({
  label: number.toString(),
  backgroundColor: number % 2 === 0 ? white : black,
  labelColor: number % 2 === 0 ? black : white,
}));

const WheelContainer = styled("div")`
  position: relative;
  width: 50vw;
  height: 50vw;

  @media (max-width: 400px) {
    width: 70vw;
    height: 70vw;
  }
`;

const Pointer = styled(Image)`
  position: absolute;
  transform: rotate(180deg) translate(50%, 50%);
  top: 50%;
  left: 50%;
`;

interface Props {
  onFinishSpin?: () => void;
  numbersDrawn: number[];
  status: BingoRoundStatus
}

const BingoWheel = ({
  onFinishSpin,
  numbersDrawn,
  status,
}: Props) => {

  const data = useMemo(() => numbers.filter((number) => !numbersDrawn.includes(number)).map((number, index) => ({
    label: number.toString(),
    backgroundColor: index % 2 === 0 ? white : black,
    labelColor: index % 2 === 0 ? black : white,
  })), [numbersDrawn]);

  const wheelProps = useMemo(() => ({
    items: data,
    isInteractive: false,
    itemLabelRadius: 0.88,
    itemLabelFont: "Roboto",
    itemLabelFontSizeMax: 24,
    itemLabelAlign: "center",
    borderColor: "#753416",
    borderWidth: 10,
    lineWidth: 2,
    rotationResistance: 0,
  }), [data]);

  useEffect(() => {
    const container = document.querySelector(".wheel-container");
    if (wheelProps.items.length === 0 || !container) return;

    const wheel = new Wheel(container, wheelProps);

    if (status === "started") {
      wheel.spin(-80);
    }

    () => {
      wheel.remove();
    };
  }, [wheelProps, status]);

  return (
    <WheelContainer className="wheel-container">
      <Pointer
        src="/roulette-pointer.png"
        alt="roulette-pointer"
        width={80}
        height={80}
      />
    </WheelContainer>
  );
};

export default BingoWheel;
