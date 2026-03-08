import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import styles from "./ManageTranslations.module.css";
import { BaseLanguage } from "~/components/manage/BaseLanguage";
import { useSelector } from "react-redux";
import { AdditionalLanguages } from "~/components/manage/AdditionalLanguages";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import {
  changeLang,
  onAdditionalLangAdded,
  onAdditionalLangRemoved,
  onBaseLangChanged,
} from "~/state/design/designState";
import { LANGUAGE_DEF } from "~/constants/language";

function ManageTranslations({ onManageTranslationsClose, onStartTranslation }) {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={true}
      onClose={onManageTranslationsClose}
    >
      <DialogTitle>
        {t("translations.title")}{" "}
        <IconButton
          aria-label="close"
          onClick={onManageTranslationsClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ManageLanguages
          onTranlsationStarted={() => {
            onManageTranslationsClose();
            onStartTranslation();
          }}
          onManageTranslationsClose={onManageTranslationsClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export function ManageLanguages() {
  const { t } = useTranslation(NAMESPACES.MANAGE);
  const dispatch = useDispatch();

  const langInfo = useSelector((state) => {
    return state.designState.langInfo;
  });

  const lang = langInfo?.lang;

  const allLang = langInfo?.languagesList || [];
  const additionalLanguages = allLang.filter(
    (e) => langInfo.mainLang != e.code
  );

  const additionalLanguagesCodes = additionalLanguages.map((e) => e.code);

  const onBaseLanguageChanged = (e) => {
    dispatch(onBaseLangChanged(LANGUAGE_DEF[e.target.value]));
  };

  const onAdditionalLanguagesChanged = (e) => {
    if (e.target.checked) {
      dispatch(onAdditionalLangAdded(LANGUAGE_DEF[e.target.name]));
    } else {
      dispatch(onAdditionalLangRemoved(LANGUAGE_DEF[e.target.name]));
    }
  };

  return (
    <Box sx={{ paddingTop: "8px" }} className={styles.blockItem}>
      <BaseLanguage
        onBaseLanguageChanged={onBaseLanguageChanged}
        baseLanguage={langInfo.mainLang}
      />
      <br />
      <AdditionalLanguages
        onAdditionalLanguagesChanged={onAdditionalLanguagesChanged}
        additionalLanguages={additionalLanguagesCodes}
        baseLanguage={langInfo.mainLang}
      />
      {allLang.length > 1 && (
        <>
          <Typography
            sx={{ marginTop: "16px", marginBottom: "8px", fontSize: "1em" }}
          >
            {t("translations.translate_to")}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="label-base-language">{t("translations.language")}</InputLabel>
            <Select
              id="ChangeLang"
              value={lang}
              label={t("translations.design_language")}
              onChange={(event) => {
                dispatch(changeLang(event.target.value));
              }}
            >
              {allLang.map((lang, index) => (
                <MenuItem key={index} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );
}

export default ManageTranslations;