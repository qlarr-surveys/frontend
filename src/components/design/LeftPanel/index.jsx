import { Collapse } from "@mui/material";
import NewComponentsPanel from "~/components/design/NewComponentsPanel";
import React from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { DESIGN_SURVEY_MODE } from "~/routes";
function LeftPanel({ t }) {
  const show = useSelector((state) => {
    return (
      (state.designState?.designMode || DESIGN_SURVEY_MODE.DESIGN) ==
        DESIGN_SURVEY_MODE.DESIGN &&
      (!state.designState.setup || Object.keys(state.designState.setup) == 0)
    );
  });

  const theme = useTheme();

  return (
    <Collapse
      in={show}
      orientation="horizontal"  
      timeout={500}
      easing={{
        enter: "linear", // Easing for the "entering" animation
        exit: "linear", // Easing for the "exiting" animation
      }}
      unmountOnExit
    >
      <NewComponentsPanel t={t} />
    </Collapse>
  );
}

export default React.memo(LeftPanel);
