
/**
 * Creates and registers global popup functions for a map component
 * @param {string} componentId - Unique identifier for the component
 * @param {Object} dependencies - Dependencies needed by the functions
 * @returns {Function} - Cleanup function to remove global functions
 */
export const createMapPopupFunctions = (componentId, dependencies) => {
  const {
    markersRef,
    leafletMapRef,
    visibleAnswers,
    state,
    dispatch,
    valueChange
  } = dependencies;

  window[`removeMarker_${componentId}`] = (markerKey, event) => {
    console.log("removeMarker called with:", markerKey);
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const markerData = markersRef.current[markerKey];
    if (!markerData) {
      console.log("No marker data found for removal:", markerKey);
      return;
    }

    const [lat, lng] = markerKey.split(',').map(Number);
    const matchingAnswer = visibleAnswers.find(answer => {
      const storedValue = state[answer.qualifiedCode];
      return storedValue && Array.isArray(storedValue) && storedValue[0] === lat && storedValue[1] === lng;
    });

    if (matchingAnswer) {
      console.log(`Removing marker from answer ${matchingAnswer.qualifiedCode}, setting to null`);
      dispatch(
        valueChange({
          componentCode: matchingAnswer.qualifiedCode,
          value: null,
        })
      );
    }

    if (leafletMapRef.current) {
      leafletMapRef.current.removeLayer(markerData.marker);
    }
    delete markersRef.current[markerKey];
  };

  return () => {
    delete window[`removeMarker_${componentId}`];
  };
};