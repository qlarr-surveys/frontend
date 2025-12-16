import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { shallowEqual, useSelector } from 'react-redux';

const MapQuestion = React.memo(({ component }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const mapInitialized = useRef(false);

  

  const visibleAnswers  = useSelector(
    (state) =>
      component.answers.filter((ans) => {
        return state.runState.values[ans.qualifiedCode]?.relevance ?? true;
      }),
    shallowEqual
  );

  const state = useSelector((state) => {
    let valuesMap = {};
    visibleAnswers.forEach((element) => {
      valuesMap[element.qualifiedCode] =
        state.runState.values[element.qualifiedCode].value;
    });
    return valuesMap;
  }, shallowEqual);
  console.log("component", component);
  console.log("visibleAnswers", visibleAnswers);
  console.log("state", state);

  // Force use of test markers
  const availableMarkers = [
    { code: "test_1", text: "Test 1" },
    { code: "test_2", text: "Test 2" },
    { code: "test_3", text: "Test 3" },
  ];

  // Remove debounced save to prevent any Redux updates

  useEffect(() => {
    // Prevent multiple initializations
    if (mapInitialized.current) {
      return;
    }

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default;

        // Import CSS and ensure it loads properly
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);

          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve; // Continue even if CSS fails to load
            setTimeout(resolve, 2000); // Fallback timeout
          });
        }

        // Fix default markers with proper configuration
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41],
        });

        if (mapRef.current && !leafletMapRef.current) {
          // Create the map
          const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          // Click handler with Test 1, 2, 3 naming - no React state
          map.on("click", (e) => {
            const { lat, lng } = e.latlng;

            // Count existing markers to determine name
            const currentMarkerCount = Object.keys(markersRef.current).length;

            if (currentMarkerCount >= 3) {
              alert("Maximum 3 markers allowed!");
              return;
            }

            // Get marker name
            const markerName = availableMarkers[currentMarkerCount].text;

            // Create marker
            const marker = L.marker([lat, lng]).addTo(map);

            // Store in ref for counting
            const markerKey = `${lat},${lng}`;
            markersRef.current[markerKey] = { marker, markerName };

            // Create popup with edit/remove buttons
            const popupContent = `
              <div style="min-width: 200px;">
                <div><strong>${markerName}</strong></div>
                <div>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div>
                <div style="margin-top: 8px;">
                  <button onclick="editMarker('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
                  <button onclick="removeMarker('${markerKey}', event)" style="padding: 4px 8px;">Remove</button>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent).openPopup();
          });

          // Global functions for popup buttons - no React state involved
          window.editMarker = (markerKey, event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            const markerData = markersRef.current[markerKey];
            if (!markerData) return;

            const marker = markerData.marker;
            const pos = marker.getLatLng();

            const editContent = `
              <div style="min-width: 200px;">
                <div><strong>${markerData.markerName}</strong></div>
                <div style="margin: 8px 0;">
                  <div>Latitude:</div>
                  <input type="number" id="edit-lat-${markerKey}" value="${pos.lat.toFixed(
              6
            )}" step="0.000001" style="width: 100%; margin-bottom: 4px;" />
                  <div>Longitude:</div>
                  <input type="number" id="edit-lng-${markerKey}" value="${pos.lng.toFixed(
              6
            )}" step="0.000001" style="width: 100%;" />
                </div>
                <div style="margin-top: 8px;">
                  <button onclick="saveMarker('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Save</button>
                  <button onclick="cancelEdit('${markerKey}', event)" style="padding: 4px 8px;">Cancel</button>
                </div>
              </div>
            `;

            marker.setPopupContent(editContent);
          };

          window.saveMarker = (markerKey, event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            const markerData = markersRef.current[markerKey];
            if (!markerData) return;

            const marker = markerData.marker;
            const newLat = parseFloat(
              document.getElementById(`edit-lat-${markerKey}`).value
            );
            const newLng = parseFloat(
              document.getElementById(`edit-lng-${markerKey}`).value
            );

            if (isNaN(newLat) || isNaN(newLng)) return;

            // Update marker position
            marker.setLatLng([newLat, newLng]);

            // Update ref key
            delete markersRef.current[markerKey];
            const newKey = `${newLat},${newLng}`;
            markersRef.current[newKey] = markerData;

            // Reset popup to view mode
            const viewContent = `
              <div style="min-width: 200px;">
                <div><strong>${markerData.markerName}</strong></div>
                <div>Lat: ${newLat.toFixed(6)}<br>Lng: ${newLng.toFixed(
              6
            )}</div>
                <div style="margin-top: 8px;">
                  <button onclick="editMarker('${newKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
                  <button onclick="removeMarker('${newKey}', event)" style="padding: 4px 8px;">Remove</button>
                </div>
              </div>
            `;

            marker.setPopupContent(viewContent);
          };

          window.cancelEdit = (markerKey, event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            const markerData = markersRef.current[markerKey];
            if (!markerData) return;

            const marker = markerData.marker;
            const pos = marker.getLatLng();

            const viewContent = `
              <div style="min-width: 200px;">
                <div><strong>${markerData.markerName}</strong></div>
                <div>Lat: ${pos.lat.toFixed(6)}<br>Lng: ${pos.lng.toFixed(
              6
            )}</div>
                <div style="margin-top: 8px;">
                  <button onclick="editMarker('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
                  <button onclick="removeMarker('${markerKey}', event)" style="padding: 4px 8px;">Remove</button>
                </div>
              </div>
            `;

            marker.setPopupContent(viewContent);
          };

          window.removeMarker = (markerKey, event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            const markerData = markersRef.current[markerKey];
            if (!markerData) return;

            // Remove from map and ref - no React state updates
            map.removeLayer(markerData.marker);
            delete markersRef.current[markerKey];
          };

          leafletMapRef.current = map;
          mapInitialized.current = true; // Mark as initialized
          console.log("Map reference set:", !!leafletMapRef.current); // Debug log
        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current = {};
      mapInitialized.current = false; // Reset initialization flag
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <Box
      sx={{
        width: "100%",
        height: "400px",
        mt: 2,
        border: "1px solid #007bff",
        borderRadius: 1,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={mapRef}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#f8f9fa",
        }}
      />

      {/* Available markers display - static version to avoid re-renders */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
          fontSize: "12px",
          maxWidth: "200px",
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          Available Markers:
        </Typography>
        <Typography variant="caption" display="block">
          Click on map to add Test 1, 2, 3
        </Typography>
      </Box>

      {/* Marker info removed to prevent re-renders */}
    </Box>
  );
});

MapQuestion.displayName = "MapQuestion";

export default MapQuestion;
