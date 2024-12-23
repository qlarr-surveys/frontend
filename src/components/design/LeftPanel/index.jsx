import { Box } from "@mui/material";
import NewComponentsPanel from "~/components/design/NewComponentsPanel";
import React, { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import styles from "./LeftPanel.module.css";
import SetupPanel from '../setup/SetupPanel';
import { resetSetup } from '~/state/design/designState';
function LeftPanel({ t }) {
  const setup = useSelector((state) => {
    return state.designState?.setup || {};
  });

  const dispatch = useDispatch()

  const theme = useTheme();

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
      className={styles.box}
      style={{
        transition: theme.transitions.create("transform", {
          easing: theme.transitions.easing.sharp,
          duration: 300,
        })
      }}
      timeout={300}
    >
      {hasSetup ? <SetupPanel t={t} /> : <NewComponentsPanel t={t} />}
    </Box>
  );
}

export default React.memo(LeftPanel);
