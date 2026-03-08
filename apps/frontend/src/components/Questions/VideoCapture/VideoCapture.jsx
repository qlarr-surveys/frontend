import { Box } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { previewUrlByFilename, uploadFile } from "~/networking/run";
import { valueChange } from "~/state/runState";
import styles from "./VideoCapture.module.css";
import ReactPlayer from "react-player";
import { getFileFromPath } from "~/networking/common";
import { useService } from "~/hooks/use-service";

function VideoCapture(props) {
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
    const validationMaxSize =
      (component.validation?.validation_max_file_size?.isActive &&
        component.validation?.validation_max_file_size?.max_size) ||
      -1;
    
    // Limit to validation value or 10MB (10240 KB), whichever is smaller
    const IMAGE_MAX_SIZE_KB = 10240; // 10MB
    const maxFileSize = validationMaxSize > 0 
      ? Math.min(validationMaxSize, IMAGE_MAX_SIZE_KB)
      : IMAGE_MAX_SIZE_KB;
    
    if (preview && mode == "offline") {
      getFileFromPath("/dummy_video.mp4").then((response) => {
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
      window["Android"].captureVideo(code, maxFileSize);
      window["onVideoCaptured" + code] = (value) => {
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
    <Box className={styles.container}>
      {!state.value || !state.value.stored_filename ? (
        <img
          onClick={onImageClick}
          src="/video.png"
          style={{
            maxHeight: "200px",
          }}
        />
      ) : (
        <div
          style={{
            position: "relative",
            marginTop: "16px",
            // 16:9 aspect ratio
            paddingTop: "56%",
          }}
        >
          <ReactPlayer
            url={previewUrlByFilename(state.value.stored_filename)}
            loop={false}
            light={true}
            controls={true}
            config={{
              forceAudio: false,
            }}
            style={{
              backgroundColor: "black",
              position: "absolute",
              top: "0",
              left: "0",
            }}
            volume={1}
            width="100%"
            height="100%"
          />
        </div>
      )}
      <br />
      {component.showHint && <span>{component.content?.hint}</span>}
    </Box>
  );
}

export default VideoCapture;
