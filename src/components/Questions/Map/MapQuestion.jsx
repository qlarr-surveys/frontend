import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { valueChange } from "~/state/runState";
import { MarkerDisplayPopup } from './MarkerPopupComponents';
import { createMapPopupFunctions } from './MapPopupFunctions';

const MapQuestion = React.memo(({ component }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({});
  const mapInitialized = useRef(false);

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

  const componentId = component.qualifiedCode;

  useEffect(() => {
    const cleanupFunctions = createMapPopupFunctions(componentId, {
      markersRef,
      leafletMapRef,
      visibleAnswers,
      state,
      dispatch,
      valueChange
    });

    return cleanupFunctions;
  }, [dispatch, state, visibleAnswers]);

  useEffect(() => {
    if (mapInitialized.current) {
      return;
    }

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);

          await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve;
            setTimeout(resolve, 2000);
          });
        }

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
          const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map);

          map.on("click", (e) => {
            const { lat, lng } = e.latlng;

            const availableAnswer = visibleAnswers.find(answer => {
              const storedValue = state[answer.qualifiedCode];
              console.log(`Checking answer ${answer.qualifiedCode}, storedValue:`, storedValue);
              
              const hasReduxValue = storedValue && Array.isArray(storedValue) && storedValue.length === 2;
              
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

            const markerLabel = availableAnswer.content?.label || availableAnswer.code;
            const markerName = typeof markerLabel === 'string' && markerLabel.includes('<') 
              ? markerLabel.replace(/<[^>]*>/g, '')
              : markerLabel;

            const marker = L.marker([lat, lng]).addTo(map);

            dispatch(
              valueChange({
                componentCode: availableAnswer.qualifiedCode,
                value: [lat, lng],
              })
            );

            const markerKey = `${lat},${lng}`;
            markersRef.current[markerKey] = { 
              marker, 
              markerName,
              answerCode: availableAnswer.qualifiedCode 
            };
            
            console.log("Stored marker with key:", markerKey);
            console.log("markersRef.current now contains:", Object.keys(markersRef.current));

            const popupContent = MarkerDisplayPopup({
              markerName,
              lat,
              lng,
              markerKey,
              componentId
            });

            marker.bindPopup(popupContent).openPopup();
          });

          leafletMapRef.current = map;

          visibleAnswers.forEach((answer) => {
            const storedValue = state[answer.qualifiedCode];
            if (storedValue && Array.isArray(storedValue) && storedValue.length === 2) {
              const [lat, lng] = storedValue;
              const markerLabel = answer.content?.label || answer.code;
              const markerName = typeof markerLabel === 'string' && markerLabel.includes('<') 
                ? markerLabel.replace(/<[^>]*>/g, '') // Remove HTML tags
                : markerLabel;
              
              const marker = L.marker([lat, lng]).addTo(map);
              
              const markerKey = `${lat},${lng}`;
              markersRef.current[markerKey] = { 
                marker, 
                markerName,
                answerCode: answer.qualifiedCode 
              };

              const popupContent = MarkerDisplayPopup({
                markerName,
                lat,
                lng,
                markerKey,
                componentId
              });

              marker.bindPopup(popupContent);
            }
          });

          mapInitialized.current = true;
          console.log("Map reference set:", !!leafletMapRef.current);

        }
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current = {};
      mapInitialized.current = false;
    };
  }, []);

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
          const answerLabel = answer.content?.label || answer.code;
          const answerText = typeof answerLabel === 'string' && answerLabel.includes('<') 
            ? answerLabel.replace(/<[^>]*>/g, '')
            : answerLabel;
          
          const storedValue = state[answer.qualifiedCode];
          
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

    </Box>
  );
});

MapQuestion.displayName = "MapQuestion";

export default MapQuestion;
