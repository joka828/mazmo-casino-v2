"use client";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Row from "../../components/Row";
import Column from "../../components/Column";
import Link from "next/link";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  blackjack: "BlackJack",
  roulette: "Ruleta",
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const game = pathname.replace("/games/", "");

  return (
    <Column
      sx={{
        alignItems: "center",
        flexGrow: "1",
        height: "100%",
      }}
    >
      <Row sx={{ width: "100%", justifyContent: "space-between" }}>
        <Tooltip title="Volver al menú" placement="right">
          <Link href="/">
            <IconButton size="large">
              <ArrowBackIcon fontSize="inherit" color="secondary" />
            </IconButton>
          </Link>
        </Tooltip>
        <Box sx={{ width: "3rem" }} />
      </Row>
      {children}
    </Column>
  );
}
