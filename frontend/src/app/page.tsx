import { GetServerSideProps } from "next";
import Image from "next/image";
import styles from "./page.module.css";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface Props {
  apiHealth: boolean;
  dbHealth: boolean;
}

export const getData = async () => {
  // Fetch data from external API
  const [apiHealthResponse, dbHealthResponse] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/mongodb-health`),
  ]);

  const apiHealthBody = await apiHealthResponse.text();
  const dbHealthBody = await dbHealthResponse.text();

  if (!apiHealthBody) {
    console.error("API is down");
  }
  if (!dbHealthBody) {
    console.error("Database is down");
  }

  // Pass data to the page via props
  return {
    apiHealth: apiHealthBody === "OK",
    dbHealth: dbHealthBody === "OK",
  };
};

export default async function Home() {
  const { apiHealth, dbHealth } = await getData();

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
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
    </main>
  );
}
