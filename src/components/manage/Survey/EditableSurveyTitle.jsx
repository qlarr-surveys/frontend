import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./Survey.module.css";
import { truncateWithEllipsis } from "~/utils/design/utils";
import { Edit, Check } from "@mui/icons-material";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

export const EditableSurveyTitle = ({ survey, onSave, isEditable = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(survey.name);

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    if (newTitle.length <= 50) {
      setTitle(newTitle);
    }
  };

  const handleSave = () => {
    if (title.trim() === "") {
      setTitle(survey.name);
    } else if (title !== survey.name) {
      onSave(title, () => setTitle(survey.name));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  return (
    <Box className={styles.titleContainer}>
      {isEditing ? (
        <>
          <TextField
            sx={{ px: 3, flexGrow: 1 }}
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            autoFocus
            variant="standard"
            fullWidth
            InputProps={{
              style: { color: "white" },
            }}
          />
          <IconButton
            className={styles.saveIcon}
            onClick={handleSave}
            sx={{ ml: 1 }}
          >
            <Check sx={{ color: "white" }} />
          </IconButton>
        </>
      ) : (
        <>
          {title.length > 20 ? (
            <CustomTooltip title={title} showIcon={false}>
              <Typography variant="h4" sx={{ px: 3 }} noWrap>
                {truncateWithEllipsis(title, 18)}
              </Typography>
            </CustomTooltip>
          ) : (
            <Typography variant="h4" sx={{ px: 3 }} noWrap>
              {truncateWithEllipsis(title, 18)}
            </Typography>
          )}
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
