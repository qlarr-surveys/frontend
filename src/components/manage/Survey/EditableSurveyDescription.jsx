import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./Survey.module.css";
import { truncateWithEllipsis } from "~/utils/design/utils";
import { Edit } from "@mui/icons-material";

export const EditableSurveyDescription = ({
  survey,
  onSave,
  isEditable = true,
  isExample,
}) => {
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [description, setDescription] = useState(survey.description);

  const charLimit = isExample ? 450 : 125;

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleDescriptionBlur = () => {
    if (description !== survey.description) {
      onSave(description, () => setDescription(survey.description));
    }
    setIsDescriptionEditing(false);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsDescriptionEditing(true);
  };

  return (
    <Box className={styles.descriptionContainer}>
      {isDescriptionEditing ? (
        <TextField
          sx={{ px: 3 }}
          value={description}
          onChange={handleDescriptionChange}
          onBlur={handleDescriptionBlur}
          autoFocus
          variant="standard"
          fullWidth
          multiline
          rows={3}
        />
      ) : (
        <>
          <Tooltip
            title={description?.length > charLimit ? description : ""}
            sx={{
              fontSize: "1.2rem",
            }}
            arrow
          >
            <Typography
              variant="caption"
              sx={{
                px: 3,
                color: description ? "inherit" : "gray",
                flexGrow: 1,
              }}
              className={`${
                isExample ? styles.exampleTruncatedText : styles.truncatedText
              }`}
            >
              {truncateWithEllipsis(description, charLimit) ||
                "Click to add a description..."}
            </Typography>
          </Tooltip>
          {isEditable && (
            <IconButton
              className={`${styles.descriptionIcon}`}
              onClick={handleEditClick}
              sx={{ ml: 1 }}
            >
              <Edit sx={{ color: "gray" }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};
