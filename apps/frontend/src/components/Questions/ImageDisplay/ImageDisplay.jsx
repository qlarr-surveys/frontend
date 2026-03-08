import { buildResourceUrl } from "~/networking/common";

function ImageDisplay(props) {
  const imageUrl = props.component.resources?.imageUrl
    ? buildResourceUrl(props.component.resources.imageUrl)
    : "";
  return (
    props.component.resources?.imageUrl && (
      <div style={{ textAlign: "center", padding: "1em" }}>
        <img
          style={{
            width: props.component.imageWidth?.endsWith("%")
              ? props.component.imageWidth
              : undefined,
            maxWidth:"100%"
          }}
          src={imageUrl}
        />
      </div>
    )
  );
}

export default ImageDisplay;
