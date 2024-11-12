import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Fade,
  IconButton,
  Stack,
  TablePagination,
} from "@mui/material";
import TokenService from "~/services/TokenService";
import styles from "./Dashboard.module.css";
import { HeaderContent } from "~/components/manage/HeaderContent";
import { ROLES } from "~/constants/roles";
import { setLoading } from "~/state/edit/editState";
import { useDispatch } from "react-redux";
import TemplateSlider from "~/components/manage/TemplateSlider/TemplateSlider";
import CreateSurvey from "~/components/manage/CreateSurvey/CreateSurvey";
import { PROCESSED_ERRORS } from "~/utils/errorsProcessor";
import { useTranslation } from "react-i18next";
import { Survey } from "~/components/manage/Survey";
import { SurveyClone } from "~/components/manage/SurveyClone";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import DeleteModal from "~/components/common/DeleteModal";
import { Add, Close } from "@mui/icons-material";

function Dashboard() {
  const surveyService = useService("survey");
  const [surveys, setSurveys] = useState(null);
  const [guestSurveys, setGuestSurveys] = useState([]);
  const [fetchingSurveys, setFetchingSurveys] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("last_modified_desc");

  const [openCloneModal, setOpenCloneModal] = useState(false);
  const [cloningSurvey, setCloningSurvey] = useState();

  const dispatch = useDispatch();

  const { t } = useTranslation("manage");

  const processApirror = (e) => {
    setFetchingSurveys(false);
  };

  const fetchSurveys = () => {
    surveyService
      .getAllSurveys(page, perPage, status, sortBy)
      .then((data) => {
        if (data) {
          setFetchingSurveys(false);
          setSurveys(data);
        }
      })
      .catch((e) => processApirror(e));
  };
  useEffect(() => {
    fetchSurveys();
  }, [page, perPage, sortBy, status]);

  useEffect(() => {
    surveyService
      .getGuestsSurveys()
      .then((data) => {
        if (data) {
          const updatedData = data.map((survey) => ({
            ...survey,
            example: true,
          }));
          setGuestSurveys(updatedData);
        }
      })
      .catch((e) => processApirror(e));
  }, []);

  const handleSurveyStatusChange = (id, newStatus) => {
    setSurveys((prevState) => ({
      ...prevState,
      surveys: prevState.surveys.map((survey) =>
        survey.id === id ? { ...survey, status: newStatus } : survey
      ),
    }));
  };

  const shouldShowClickAdd = () => {
    const roles = TokenService.getUser().roles;
    if (
      roles.indexOf(ROLES.SUPER_ADMIN) > -1 ||
      roles.indexOf(ROLES.SURVEY_ADMIN) > -1
    ) {
      return true;
    }
    return false;
  };

  const [description, setDescription] = useState("");
  const [actionType, setActionType] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(t("action_btn.delete"));
  const [isCreateSurveyOpen, setCreateSurveyOpen] = useState(false);
  const [isTemplateSliderOpen, setTemplateSliderOpen] = useState(false);

  const handleButtonClick = () => {
    setCreateSurveyOpen(true);
  };

  const handleTemplateButtonClick = () => {
    setTemplateSliderOpen(true);
  };

  const handleCloseClick = () => {
    setCreateSurveyOpen(false);
  };

  const handleTemplateCloseClick = () => {
    setTemplateSliderOpen(false);
  };
  const onDelete = (survey) => {
    setActionType("delete");
    setTitle(t("action_btn.delete"));
    setSelectedSurvey(survey);
    setDescription(
      t("edit_survey.delete_survey", { survey_name: survey.name })
    );
    setOpen(true);
  };

  const onCloseSurvey = (survey) => {
    setActionType("close");
    setTitle(t("action_btn.close"));
    setSelectedSurvey(survey);
    setDescription(t("edit_survey.close_survey", { survey_name: survey.name }));
    setOpen(true);
  };

  const handleAction = () => {
    if (actionType === "delete") {
      deleteSurvey(selectedSurvey.id);
      setOpen(false);
    } else if (actionType === "close") {
      closeSurvey(selectedSurvey.id);
      setOpen(false);
    }
  };

  const onClone = (survey) => {
    setCloningSurvey(survey);
    setOpenCloneModal(true);
  };

  const deleteSurvey = (id) => {
    dispatch(setLoading(true));
    surveyService
      .deleteSurvey(id)
      .then(() => {
        fetchSurveys();
      })
      .catch((e) => {
        dispatch(setLoading(false));
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const closeSurvey = (id) => {
    dispatch(setLoading(true));
    surveyService
      .closeSurvey(id)
      .then((data) => {
        handleSurveyStatusChange(id, "closed");
      })
      .catch((processedError) => {
        if (processedError.name == PROCESSED_ERRORS.INVALID_SURVEY_DATES.name) {
          setSurveyDateError(t(`processed_errors.${processed.name}`));
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleUpdateSurveyName = (surveyId, newName) => {
    setSurveys((prevSurveys) => {
      const updatedSurveys = prevSurveys.surveys.map((survey) =>
        survey.id === surveyId ? { ...survey, name: newName } : survey
      );
      return {
        ...prevSurveys,
        surveys: updatedSurveys,
      };
    });
  };

  const handleUpdateSurveyDescription = (surveyId, newDescription) => {
    setSurveys((prevSurveys) => {
      const updatedSurveys = prevSurveys.surveys.map((survey) =>
        survey.id === surveyId
          ? { ...survey, description: newDescription }
          : survey
      );
      return {
        ...prevSurveys,
        surveys: updatedSurveys,
      };
    });
  };

  const handleUpdateSurveyImage = (surveyId, newImage) => {
    setSurveys((prevSurveys) => {
      const updatedSurveys = prevSurveys.surveys.map((survey) =>
        survey.id === surveyId ? { ...survey, image: newImage } : survey
      );
      return {
        ...prevSurveys,
        surveys: updatedSurveys,
      };
    });
  };

  return (
    <Box className={styles.mainContainer}>
      <Container>
        <Box className={styles.content}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {shouldShowClickAdd() && !isCreateSurveyOpen && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleButtonClick}
              >
                Survey
              </Button>
            )}
            {shouldShowClickAdd() && !isTemplateSliderOpen && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleTemplateButtonClick}
              >
                Templates
              </Button>
            )}
          </Stack>

          {isCreateSurveyOpen && (
            <Fade in={isCreateSurveyOpen} timeout={300}>
              <div style={{ position: "relative" }}>
                <IconButton
                  onClick={handleCloseClick}
                  aria-label="close"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "black",
                    zIndex: 1,
                  }}
                >
                  <Close color="#000" />
                </IconButton>
                <CreateSurvey onSurveyCreated={fetchSurveys} />
              </div>
            </Fade>
          )}

          <HeaderContent
            filter={status}
            onFilterSelected={(el) => {
              setPage(1);
              setStatus(el.target.value);
            }}
            sort={sortBy}
            onSortSelected={(el) => {
              setPage(1);
              setSortBy(el.target.value);
            }}
          />
          {!fetchingSurveys ? (
            <Box
              sx={{
                mt: 3,
                columnGap: 4,
                display: "grid",
                rowGap: { xs: 4, md: 5 },
                gridTemplateColumns: {
                  xs: "repeat(1, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
              }}
            >
              {surveys?.surveys?.map((survey) => {
                return (
                  <Survey
                    key={survey.id}
                    survey={survey}
                    onStatusChange={handleSurveyStatusChange}
                    onClone={() => onClone(survey)}
                    onDelete={() => onDelete(survey)}
                    onClose={() => onCloseSurvey(survey)}
                    onUpdateTitle={handleUpdateSurveyName}
                    onUpdateDescription={handleUpdateSurveyDescription}
                    onUpdateImage={handleUpdateSurveyImage}
                  />
                );
              })}
            </Box>
          ) : (
            <LoadingDots />
          )}
          {surveys && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 20, 50]}
              component="div"
              labelDisplayedRows={({ from, to, count, page }) => {
                return t("responses.label_displayed_rows", { from, to, count });
              }}
              labelRowsPerPage={t("responses.label_surveys_per_page")}
              count={surveys?.totalCount}
              rowsPerPage={perPage}
              page={page - 1}
              onPageChange={(event, newPage) => {
                setPage(newPage + 1);
              }}
              onRowsPerPageChange={(event) => {
                setPerPage(parseInt(event.target.value, 10));
                setPage(1);
              }}
            />
          )}
        </Box>

        {isTemplateSliderOpen && (
          <Fade in={isTemplateSliderOpen} timeout={300}>
            <div style={{ position: "relative" }}>
              <IconButton
                onClick={handleTemplateCloseClick}
                aria-label="close"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  color: "black",
                  zIndex: 1,
                }}
              >
                <Close color="#000" />
              </IconButton>
              <TemplateSlider
                surveys={guestSurveys}
                onClone={(survey) => onClone(survey)}
              />
            </div>
          </Fade>
        )}
      </Container>
      <SurveyClone
        open={openCloneModal}
        onClose={(cloned) => {
          setOpenCloneModal(false);
          if (cloned) {
            fetchSurveys();
          }
        }}
        survey={cloningSurvey}
      />
      <DeleteModal
        open={open}
        description={description}
        handleClose={() => setOpen(false)}
        handleDelete={handleAction}
        title={title}
      />
    </Box>
  );
}

export default Dashboard;
