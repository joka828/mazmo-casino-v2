"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { Box, Skeleton, styled, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useMemo, useState } from "react";
import Link from "next/link";

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
    name: "Blackjack...?",
    path: "/games/blackjack",
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

export default function Home() {
  const [apiHealth, setApiHealth] = useState<boolean>(false);
  const [dbHealth, setDbHealth] = useState<boolean>(false);

  useMemo(() => {
    const fetchData = async () => {
      const { apiHealth, dbHealth } = await getData();
      setApiHealth(apiHealth);
      setDbHealth(dbHealth);
    };

    fetchData();
  }, []);

  return (
    <Menu>
      <Typography sx={{ textAlign: "center", fontSize: "32px" }}>
        ¡Bienvenidx al casino de sades!
      </Typography>
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
        <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
          {apiHealth ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
          <Typography>
            {apiHealth ? "Api is up and running!" : "Api is down :("}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
          {dbHealth ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
          <Typography>
            {dbHealth ? "Database is up and running!" : "Database is down :("}
          </Typography>
        </Box>
      </Box>
    </Menu>
  );
}
