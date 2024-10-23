import { useTheme } from "@emotion/react";
import { buildResourceUrl } from "~/networking/common";
import ReactPlayer from "react-player";

function VideoDisplay(props) {
  const videUrl = props.component.resources?.videoUrl
    ? buildResourceUrl(props.component.resources.videoUrl)
    : "";
  const theme = useTheme();
  return (
    props.component.resources?.videoUrl && (
      <div
        style={{
          position: "relative",
          marginTop: "16px",
          // 16:9 aspect ratio
          paddingTop: props.component.audio_only ? "10%" : "56%",
        }}
      >
        <ReactPlayer
          url={videUrl}
          loop={props.component.loop || false}
          light={true}
          controls={true}
          config={{
            forceAudio: props.component.audio_only || false,
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
    )
  );
}

export default VideoDisplay;
