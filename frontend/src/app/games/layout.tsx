"use client";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Row from "../../components/Row";
import Column from "../../components/Column";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUserState } from "@/api/currentUser";

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
  const gamePath = pathname.replace("/games", "");
  const currentUserState = useCurrentUserState();

  if (
    currentUserState.status === "maintenance" ||
    currentUserState.role !== "OWNER"
  ) {
    return (
      <Column sx={{ height: "100%", justifyContent: "center", gap: "0.5rem" }}>
        <Typography fontSize={24} fontWeight={500}>
          El casino está en mantenimiento.
        </Typography>
        <Typography>Pronto vuelve la timba!</Typography>
        <img src="/maintenance.png" alt="maintenance image" />
      </Column>
    );
  }

  return (
    <Column
      sx={{
        alignItems: "center",
        flexGrow: "1",
        height: "100%",
        width: "100%",
      }}
    >
      {!!gamePath && (
        <Row sx={{ width: "100%", justifyContent: "space-between" }}>
          <Tooltip title="Volver al menú" placement="right">
            <Link href="/games">
              <IconButton>
                <ArrowBackIcon fontSize="inherit" color="secondary" />
              </IconButton>
            </Link>
          </Tooltip>
          <Box sx={{ width: "3rem" }} />
        </Row>
      )}
      {children}
    </Column>
  );
}
