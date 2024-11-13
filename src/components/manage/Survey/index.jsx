import {
  Typography,
  IconButton,
  Card,
  Stack,
  Divider,
  Tooltip,
  TextField,
  Snackbar,
  Alert,
  Box,
  CardMedia,
} from "@mui/material";
import { Stop } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArticleIcon from "@mui/icons-material/Article";
import styles from "./Survey.module.css";
import { serverDateTimeToLocalDateTime } from "~/utils/DateUtils";
import { useTranslation } from "react-i18next";
import SavingSurvey from "~/components/design/SavingSurvey";
import { fDate } from "~/utils/format-time";
import TableRowsIcon from "@mui/icons-material/TableRows";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import WarningIcon from "@mui/icons-material/Warning";
import ShieldIcon from "@mui/icons-material/Shield";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { isSurveyAdmin } from "~/constants/roles";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "~/state/edit/editState";
import { useService } from "~/hooks/use-service";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import { buildResourceUrl } from "~/networking/common";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import { truncateWithEllipsis } from "~/utils/design/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
export const STATUS = {
  DRAFT: "draft",
  CLOSED: "closed",
  ACTIVE: "active",
  EXPIRED: "expired",
  SCHEDULED: "scheduled",
};

const status = (survey) => {
  switch (survey.status) {
    case "draft":
      return STATUS.DRAFT;
    case "closed":
      return STATUS.CLOSED;
    case "active":
      if (
        survey.endDate &&
        serverDateTimeToLocalDateTime(survey.endDate) < Date.now()
      ) {
        return STATUS.EXPIRED;
      } else if (
        survey.startDate &&
        serverDateTimeToLocalDateTime(survey.startDate) > Date.now()
      ) {
        return STATUS.SCHEDULED;
      } else {
        return STATUS.ACTIVE;
      }
    default:
      return STATUS.DRAFT;
  }
};

const bgHeader = (status) => {
  switch (status) {
    case STATUS.DRAFT:
      return "#e9db3e";
    case STATUS.CLOSED:
      return "#d32f2f";
    case STATUS.EXPIRED:
      return "#9d4435";
    case STATUS.SCHEDULED:
      return "#607d8b";
    case STATUS.ACTIVE:
      return "#669834";
    default:
      return;
  }
};

const EditableSurveyTitle = ({ survey, onSave, isEditable = true }) => {
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
              <EditIcon sx={{ color: "white" }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};

const EditableSurveyDescription = ({
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
              <EditIcon sx={{ color: "gray" }} />
            </IconButton>
          )}
        </>
      )}
    </Box>
  );
};
export const Survey = ({
  survey,
  example = false,
  onClone,
  onDelete,
  onClose,
  onUpdateTitle,
  onUpdateDescription,
  onUpdateImage,
}) => {
  const { t } = useTranslation("manage");
  const surveyStatus = status(survey);
  const surveyService = useService("survey");
  const designService = useService("design");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const theme = useTheme();

  const handleChangeTitle = (newTitle, revertTitle) => {
    dispatch(setLoading(true));
    surveyService
      .putSurvey({ ...survey, name: newTitle }, survey.id)
      .then(() => {
        onUpdateTitle(survey.id, newTitle);
      })
      .catch((processedError) => {
        if (
          processedError.name == PROCESSED_ERRORS.DUPLICATE_SURVEY_NAME.name
        ) {
          setError(t(`processed_errors.${processedError.name}`));
          setOpenSnackbar(true);
          revertTitle();
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleChangeDescription = (newDescription) => {
    dispatch(setLoading(true));
    surveyService
      .putSurvey({ ...survey, description: newDescription }, survey.id)
      .then(() => {
        onUpdateDescription(survey.id, newDescription);
      })
      .catch((processedError) => {})
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleImageUpload = (event) => {
    const image = event.target.files[0];
    const fileName = image.name;
    const reader = new FileReader();

    reader.onload = () => {
      designService
        .uploadResource(image, survey.id)
        .then((response) => {
          surveyService
            .putSurvey({ image: response.name }, survey.id)
            .then((result) => {
              onUpdateImage(survey.id, response.name);
            })
            .catch((err) => {
              setError(t(`processed_errors.${err.name}`));
              setOpenSnackbar(true);
            })
            .finally(() => {
              dispatch(setLoading(false));
            });
        })
        .catch((err) => {
          setError(t(`processed_errors.${err.name}`));
          setOpenSnackbar(true);
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    };

    reader.readAsDataURL(image);
  };

  return (
    <>
      <SavingSurvey />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Card
        sx={{
          "&:hover": {
            boxShadow: (theme) => theme.customShadows.z24,
          },
        }}
      >
        <Stack sx={{ pb: 0 }}>
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            <Box className={styles.relativeContainer}>
              <Box className={styles.absoluteOverlay}>
                <EditableSurveyTitle
                  survey={survey}
                  onSave={handleChangeTitle}
                  isEditable={isSurveyAdmin() && !example}
                />
              </Box>

              <Box className={styles.logo}>
                <Box className={`${styles.logoImageWrapper}`}>
                  <CardMedia
                    component="img"
                    image={
                      survey.image
                        ? buildResourceUrl(survey.image, survey.id, example)
                        : "/qlarr.png"
                    }
                    height="150"
                  />
                  <Box className={styles.imageOverlay} />

                  {isSurveyAdmin() && !survey.example && (
                    <Box
                      className={styles.photoIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        document
                          .getElementById(`imageInput-${survey.id}`)
                          .click();
                      }}
                    >
                      <ImageIcon className={styles.cameraIcon} />
                    </Box>
                  )}
                </Box>
                <input
                  id={`imageInput-${survey.id}`}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </Box>
            </Box>

            <EditableSurveyDescription
              survey={survey}
              isExample={example}
              onSave={handleChangeDescription}
              isEditable={isSurveyAdmin() && !example}
            />

            {!example && (
              <>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  sx={{ px: 3, typography: "body2", color: "text.secondary" }}
                >
                  <span
                    style={{
                      backgroundColor: bgHeader(surveyStatus),
                    }}
                    className={styles.badge}
                  ></span>{" "}
                  <Typography
                    variant="subtitle2"
                    className={styles.textTransform}
                  >
                    {t(`status.${surveyStatus}`)}
                  </Typography>
                </Stack>
                <Box sx={{ px: 3, display: "flex", gap: 2 }}>
                  {!example &&
                    survey.status !== "closed" &&
                    survey.latestVersion.published === false && (
                      <Tooltip title="Has unpublished changes">
                        <WarningIcon sx={{ color: "text.secondary" }} />
                      </Tooltip>
                    )}

                  <Tooltip
                    title={`Complete Responses: ${survey.completeResponseCount}`}
                  >
                    <TableRowsIcon sx={{ color: "text.secondary" }} />
                  </Tooltip>
                  <Tooltip
                    title={
                      survey.surveyQuota > 0
                        ? `Quota: ${survey.surveyQuota}`
                        : "No Quota"
                    }
                  >
                    <FormatQuoteIcon sx={{ color: "text.secondary" }} />
                  </Tooltip>
                </Box>
              </>
            )}
          </Stack>

          <Typography variant="caption" sx={{ px: 3, color: "text.disabled" }}>
            <strong>Created</strong>: {fDate(survey.creationDate)}
          </Typography>
          <Typography variant="caption" sx={{ px: 3, color: "text.disabled" }}>
            <strong>Last Modified</strong>: {fDate(survey.lastModified)}
          </Typography>
          {!example && survey.startDate && (
            <Typography
              variant="caption"
              sx={{ px: 3, color: "text.disabled" }}
            >
              <strong>Start Date</strong>: {fDate(survey.startDate)}
            </Typography>
          )}

          {!example && survey.endDate && (
            <Typography
              variant="caption"
              sx={{ px: 3, color: "text.disabled" }}
            >
              <strong>End Date</strong>: {fDate(survey.endDate)}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ borderStyle: "dashed", my: 1 }} />

        <Stack
          sx={{
            p: 3,
            pt: 0,
            typography: "body2",
            color: "text.secondary",
            textTransform: "capitalize",
          }}
          className={styles.surveyActions}
        >
          <IconButton
            className={styles.iconButton}
            sx={{
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main, // Retain the same background color on hover
              },
            }}
            aria-label="redirect"
            size="large"
            onClick={(e) => {
              e.stopPropagation();
              const targetUrl = survey.example
                ? `/guest/preview/${survey.id}`
                : `/design-survey/${survey.id}`;
              navigate(targetUrl);
            }}
          >
            {!example ? (
              <ArticleIcon sx={{ color: "#fff" }} />
            ) : (
              <VisibilityIcon sx={{ color: "#fff" }} />
            )}
          </IconButton>
          {isSurveyAdmin() && !example && survey.status === "active" && (
            <Tooltip title={t("edit_survey.close_title")}>
              <IconButton
                className={styles.iconButton}
                aria-label="stop"
                size="large"
                onClick={() => onClose(survey.id)}
              >
                <Stop color="primary" />
              </IconButton>
            </Tooltip>
          )}
          {isSurveyAdmin() && (
            <Tooltip title={t("edit_survey.clone_survey")}>
              <IconButton
                className={styles.iconButton}
                aria-label="clone"
                size="large"
                onClick={onClone}
              >
                <FileCopyIcon color="primary" />
              </IconButton>
            </Tooltip>
          )}

          {!example && survey.status !== STATUS.ACTIVE && (
            <Tooltip title={t("action_btn.delete")}>
              <IconButton
                className={styles.iconButton}
                aria-label="delete"
                size="large"
                onClick={() => onDelete(survey.id)}
              >
                <DeleteIcon color="primary" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Card>
    </>
  );
};
