import React, { useState } from "react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { previewUrl, uploadFile } from "~/networking/run";
import { styled, useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import ValidationItem from "~/components/run/ValidationItem";
import { valueChange } from "~/state/runState";
import { setDirty } from "~/state/templateState";
import { useTranslation } from "react-i18next";
import LoadingDots from "~/components/common/LoadingDots";
import { useService } from "~/hooks/use-service";
import { fileTypesToMimesArray } from '~/state/design/addInstructions';

const Input = styled("input")({
  display: "none",
});

function FileUpload(props) {
  const runService = useService("run");
  const theme = useTheme();

  const { t } = useTranslation("run");

  let accepted = fileTypesToMimesArray(
    props.component.validation?.validation_file_types?.fileTypes
  );

  const maxFileSize =
    (props.component.validation?.validation_max_file_size?.isActive &&
      props.component.validation?.validation_max_file_size?.max_size) ||
    -1;

  const state = useSelector((state) => {
    let questionState = state.runState.values[props.component.qualifiedCode];
    return questionState?.value;
  });

  const preview = useSelector((state) => {
    return state.runState.preview;
  });

  const isPreviewMode = useSelector((state)=>{
    return state.runState.data?.survey.isPreviewMode;
  })

  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState();
  const [isUploading, setUploading] = useState(false);

  const previewAndroid = () => {
    window["Android"].previewFileUpload(state.stored_filename, state.filename);
  };

  const invalidSelectedFile =
    !isUploading &&
    selectedFile &&
    accepted.length > 0 &&
    !accepted.includes(selectedFile.type);

  const invalidSize =
    !isUploading &&
    selectedFile &&
    maxFileSize > 0 &&
    selectedFile.size / 1024 > maxFileSize;

  const changeHandler = (event) => {
    dispatch(setDirty(props.component.qualifiedCode));
    setSelectedFile(event.target.files[0]);
  };

  const uploadSelectedFile = () => {
    setUploading(true);
    uploadFile(runService, props.component.qualifiedCode, preview, selectedFile)
      .then((response) => {
        setUploading(false);
        resetSelectedFile();
        dispatch(
          valueChange({
            componentCode: props.component.qualifiedCode,
            value: response,
          })
        );
      })
      .catch((err) => {
        setUploading(false);
        console.error(err);
      });
  };
  const resetSelectedFile = () => {
    setSelectedFile(undefined);
  };

  const onButtonClick = (event) => {
    if (window["Android"]) {
      const code = props.component.qualifiedCode;
      event.preventDefault();
      window["Android"].selectFile(
        code,
        accepted?.join(",") || "",
        maxFileSize || -1
      );
      window["onFileSelected" + code] = (name, size, type) => {
        dispatch(setDirty(props.component.qualifiedCode));
        setSelectedFile({ name, size, type });
      };
    }
  };

  let shouldUpload = selectedFile && !invalidSelectedFile && !invalidSize;

  return (
    <div>
      <label htmlFor="contained-button-file">
        <Input
          id="contained-button-file"
          type="file"
          accept={accepted ? accepted.join(",") : undefined}
          onChange={changeHandler}
          disabled={isPreviewMode}
        />
        <Button
          disabled={isUploading || isPreviewMode}
          onClick={onButtonClick}
          variant="contained"
          component="span"
        >
          {t("choose_file")}
        </Button>
      </label>
      {!selectedFile ? (
        ""
      ) : (
        <React.Fragment>
          <span>
            &nbsp;{selectedFile.name} - {Math.round(selectedFile.size / 1024)}K
          </span>
          {shouldUpload ? (
            <Button
              disabled={isUploading || isPreviewMode}
              variant="text"
              onClick={uploadSelectedFile}
            >
              {t("upload")}
            </Button>
          ) : (
            ""
          )}
          <Button
            disabled={isUploading || isPreviewMode}
            sx={{
              fontFamily: theme.textStyles.text.font,
              fontSize: theme.textStyles.text.size,
            }}
            variant="text"
            onClick={resetSelectedFile}
          >
            {t("cancel")}
          </Button>
        </React.Fragment>
      )}

      {invalidSize && (
        <React.Fragment>
          <br />
          <ValidationItem
            name="validation_max_file_size"
            validation={props.component.validation?.validation_max_file_size}
          />
        </React.Fragment>
      )}

      {invalidSelectedFile && (
        <React.Fragment>
          <br />
          <ValidationItem
            name="validation_file_types"
            validation={props.component.validation?.validation_file_types}
          />
        </React.Fragment>
      )}

      {isUploading ? (
        <div style={{ textAlign: "center" }}>
          <LoadingDots />
          <br />
          <span>{t("uploading")}</span>
        </div>
      ) : !state || !state.stored_filename ? (
        ""
      ) : (
        <React.Fragment>
          <br />
          <br />
          {window["Android"] ? (
            <Link target="_blank" onClick={previewAndroid}>
              {state.filename} - {Math.round(state.size / 1024)}K
            </Link>
          ) : (
            <Link target="_blank" href={previewUrl(state.stored_filename)}>
              {state.filename} - {Math.round(state.size / 1024)}K
            </Link>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export default FileUpload;
