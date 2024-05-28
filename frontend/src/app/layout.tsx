"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";

import useSocketEvents from "@/helpers/socketManager";
import theme from "../theme";

import "./globals.css";

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
