import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./Survey.module.css";
import { truncateWithEllipsis } from "~/utils/design/utils";
import { Edit, Check } from "@mui/icons-material";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";

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

  const handleSave = () => {
    if (description !== survey.description) {
      onSave(description, () => setDescription(survey.description));
    }
    setIsDescriptionEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsDescriptionEditing(true);
  };

  return (
    <Box className={styles.descriptionContainer}>
      {isDescriptionEditing ? (
        <>
          <TextField
            sx={{ px: 3 }}
            value={description}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            autoFocus
            variant="standard"
            fullWidth
            multiline
            rows={3}
          />
          <IconButton
            className={`${styles.saveIcon}`}
            onClick={handleSave}
            sx={{ ml: 1 }}
          >
            <Check sx={{ color: "gray" }} />
          </IconButton>
        </>
      ) : (
        <>
         
          {description?.length > charLimit ? (
            <CustomTooltip title={description} showIcon={false}>
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
            </CustomTooltip>
          ) : (
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
          )}

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
