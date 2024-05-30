"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";

import useSocketEvents from "@/helpers/socketManager";
import theme from "../theme";

import "./globals.css";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUserState } from "@/api/currentUser";

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
  useSocketEvents();
  const currentUserState = useCurrentUserState();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    currentUserState.setUserData(searchParams.get("token") ?? "");
  }, []);

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
