export const MarkerDisplayPopup = ({ markerName, lat, lng, markerKey, componentId }) => {
  return `
    <div style="min-width: 200px;">
      <div><strong>${markerName}</strong></div>
      <div>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div>
      <div style="margin-top: 8px;">
        <button onclick="removeMarker_${componentId}('${markerKey}', event)" style="padding: 4px 8px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
      </div>
    </div>
  `;
};

export const POPUP_BUTTON_STYLES = {
  primary: "margin-right: 4px; padding: 4px 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;",
  secondary: "padding: 4px 8px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;",
  danger: "padding: 4px 8px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
};