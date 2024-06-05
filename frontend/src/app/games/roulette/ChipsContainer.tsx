import { styled } from "@mui/material";
import Chip from "./Chip";

interface Props {
  orientation: "horizontal" | "vertical";
  users?: Array<{ color: string; name: string; userId: string }>;
}

const Wrapper = styled("div")`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 10;

  .place-chip {
    position: absolute;
    pointer-events: none;
  }
`;

const Row = styled(Wrapper)`
  .place-chip {
    top: 50%;
    transform: translateY(-50%);
  }

  .place-chip:nth-child(1) {
    left: 0;
  }

  .place-chip:nth-child(2) {
    right: 0;
  }

  .place-chip:nth-child(3) {
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const Column = styled(Wrapper)`
  .place-chip {
    left: 50%;
    transform: translateX(-50%);
  }

  .place-chip:nth-child(1) {
    top: 0;
  }

  .place-chip:nth-child(2) {
    bottom: 0;
  }

  .place-chip:nth-child(3) {
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;

export default function ChipsContainer({ orientation, users }: Props) {
  const chips = users?.map((user) => (
    <Chip
      className="place-chip"
      key={user.userId}
      color={user.color}
      name={user.name}
    />
  ));

  return orientation === "horizontal" ? (
    <Row>{chips}</Row>
  ) : (
    <Column>{chips}</Column>
  );
}
