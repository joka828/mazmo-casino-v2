"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { io } from "socket.io-client";

import theme from "../theme";

import "./globals.css";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Mazmo casino v2",
//   description: "Casino games for sades in Mazmo.net",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? "");

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.id); // x8WIv7-mJelg7on_ALbx
    });
  }, []);

  console.log("RootLayout");
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </AppRouterCacheProvider>
        </main>
      </body>
    </html>
  );
}
