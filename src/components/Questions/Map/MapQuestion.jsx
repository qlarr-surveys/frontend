import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { valueChange } from "~/state/runState";

const MapQuestion = ({ component }) => {
  const dispatch = useDispatch();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        // Fix default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        if (mapRef.current && !leafletMapRef.current) {
          // Create the map
          const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          let marker = null;

          // Add click event
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Remove existing marker
            if (marker) {
              map.removeLayer(marker);
            }
            
            // Add new marker
            marker = L.marker([lat, lng]).addTo(map)
              .bindPopup(`Selected Location<br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`)
              .openPopup();

            // Update state
            const locationData = {
              latitude: lat,
              longitude: lng,
              timestamp: new Date().toISOString(),
            };
            
            setSelectedLocation(locationData);
            
            // Dispatch to Redux
            dispatch(valueChange({
              componentCode: component.qualifiedCode,
              value: locationData,
            }));
          });

          leafletMapRef.current = map;
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [component.qualifiedCode, dispatch]);

  return (
    <Box sx={{ 
      width: "100%", 
      height: "400px", 
      mt: 2,
      border: "1px solid #007bff",
      borderRadius: 1,
      overflow: "hidden",
      position: "relative"
    }}>
      <div 
        ref={mapRef} 
        style={{ 
          height: "100%", 
          width: "100%",
          backgroundColor: "#f8f9fa"
        }} 
      />
      
      {selectedLocation && (
        <Box sx={{
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
          fontSize: "12px"
        }}>
          <Typography variant="caption">
            📍 Lat: {selectedLocation.latitude.toFixed(4)}, Lng: {selectedLocation.longitude.toFixed(4)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MapQuestion;