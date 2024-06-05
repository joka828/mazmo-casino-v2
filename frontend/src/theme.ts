"use client";
import { Open_Sans } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: openSans.style.fontFamily,
        },
      },
    },
  },
  palette: {
    text: {
      primary: "#fff",
    },
    primary: {
      main: "#000",
    },
    secondary: {
      main: "#fafafa",
    },
    success: {
      main: "#00ff00",
    },
  },
  breakpoints: {
    values: {
      xs: 400,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
