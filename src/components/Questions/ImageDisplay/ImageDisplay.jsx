import { buildResourceUrl } from "~/networking/common";

function ImageDisplay(props) {
  const imageUrl = props.component.resources?.imageUrl
    ? buildResourceUrl(props.component.resources.imageUrl)
    : "";
  return (
    props.component.resources?.imageUrl && (
      <div style={{ textAlign: "center" }}>
        <img
          style={{
            width:"100%",
            maxWidth:"100%"
          }}
          src={imageUrl}
        />
      </div>
    )
  );
}

export default ImageDisplay;
