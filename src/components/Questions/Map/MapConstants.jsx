export const MARKER_OPTIONS = {
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
};

export const isValidLocation = (value) =>
  value && Array.isArray(value) && value.length === 2;

export const markerPopupContent = (answer, lat, lng, remove) => `<div>
    <div style="font-size:larger"><strong>${
      answer.content?.label || answer.qualifiedCode
    }</strong></div>
    <div><strong>Lat</strong>: ${lat.toFixed(
      6
    )}<br><strong>Lng</strong>: ${lng.toFixed(6)}</div>
    <button 
      type="button" 
      id="remove-marker-${answer.qualifiedCode}" 
      style="
        background: none;
        border: none;
        color: inherit;
        text-decoration: underline;
        cursor: pointer;
        padding: 0;
        font: inherit;
        margin-top: 8px;
      "
    >
      ${remove}
    </button>
  </div>
`;
