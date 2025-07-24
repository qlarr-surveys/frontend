import { Box, Collapse, Slide } from "@mui/material";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import SetupPanel from "../setup/SetupPanel";

function RightPanel({ t }) {
  const setup = useSelector((state) => state.designState?.setup);

  const theme = useTheme();

  const hasSetup = setup && Object.keys(setup).length > 0;

  return (
    <Collapse
      in={hasSetup}
      // sx={{ flex: "0 0 auto" }}
      sx={{ flex: "0 0 auto" }}
      orientation="horizontal"
      timeout={200}
      easing={{
        enter: "linear", // Easing for the "entering" animation
        exit: "linear", // Easing for the "exiting" animation
      }}
      unmountOnExit
    >
      <SetupPanel t={t} />
    </Collapse>
  );
}

export default React.memo(RightPanel);
