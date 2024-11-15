import { Box } from "@mui/material";

import { useSelector } from "react-redux";
import React, { useEffect } from "react";
import SetupPanel from "../setup/SetupPanel";
import { useTheme } from "@emotion/react";
import styles from "./RightPanel.module.css";
import { resetSetup } from '~/state/design/designState';
import { useDispatch } from 'react-redux';

function RightPanel({ t }) {
  const theme = useTheme();
  const dispatch = useDispatch();


  const setup = useSelector((state) => {
    return state.designState?.setup || {};
  });

  const hasSetup = Object.keys(setup).length > 0;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'd') {
        document.removeEventListener('keydown', handleKeyDown);
        dispatch(resetSetup());
      }
    };

    // Attach the event listener
    if(hasSetup){
      document.addEventListener('keydown', handleKeyDown);
    }
    
  },[hasSetup]);

  return (
    <Box
      className={`${styles.box} ${hasSetup ? styles.boxHasSetup : ""}`}
      style={{
        transition: theme.transitions.create("all", {
          easing: theme.transitions.easing.sharp,
          duration: 300,
        }),
      }}
      timeout={300}
    >
      {hasSetup && <SetupPanel t={t} />}
    </Box>
  );
}

export default React.memo(RightPanel);
