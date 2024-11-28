"use client";
import Image from "next/image";
import { Box, CircularProgress, styled, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMenuState } from "@/api/menus";
import { useCurrentUserState } from "@/api/currentUser";
import Column from "@/components/Column";

interface Props {
  apiHealth: boolean;
  dbHealth: boolean;
}

const getData = async () => {
  // Fetch data from external API
  const [apiHealthResponse, dbHealthResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/mongodb-health`),
  ]);

  const [apiHealthBody, dbHealthBody] = await Promise.all([
    apiHealthResponse.text(),
    dbHealthResponse.text(),
  ]);

  if (!apiHealthBody) {
    console.error("API is down");
  }
  if (!dbHealthBody) {
    console.error("Database is down");
  }

  return {
    apiHealth: apiHealthBody === "OK",
    dbHealth: dbHealthBody === "OK",
  };
};

const Menu = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1rem;
  border: 0.25rem solid #ffd700;
  border-radius: 1rem;
`;

const List = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
`;

const LoadingOverlay = styled(Column)`
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000d0;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

interface MenuItem {
  name: string;
  path: string;
  imageUrl: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Ruleta",
    path: "/games/roulette",
    imageUrl: "/roulette-image.png",
  },
  {
    name: "Bingo!",
    // path: "/games/bingo",
    path: "",
    imageUrl:
      "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L3JtNTU4LWVsZW1lbnRzLXdvcmQtMDEteC5qcGc.jpg",
  },
];

const MenuItem = ({ name, imageUrl, path }: MenuItem) => {
  return (
    <Link href={path}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          padding: "1rem",
          transition: "all 0.2s",
          borderRadius: "1rem",
          ":hover": {
            backgroundColor: "#d0d0d080",
          },
        }}
      >
        <Typography fontSize={24}>{name}</Typography>
        <Box
          sx={{
            border: "0.25rem solid #ffd700",
            borderRadius: "100%",
            aspectRatio: "1/1",
            overflow: "hidden",
          }}
        >
          <Image src={imageUrl} alt={name} width={200} height={200} />
        </Box>
      </Box>
    </Link>
  );
};

export default function GamesMenu() {
  const [apiHealth, setApiHealth] = useState<boolean>(false);
  const [dbHealth, setDbHealth] = useState<boolean>(false);

  const { socketStatus, loading } = useMenuState();
  const { error, setUserToken } = useCurrentUserState();

  useEffect(() => {
    const fetchData = async () => {
      const { apiHealth, dbHealth } = await getData();
      setApiHealth(apiHealth);
      setDbHealth(dbHealth);
    };

    fetchData();
  }, []);

  return (
    <>
      {loading && (
        <LoadingOverlay>
          <Typography fontSize={32}>Cargando...</Typography>
          <CircularProgress
            sx={{ width: "30vw", height: "30vw", color: "#fafafa" }}
            size="large"
          />
        </LoadingOverlay>
      )}
      <Menu>
        <Typography textAlign="center" fontSize={32}>
          ¡Bienvenidx al casino de sades!
        </Typography>
        {error ? (
          <Typography color="error" textAlign="center" fontSize={32}>
            Authentication error
          </Typography>
        ) : (
          <>
            <List>
              {menuItems.map((item) => (
                <MenuItem key={item.name} {...item} />
              ))}
            </List>
            <Box />
            <Box
              sx={{
                position: "fixed",
                bottom: "1.5rem",
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
              }}
            >
              <Box
                sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}
              >
                {apiHealth ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )}
                <Typography>Api</Typography>
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}
              >
                {dbHealth ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )}
                <Typography>Database</Typography>
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}
              >
                {socketStatus ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <CancelIcon color="error" />
                )}
                <Typography>Socket</Typography>
              </Box>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
