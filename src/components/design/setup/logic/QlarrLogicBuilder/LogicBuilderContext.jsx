import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLogicBuilderState } from './hooks/useLogicBuilderState';
import { useFieldConfig, getOperatorsForField } from './hooks/useFieldConfig';

// Create context with undefined default
const LogicBuilderContext = createContext(undefined);

/**
 * Provider component that wraps the logic builder and provides shared state
 */
export function LogicBuilderProvider({
  children,
  initialJsonLogic,
  componentIndices,
  currentCode,
  designState,
  mainLang,
  langList,
  t,
}) {
  // Initialize state hook
  const { state, dispatch, actions } =
    useLogicBuilderState(initialJsonLogic);

  // Build field configuration
  const fields = useFieldConfig(
    componentIndices,
    currentCode,
    designState,
    mainLang,
    langList,
    t
  );

  // Memoized field lookup
  const getFieldDefinition = useMemo(() => {
    const fieldMap = new Map(fields.map((f) => [f.code, f]));
    return (code) => fieldMap.get(code);
  }, [fields]);

  // Get operators for a field
  const getFieldOperators = useMemo(() => {
    return (fieldCode) => {
      const field = getFieldDefinition(fieldCode);
      if (!field) return [];
      return getOperatorsForField(field);
    };
  }, [getFieldDefinition]);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      actions,
      fields,
      getFieldDefinition,
      getOperatorsForField: getFieldOperators,
      t,
    }),
    [
      state,
      dispatch,
      actions,
      fields,
      getFieldDefinition,
      getFieldOperators,
      t,
    ]
  );

  return (
    <LogicBuilderContext.Provider value={contextValue}>
      {children}
    </LogicBuilderContext.Provider>
  );
}

/**
 * Hook to access logic builder context
 * Must be used within a LogicBuilderProvider
 */
export function useLogicBuilder() {
  const context = useContext(LogicBuilderContext);
  if (!context) {
    throw new Error(
      'useLogicBuilder must be used within a LogicBuilderProvider'
    );
  }
  return context;
}

LogicBuilderProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialJsonLogic: PropTypes.object,
  componentIndices: PropTypes.object.isRequired,
  currentCode: PropTypes.string.isRequired,
  designState: PropTypes.object.isRequired,
  mainLang: PropTypes.string.isRequired,
  langList: PropTypes.arrayOf(PropTypes.string).isRequired,
  t: PropTypes.func.isRequired,
};
