import {
  Typography,
  IconButton,
  Card,
  Stack,
  Divider,
  Snackbar,
  Alert,
  Box,
  CardMedia,
  Badge,
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
import WarningIcon from "@mui/icons-material/Warning";
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
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { EditableSurveyTitle } from "./EditableSurveyTitle";
import { EditableSurveyDescription } from "./EditableSurveyDescription";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import NumbersIcon from "@mui/icons-material/Numbers";

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

const Survey = ({
  survey,
  highlight,
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
        className={`${highlight ? styles.highlight : ""}`}
      >
        <Stack sx={{ pb: 0 }}>
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            <Box className={styles.relativeContainer}>
              <Box className={styles.absoluteOverlay}>
                <EditableSurveyTitle
                  survey={survey}
                  onSave={handleChangeTitle}
                  isEditable={isSurveyAdmin()}
                />
              </Box>

              <Box className={styles.logo}>
                <Box className={`${styles.logoImageWrapper}`}>
                  <CardMedia
                    component="img"
                    image={
                      survey.image
                        ? buildResourceUrl(survey.image, survey.id)
                        : "/qlarr.png"
                    }
                    height="150"
                  />
                  <Box className={styles.imageOverlay} />

                  {isSurveyAdmin() && (
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
              onSave={handleChangeDescription}
              isEditable={isSurveyAdmin()}
            />

            {(
              <>
                <div className={styles.statusAndIcons}>
                  <CustomTooltip
                    showIcon={false}
                    title={t(`edit_survey.${surveyStatus}_mode`)}
                  >
                    <div className={styles.statusBadge}>
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
                    </div>
                  </CustomTooltip>

                  <div className={styles.statusIcons}>
                    {survey.status !== "closed" &&
                      survey.latestVersion.published === false && (
                        <CustomTooltip
                          title={t("label.unpublished_changes")}
                          showIcon={false}
                        >
                          <WarningIcon sx={{ color: "text.secondary" }} />
                        </CustomTooltip>
                      )}

                    <CustomTooltip
                      showIcon={false}
                      title={t("label.responses", {
                        count: survey.completeResponseCount,
                      })}
                    >
                      <Badge
                        badgeContent={survey.completeResponseCount}
                        color="primary"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <TableRowsIcon sx={{ color: "text.secondary" }} />
                      </Badge>
                    </CustomTooltip>

                    <CustomTooltip
                      showIcon={false}
                      title={
                        survey.surveyQuota > 0
                          ? t("label.quota", { count: survey.surveyQuota })
                          : t("label.no_quota")
                      }
                    >
                      <Badge
                        badgeContent={
                          survey.surveyQuota > 0 ? survey.surveyQuota : 0
                        }
                        color="primary"
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                      >
                        <NumbersIcon sx={{ color: "text.secondary" }} />
                      </Badge>
                    </CustomTooltip>
                  </div>
                </div>
              </>
            )}
          </Stack>

          <Typography variant="caption" sx={{ px: 3, color: "text.disabled" }}>
            <strong>{t("edit_survey.metadata.created")}</strong>: {fDate(survey.creationDate)}
            <span style={{ margin: "0 0.5rem" }}>•</span>
            <strong>{t("edit_survey.metadata.last_modified")}</strong>: {fDate(survey.lastModified)}
          </Typography>
          { survey.startDate && (
            <Typography
              variant="caption"
              sx={{ px: 3, color: "text.disabled" }}
            >
              <strong>{t("edit_survey.metadata.start_date")}</strong>:{" "}
              {fDate(survey.startDate)}
            </Typography>
          )}

          {survey.endDate && (
            <Typography
              variant="caption"
              sx={{ px: 3, color: "text.disabled" }}
            >
              <strong>{t("edit_survey.metadata.end_date")}</strong>:{" "}
              {fDate(survey.endDate)}
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
          <CustomTooltip showIcon={false} title={t("edit_survey.title")}>
            <IconButton
              className={styles.iconButton}
              sx={{
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
              aria-label="redirect"
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/design-survey/${survey.id}`);
              }}
            >
              <ArticleIcon sx={{ color: "#fff" }} />
            </IconButton>
          </CustomTooltip>

          {isSurveyAdmin() && survey.status === "active" && (
            <CustomTooltip
              showIcon={false}
              title={t("edit_survey.close_title")}
            >
              <IconButton
                className={styles.iconButton}
                aria-label="stop"
                size="large"
                onClick={() => onClose(survey.id)}
              >
                <Stop color="primary" />
              </IconButton>
            </CustomTooltip>
          )}
          {isSurveyAdmin() && (
            <CustomTooltip
              showIcon={false}
              title={t("edit_survey.clone_survey")}
            >
              <IconButton
                className={styles.iconButton}
                aria-label="clone"
                size="large"
                onClick={onClone}
              >
                <FileCopyIcon color="primary" />
              </IconButton>
            </CustomTooltip>
          )}

          {survey.status !== STATUS.ACTIVE && (
            <CustomTooltip showIcon={false} title={t("action_btn.delete")}>
              <IconButton
                className={styles.iconButton}
                aria-label="delete"
                size="large"
                onClick={() => onDelete(survey.id)}
              >
                <DeleteIcon color="primary" />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
      </Card>
    </>
  );
};

export default Survey;