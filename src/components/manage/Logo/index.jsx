import React from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import styles from "./Logo.module.css";

export const Logo = () => {
  const nav = useNavigate();

  return (
    <Box className={styles.logo} onClick={() => nav("/")}>
      <img src="/qlarr.png" style={{ height: "40px" }} />
    </Box>
  );
};
