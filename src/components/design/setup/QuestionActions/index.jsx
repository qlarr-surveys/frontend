import React, { useCallback, useState } from "react";
import { Box, Button } from "@mui/material";
import DeleteModal from "~/components/common/DeleteModal";
import SurveyIcon from "~/components/common/SurveyIcons/SurveyIcon";
import { useDispatch } from "react-redux";
import {
  cloneQuestion,
  deleteGroup,
  deleteQuestion,
} from "~/state/design/designState";

export default function QuestionActions({ code, t }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const isGroup = code?.startsWith("G");

  const onDelete = useCallback(() => {
    if (isGroup) {
      dispatch(deleteGroup(code));
    } else {
      dispatch(deleteQuestion(code));
    }
  }, [dispatch, code, isGroup]);

  
  const onClone = useCallback(() => {
    if (!isGroup) {
      dispatch(cloneQuestion(code));
    }
  }, [dispatch, code, isGroup]);


  return (
    <Box display="flex" width="100%" gap={1}>
      {!isGroup && (
        <Button
          variant="contained"
          onClick={onClone}
          fullWidth
          color="primary"
          startIcon={<SurveyIcon name="duplicate" size=".9em" color="white" />}
        >
          {t("duplicate")}
        </Button>
      )}

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
        description={isGroup ? t("delete_page") : t("delete_question")}
        handleClose={() => setOpen(false)}
        handleDelete={() => {
          setOpen(false);
          onDelete();
        }}
      />
    </Box>
  );
}
