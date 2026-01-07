import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import DeleteModal from "~/components/common/DeleteModal";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { useDispatch } from "react-redux";
import { deleteGroup, resetSetup } from "~/state/design/designState";

export default function PageActions({ code, t }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const onDelete = useCallback(() => {
    dispatch(resetSetup());
    dispatch(deleteGroup(code));
  }, [dispatch, code]);

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        color="primary"
        onClick={() => setOpen(true)}
        startIcon={<SurveyIcon name="delete" size=".9em" color="white" />}
      >
        {t("delete")}
      </Button>

      <DeleteModal
        open={open}
        description={t("delete_page")}
        handleClose={() => setOpen(false)}
        handleDelete={() => {
          setOpen(false);
          onDelete();
        }}
      />
    </>
  );
}
