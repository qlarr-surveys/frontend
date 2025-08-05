import { Box } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { previewUrlByFilename, uploadFile } from "~/networking/run";
import { valueChange } from "~/state/runState";
import styles from "./PhotoCapture.module.css";
import { getFileFromPath } from '~/networking/common';
import { useService } from "~/hooks/use-service";

function PhotoCapture(props) {
  const runService = useService("run");
  const component = props.component;
  const state = useSelector((state) => {
    return state.runState.values[component.qualifiedCode];
  });
  const preview = useSelector((state) => {
    return state.runState.preview;
  });

  const mode = useSelector((state) => {
    return state.runState.values.Survey.mode;
  });

  const dispatch = useDispatch();

  const onImageClick = () => {
    const code = component.qualifiedCode;
    const maxFileSize = (component.validation?.validation_max_file_size?.isActive &&
      component.validation?.validation_max_file_size?.max_size) || -1;
    if (preview && mode == "offline") {
      getFileFromPath("/dummy_image.png").then((response) => {
        uploadFile(runService, code, preview, response)
          .then((response) => {
            dispatch(
              valueChange({
                componentCode: props.component.qualifiedCode,
                value: response,
              })
            );
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else if (window["Android"]) {
      window["Android"].capturePhoto(code, maxFileSize);
      window["onPhotoCaptured" + code] = (value) => {
        dispatch(
          valueChange({
            componentCode: code,
            value,
          })
        );
      };
    } else {
      console.debug("no android device!!");
    }
  };

  return (
    <Box className={styles.container} sx={{ maxHeight: "400px" }}>
      {!state.value || !state.value.stored_filename ? (
        <img
          onClick={onImageClick}
          src="/camera.png"
          style={{
            maxHeight: "200px",
            maxWidth: "100%",
          }}
        />
      ) : (
        <img
          onClick={onImageClick}
          src={previewUrlByFilename(state.value.stored_filename)}
          style={{
            maxHeight: "400px",
            maxWidth: "100%",
          }}
        />
      )}
      <br />
      {component.showHint && <span>{component.content?.hint}</span>}
    </Box>




  );
}

export default PhotoCapture;
