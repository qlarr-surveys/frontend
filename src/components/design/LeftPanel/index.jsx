import { Box } from "@mui/material";
import NewComponentsPanel from "~/components/design/NewComponentsPanel";
import React from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import styles from "./LeftPanel.module.css";
function LeftPanel({ t }) {
  const setup = useSelector((state) => {
    return state.designState?.setup || {};
  }, shallowEqual);

  const theme = useTheme();

  const hasSetup = Object.keys(setup).length > 0;

  return (
    <Box
      className={`${styles.box} ${hasSetup ? "" : styles.boxHasSetup}`}
      style={{
        transition: theme.transitions.create("transform", {
          easing: theme.transitions.easing.sharp,
          duration: 300,
        }),
        transform: !hasSetup ? "translateX(0)" : "translateX(-100%)",
      }}
      timeout={300}
    >
      {!hasSetup && <NewComponentsPanel t={t} />}
    </Box>
  );
}

export default React.memo(LeftPanel);
