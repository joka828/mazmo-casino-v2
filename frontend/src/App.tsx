import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

function App() {
  const [apiHealth, setApiHealth] = useState(false);
  const [mongodbHealth, setMongodbHealth] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/health`)
      .then((response) => response.text())
      .then((data) => {
        if (data === "OK") setApiHealth(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    fetch(`${process.env.REACT_APP_API_URL}/mongodb-health`)
      .then((response) => response.text())
      .then((data) => {
        if (data === "OK") setMongodbHealth(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "6px" }}>
          {apiHealth ? (
            <>
              <CheckCircleIcon color="success" />
              <Typography>Api is responding!</Typography>
            </>
          ) : (
            <>
              <CancelIcon color="error" />
              <Typography>Api dead :(</Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "6px" }}>
          {mongodbHealth ? (
            <>
              <CheckCircleIcon color="success" />
              <Typography>mongodb is responding!</Typography>
            </>
          ) : (
            <>
              <CancelIcon color="error" />
              <Typography>mongodb dead :(</Typography>
            </>
          )}
        </Box>
      </header>
    </div>
  );
}

export default App;
