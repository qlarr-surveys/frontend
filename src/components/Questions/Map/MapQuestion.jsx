import React, { useEffect, useRef, useCallback, useState } from "react";
import { Box, Typography } from "@mui/material";
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { valueChange } from "~/state/runState";
import { runStore } from "../../../store";

const MapQuestion = React.memo(({ component }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const mapInitialized = useRef(false);
  
  // Force update state for buttons only
  const [buttonUpdate, setButtonUpdate] = useState(0);
  const forceButtonUpdate = () => setButtonUpdate(prev => prev + 1);

  // Manually update navigation buttons without React re-render
  const updateNavigationButtons = () => {
    const container = document.getElementById('navigation-buttons-container');
    if (!container) {
      console.log("Navigation buttons container not found");
      return;
    }

    // Clear existing buttons
    container.innerHTML = '';

    // Get current state and create buttons
    const currentState = runStore.getState();
    let hasButtons = false;
    
    visibleAnswers.forEach(answer => {
      const storedValue = currentState.runState?.values?.[answer.qualifiedCode]?.value;
      if (storedValue && Array.isArray(storedValue) && storedValue.length === 2) {
        const answerText = answer.content?.label || answer.code;
        
        const button = document.createElement('button');
        button.textContent = answerText;
        button.style.cssText = `
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          min-width: 120px;
          margin-bottom: 8px;
        `;
        
        button.onclick = () => handleNavigateToMarker(answer.qualifiedCode);
        container.appendChild(button);
        hasButtons = true;
      }
    });
    
    console.log("Updated navigation buttons:", hasButtons);
  };

  

  const visibleAnswers  = useSelector(
    (state) =>
      component?.answers?.filter((ans) => {
        return state.runState.values[ans.qualifiedCode]?.relevance ?? true;
      }) || [],
    shallowEqual
  );

  const dispatch = useDispatch();

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

  // Handle navigation button clicks without causing re-renders
  const handleNavigateToMarker = (answerCode) => {
    const currentState = runStore.getState();
    const coordinates = currentState.runState?.values?.[answerCode]?.value;
    
    if (coordinates && Array.isArray(coordinates) && leafletMapRef.current) {
      leafletMapRef.current.flyTo([coordinates[0], coordinates[1]], 15, { duration: 1 });
    }
  };

  // Force use of test markers
  const availableMarkers = [
    { code: "test_1", text: "Test 1" },
    { code: "test_2", text: "Test 2" },
    { code: "test_3", text: "Test 3" },
  ];

  // Define componentId at component level for access across all effects
  const componentId = component.qualifiedCode;

  // Global functions for popup buttons with access to component variables
  useEffect(() => {
    window[`editMarker_${componentId}`] = (markerKey, event) => {
      console.log("editMarker called with:", markerKey);
      console.log("Available marker keys:", Object.keys(markersRef.current));
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const markerData = markersRef.current[markerKey];
      console.log("markerData:", markerData);
      if (!markerData) {
        console.log("No marker data found for key:", markerKey);
        return;
      }

      const marker = markerData.marker;
      const pos = marker.getLatLng();
      console.log("Marker position:", pos);

      const editContent = `
        <div style="min-width: 200px;">
          <div><strong>${markerData.markerName}</strong></div>
          <div style="margin: 8px 0;">
            <label>Lat: </label>
            <input type="number" id="edit-lat-${componentId}-${markerKey}" value="${pos.lat.toFixed(6)}" step="0.000001" style="width: 100px;">
          </div>
          <div style="margin: 8px 0;">
            <label>Lng: </label>
            <input type="number" id="edit-lng-${componentId}-${markerKey}" value="${pos.lng.toFixed(6)}" step="0.000001" style="width: 100px;">
          </div>
          <div style="margin-top: 8px;">
            <button onclick="saveEdit_${componentId}('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Save</button>
            <button onclick="cancelEdit_${componentId}('${markerKey}', event)" style="padding: 4px 8px;">Cancel</button>
          </div>
        </div>
      `;

      marker.setPopupContent(editContent);
    };

    window[`removeMarker_${componentId}`] = (markerKey, event) => {
      console.log("removeMarker called with:", markerKey);
      console.log("Available marker keys:", Object.keys(markersRef.current));
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const markerData = markersRef.current[markerKey];
      console.log("markerData for removal:", markerData);
      if (!markerData) {
        console.log("No marker data found for removal:", markerKey);
        return;
      }

      // Find which answer this marker belongs to by checking stored coordinates
      const [lat, lng] = markerKey.split(',').map(Number);
      const matchingAnswer = visibleAnswers.find(answer => {
        const storedValue = state[answer.qualifiedCode];
        return storedValue && Array.isArray(storedValue) && storedValue[0] === lat && storedValue[1] === lng;
      });

      // Clear the value from Redux
      if (matchingAnswer) {
        console.log(`Removing marker from answer ${matchingAnswer.qualifiedCode}, setting to null`);
        dispatch(
          valueChange({
            componentCode: matchingAnswer.qualifiedCode,
            value: null,
          })
        );
        console.log("Dispatch completed for marker removal");
      } else {
        console.log("No matching answer found for marker removal");
      }

      // Remove from map and ref
      if (leafletMapRef.current) {
        leafletMapRef.current.removeLayer(markerData.marker);
      }
      delete markersRef.current[markerKey];
      
      // Force update buttons to hide removed marker (not needed with direct React rendering)
    };

    window[`saveEdit_${componentId}`] = (markerKey, event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      const newLat = parseFloat(document.getElementById(`edit-lat-${componentId}-${markerKey}`).value);
      const newLng = parseFloat(document.getElementById(`edit-lng-${componentId}-${markerKey}`).value);

      if (isNaN(newLat) || isNaN(newLng)) {
        alert("Please enter valid coordinates");
        return;
      }

      const markerData = markersRef.current[markerKey];
      if (!markerData) return;

      // Find which answer this marker belongs to
      const [oldLat, oldLng] = markerKey.split(',').map(Number);
      const matchingAnswer = visibleAnswers.find(answer => {
        const storedValue = state[answer.qualifiedCode];
        return storedValue && storedValue === `${oldLat},${oldLng}`;
      });

      // Update marker position
      const marker = markerData.marker;
      marker.setLatLng([newLat, newLng]);

        // Update Redux with new coordinates
        if (matchingAnswer) {
          dispatch(
            valueChange({
              componentCode: matchingAnswer.qualifiedCode,
              value: [newLat, newLng],
            })
          );
        }

        // Update marker key in ref
        delete markersRef.current[markerKey];
        const newKey = `${newLat},${newLng}`;
        markersRef.current[newKey] = { 
          marker, 
          markerName: markerData.markerName,
          answerCode: markerData.answerCode 
        };

      // Reset popup to view mode
      const viewContent = `
        <div style="min-width: 200px;">
          <div><strong>${markerData.markerName}</strong></div>
          <div>Lat: ${newLat.toFixed(6)}<br>Lng: ${newLng.toFixed(6)}</div>
          <div style="margin-top: 8px;">
            <button onclick="editMarker_${componentId}('${newKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
            <button onclick="removeMarker_${componentId}('${newKey}', event)" style="padding: 4px 8px;">Remove</button>
          </div>
        </div>
      `;

      marker.setPopupContent(viewContent);
    };

    window[`cancelEdit_${componentId}`] = (markerKey, event) => {
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
          <div>Lat: ${pos.lat.toFixed(6)}<br>Lng: ${pos.lng.toFixed(6)}</div>
          <div style="margin-top: 8px;">
            <button onclick="editMarker_${componentId}('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
            <button onclick="removeMarker_${componentId}('${markerKey}', event)" style="padding: 4px 8px;">Remove</button>
          </div>
        </div>
      `;

      marker.setPopupContent(viewContent);
    };
  }, [dispatch, state, visibleAnswers]);

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

          // Click handler - place markers in available slots
          map.on("click", (e) => {
            const { lat, lng } = e.latlng;

            // Find first available answer (one without a saved value and no existing marker)
            const availableAnswer = visibleAnswers.find(answer => {
              const storedValue = state[answer.qualifiedCode];
              console.log(`Checking answer ${answer.qualifiedCode}, storedValue:`, storedValue);
              
              // Check if already has a value in Redux
              const hasReduxValue = storedValue && Array.isArray(storedValue) && storedValue.length === 2;
              
              // Check if already has a marker in ref (to prevent rapid clicks)
              const hasMarkerInRef = Object.values(markersRef.current).some(markerData => 
                markerData.answerCode === answer.qualifiedCode
              );
              
              const isAvailable = !hasReduxValue && !hasMarkerInRef;
              console.log(`Answer ${answer.qualifiedCode} - hasReduxValue: ${hasReduxValue}, hasMarkerInRef: ${hasMarkerInRef}, isAvailable: ${isAvailable}`);
              return isAvailable;
            });

            console.log("Available answer found:", availableAnswer);
            if (!availableAnswer) {
              console.log("No available answers, current state:", state);
              alert(`Maximum ${visibleAnswers.length} markers allowed!`);
              return;
            }

            // Get marker name from the available answer
            const markerLabel = availableAnswer.content?.label || availableAnswer.code;
            const markerName = typeof markerLabel === 'string' && markerLabel.includes('<') 
              ? markerLabel.replace(/<[^>]*>/g, '') // Remove HTML tags
              : markerLabel;

            // Create marker
            const marker = L.marker([lat, lng]).addTo(map);

            // Save marker location to Redux store
            dispatch(
              valueChange({
                componentCode: availableAnswer.qualifiedCode,
                value: [lat, lng],
              })
            );

            // Force update buttons to show new marker (not needed with direct React rendering)

            // Store in ref for counting and tracking
            const markerKey = `${lat},${lng}`;
            markersRef.current[markerKey] = { 
              marker, 
              markerName,
              answerCode: availableAnswer.qualifiedCode 
            };
            
            console.log("Stored marker with key:", markerKey);
            console.log("markersRef.current now contains:", Object.keys(markersRef.current));

            // Create popup with edit/remove buttons
            const popupContent = `
              <div style="min-width: 200px;">
                <div><strong>${markerName}</strong></div>
                <div>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div>
                <div style="margin-top: 8px;">
                  <button onclick="editMarker_${componentId}('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
                  <button onclick="removeMarker_${componentId}('${markerKey}', event)" style="padding: 4px 8px;">Remove</button>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent).openPopup();
          });

          leafletMapRef.current = map;

          // Restore markers from saved coordinates
          visibleAnswers.forEach((answer) => {
            const storedValue = state[answer.qualifiedCode];
            if (storedValue && Array.isArray(storedValue) && storedValue.length === 2) {
              const [lat, lng] = storedValue;
              const markerLabel = answer.content?.label || answer.code;
              const markerName = typeof markerLabel === 'string' && markerLabel.includes('<') 
                ? markerLabel.replace(/<[^>]*>/g, '') // Remove HTML tags
                : markerLabel;
              
              // Create restored marker
              const marker = L.marker([lat, lng]).addTo(map);
              
              // Store in ref
              const markerKey = `${lat},${lng}`;
              markersRef.current[markerKey] = { 
                marker, 
                markerName,
                answerCode: answer.qualifiedCode 
              };

              // Create popup with edit/remove buttons
              const popupContent = `
                <div style="min-width: 200px;">
                  <div><strong>${markerName}</strong></div>
                  <div>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div>
                  <div style="margin-top: 8px;">
                    <button onclick="editMarker_${componentId}('${markerKey}', event)" style="margin-right: 4px; padding: 4px 8px;">Edit</button>
                    <button onclick="removeMarker_${componentId}('${markerKey}', event)" style="padding: 4px 8px;">Remove</button>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent);
            }
          });

          mapInitialized.current = true; // Mark as initialized
          console.log("Map reference set:", !!leafletMapRef.current); // Debug log

          // Update navigation buttons after initialization (not needed with direct React rendering)
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

      {/* Navigation Buttons - Simple approach */}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1000,
        }}
      >
        {visibleAnswers.map((answer) => {
          // Extract plain text from HTML content
          const answerLabel = answer.content?.label || answer.code;
          const answerText = typeof answerLabel === 'string' && answerLabel.includes('<') 
            ? answerLabel.replace(/<[^>]*>/g, '') // Remove HTML tags
            : answerLabel;
          
          const storedValue = state[answer.qualifiedCode];
          
          // Only show button if marker is saved
          if (!storedValue || !Array.isArray(storedValue) || storedValue.length !== 2) {
            return null;
          }
          
          return (
            <button
              key={answer.qualifiedCode}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (leafletMapRef.current) {
                  leafletMapRef.current.flyTo([storedValue[0], storedValue[1]], 15, { duration: 1 });
                }
              }}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                minWidth: '120px',
              }}
            >
              {answerText}
            </button>
          );
        })}
      </Box>

      {/* Instructions */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: 10,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: 1,
          borderRadius: 1,
          fontSize: "12px",
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          Click on map to add markers
        </Typography>
      </Box>

      {/* Marker info removed to prevent re-renders */}
    </Box>
  );
});

MapQuestion.displayName = "MapQuestion";

export default MapQuestion;
