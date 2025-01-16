import { Box, Collapse } from "@mui/material";
import NewComponentsPanel from "~/components/design/NewComponentsPanel";
import React from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { DESIGN_SURVEY_MODE } from "~/routes";
import SetupPanel from "../setup/SetupPanel";
function LeftPanel({ t }) {
  const show = useSelector((state) => {
    return (
      (state.designState?.designMode || DESIGN_SURVEY_MODE.DESIGN) ==
        DESIGN_SURVEY_MODE.DESIGN &&
      (!state.designState.setup || Object.keys(state.designState.setup) == 0)
    );
  });

  const setup = useSelector((state) => {
    return state.designState?.setup || {};
  });

  const hasSetup = Object.keys(setup).length > 0;

  const theme = useTheme();

  return (
    <Box sx={{width:"22rem", flex:"0 0 auto"}}>
      {show &&  <NewComponentsPanel t={t} />}
      {hasSetup &&  <SetupPanel t={t} />}
    </Box>
  );
}

export default React.memo(LeftPanel);
