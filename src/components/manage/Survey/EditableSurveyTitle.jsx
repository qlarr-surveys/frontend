import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./Survey.module.css";
import { truncateWithEllipsis } from "~/utils/design/utils";
import { Edit } from "@mui/icons-material";

export const EditableSurveyTitle = ({ survey, onSave, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(survey.name);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleBlur = () => {
    if (title.trim() === "") {
      setTitle(survey.name);
    } else if (title !== survey.name) {
      onSave(title, () => setTitle(survey.name));
    }
    setIsEditing(false);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  return (
    <Box className={styles.titleContainer}>
      {isEditing ? (
        <TextField
          sx={{ px: 3, flexGrow: 1 }}
          value={title}
          onChange={handleTitleChange}
          onBlur={handleBlur}
          autoFocus
          variant="standard"
          fullWidth
          InputProps={{
            style: { color: "white" },
          }}
        />
      ) : (
        <>
          <Tooltip
            title={title.length > 20 ? title : ""}
            sx={{
              fontSize: "1.2rem",
            }}
            arrow
          >
            <Typography variant="h4" sx={{ px: 3 }} noWrap>
              {truncateWithEllipsis(title, 18)}
            </Typography>
          </Tooltip>
          {isEditable && (
            <IconButton
              className={styles.nameIcon}
              onClick={handleEditClick}
              sx={{ ml: 1 }}
            >
              <Edit sx={{ color: "white" }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};
