import { Drawer } from "@mui/material";
import styles from "./SurveyDrawer.module.css";
import SurveyIndex from "~/components/run/SurveyIndex";
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

function SurveyDrawer({
  expanded,
  toggleDrawer,
}) {

  const navigationIndex = useSelector((state) => {
    return state.runState.data?.navigationIndex;
  }, shallowEqual);
  const survey = useSelector((state) => {
    return state.runState.data?.survey;
  }, shallowEqual);



  return (
    <Drawer
      anchor="left"
      transitionDuration={expanded !== COLLAPSE_IMMEDIATE ? 500 : 0}
      open={expanded == EXPAND}
      onClose={toggleDrawer(false)}
    >
      <div className={styles.drawer}>
        <SurveyIndex navigationIndex={navigationIndex} survey={survey} />
      </div>
    </Drawer>
  );
}

export default React.memo(SurveyDrawer);

export const COLLAPSE_IMMEDIATE = "COLLAPSE_IMMEDIATE";
export const COLLAPSE = "COLLAPSE";
export const EXPAND = "EXPAND";
