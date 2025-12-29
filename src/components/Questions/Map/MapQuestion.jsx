import React, { useEffect, useRef, useState } from "react";
import { Box, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { valueChange } from "~/state/runState";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  isValidLocation,
  MARKER_OPTIONS,
  markerPopupContent,
} from "./MapConstants";
import { useTranslation } from "react-i18next";

const MapQuestion = React.memo(({ component }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  const { t } = useTranslation("run");

  const visibleAnswers = useSelector(
    (state) =>
      component?.answers?.filter((ans) => {
        return state.runState.values[ans.qualifiedCode]?.relevance ?? true;
      }) || [],
    shallowEqual
  );

  const [current, setCurrent] = useState(visibleAnswers[0]?.qualifiedCode);
  const currentRef = useRef(current);

  const dispatch = useDispatch();

  const state = useSelector((state) => {
    let valuesMap = {};
    visibleAnswers.forEach((element) => {
      valuesMap[element.qualifiedCode] =
        state.runState.values[element.qualifiedCode].value;
    });
    return valuesMap;
  }, shallowEqual);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) {
      return;
    }
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions(MARKER_OPTIONS);

    const map = L.map(mapRef.current).setView([51.505, -0.09], 15);
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      dispatch(
        valueChange({
          componentCode: currentRef.current,
          value: [lat, lng],
        })
      );
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    leafletMapRef.current = map;

    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       const { latitude, longitude } = position.coords;
    //       map.setView([latitude, longitude], 15);
    //     },
    //     (error) => {
    //       console.warn("Geolocation error:", error.message);
    //       // Map stays at default location if geolocation fails
    //     }
    //   );
    // }
  }, [mapRef.current, leafletMapRef.current]);

  useEffect(() => {
    if (leafletMapRef.current && currentRef.current != current) {
      const value = state[current];
      if (isValidLocation(value)) {
        const currentZoom = leafletMapRef.current.getZoom() || 15;
        leafletMapRef.current.setView([value[0], value[1]], currentZoom, {
          animate: true,
          duration: 1, // duration in seconds
        });
      }
    }
    currentRef.current = current;
  }, [current, leafletMapRef.current]);

  useEffect(() => {
    if (!leafletMapRef.current) {
      return;
    }
    // Clear existing markers
    leafletMapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        leafletMapRef.current.removeLayer(layer);
      }
    });

    visibleAnswers.forEach((answer) => {
      const storedValue = state[answer.qualifiedCode];
      if (isValidLocation(storedValue)) {
        const [lat, lng] = storedValue;

        const popup = L.popup().setContent(
          markerPopupContent(answer, lat, lng, t("remove"))
        );

        const marker = L.marker([lat, lng])
          .addTo(leafletMapRef.current)
          .bindPopup(popup);

        // Store the handler so we can remove it later
        const handleRemoveClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch(
            valueChange({
              componentCode: answer.qualifiedCode,
              value: [],
            })
          );
        };

        marker.on("popupopen", () => {
          const removeBtn = document.getElementById(
            `remove-marker-${answer.qualifiedCode}`
          );
          if (removeBtn) {
            removeBtn.onclick = handleRemoveClick;
          }
        });

        marker.on("popupclose", () => {
          const removeBtn = document.getElementById(
            `remove-marker-${answer.qualifiedCode}`
          );
          if (removeBtn) {
            removeBtn.onclick = null;
          }
        });
      }
    });
  }, [state, visibleAnswers]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "400px",
        mt: 2,
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
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          px: 2,
          py: 1,
          borderRadius: 1,
          zIndex: 1000,
          boxShadow: 1,
        }}
      >
        {t("drop_pin")}
      </Box>
      {visibleAnswers && visibleAnswers.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: 1,
            boxShadow: 2,
            p: 1,
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              fontWeight: 600,
              fontSize: "0.875rem",
              p: 1,
              mb: 1,
            }}
          >
            {t("current_loc")}
          </Box>

          <RadioGroup
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          >
            {visibleAnswers.map((answer) => {
              const answerLabel = answer.content?.label || answer.code;
              const answerText =
                typeof answerLabel === "string" && answerLabel.includes("<")
                  ? answerLabel.replace(/<[^>]*>/g, "")
                  : answerLabel;

              return (
                <FormControlLabel
                  key={answer.qualifiedCode}
                  value={answer.qualifiedCode}
                  control={<Radio />}
                  label={answerText}
                />
              );
            })}
          </RadioGroup>
        </Box>
      )}
    </Box>
  );
});

MapQuestion.displayName = "MapQuestion";

export default MapQuestion;
