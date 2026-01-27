import React from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AddOutlined, DeleteOutline, HelpOutline } from '@mui/icons-material';
import { useLogicBuilder } from './LogicBuilderContext';
import { FieldSelector } from './components/FieldSelector';
import { OperatorSelector } from './components/OperatorSelector';
import { ValueInput } from './components/ValueInput';
import { OPERATORS } from './config/operators';
import styles from './QlarrLogicBuilderInline.module.css';

/**
 * Inline version of QlarrLogicBuilder for sidebar display
 * Enhanced with natural language, empty state guidance, and preview
 */
export function QlarrLogicBuilderInline() {
  const { state, dispatch, getFieldDefinition, t } = useLogicBuilder();
  const { tree } = state;

  const handleAddRule = () => {
    dispatch({ type: 'ADD_RULE' });
  };

  const handleRemoveRule = (ruleId) => {
    dispatch({ type: 'REMOVE_RULE', ruleId });
  };

  const handleConjunctionChange = (_event, newConjunction) => {
    if (newConjunction !== null) {
      dispatch({ type: 'UPDATE_CONJUNCTION', conjunction: newConjunction });
    }
  };

  const handleFieldChange = (ruleId, fieldCode) => {
    dispatch({ type: 'UPDATE_FIELD', ruleId, field: fieldCode });

    // Auto-select default operator for the field
    const fieldDef = getFieldDefinition(fieldCode);
    if (fieldDef) {
      dispatch({ type: 'UPDATE_OPERATOR', ruleId, operator: fieldDef.defaultOperator });
      dispatch({ type: 'UPDATE_VALUE', ruleId, value: null });
    }
  };

  const handleOperatorChange = (ruleId, operator) => {
    dispatch({ type: 'UPDATE_OPERATOR', ruleId, operator });

    // Clear value when changing to zero-cardinality operator
    const opDef = OPERATORS[operator];
    if (opDef?.cardinality === 0) {
      dispatch({ type: 'UPDATE_VALUE', ruleId, value: null });
    }
  };

  const handleValueChange = (ruleId, value) => {
    dispatch({ type: 'UPDATE_VALUE', ruleId, value });
  };

  return (
    <Box className={styles.container}>
      {/* Conjunction selector with help tooltip */}
      {tree.children.length > 1 && (
        <Box className={styles.conjunctionRow}>
          <ToggleButtonGroup
            value={tree.conjunction}
            exclusive
            onChange={handleConjunctionChange}
            size="small"
            className={styles.toggleGroup}
          >
            <ToggleButton value="and" className={styles.toggleButton}>
              {t('logic_builder.all')}
            </ToggleButton>
            <ToggleButton value="or" className={styles.toggleButton}>
              {t('logic_builder.any')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Empty state with guidance */}
      {tree.children.length === 0 ? (
        <Box className={styles.emptyState}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('logic_builder.empty_state_title')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('logic_builder.empty_state_hint')}
          </Typography>
        </Box>
      ) : (
        tree.children.map((rule) => {
          const operatorDef = rule.operator ? OPERATORS[rule.operator] : undefined;
          const showValue = operatorDef && operatorDef.cardinality > 0;

          return (
            <Box key={rule.id} className={styles.ruleCard}>
              <Tooltip title={t('logic_builder.delete_rule')}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveRule(rule.id)}
                  color="error"
                  className={styles.deleteButton}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>

              <Box className={styles.fieldRow}>
                <FieldSelector
                  value={rule.field}
                  onChange={(fieldCode) => handleFieldChange(rule.id, fieldCode)}
                />
              </Box>

              {rule.field && (
                <Box className={styles.fieldRow}>
                  <OperatorSelector
                    fieldCode={rule.field}
                    value={rule.operator}
                    onChange={(operator) => handleOperatorChange(rule.id, operator)}
                  />
                </Box>
              )}

              {rule.field && rule.operator && showValue && (
                <Box className={styles.fieldRow}>
                  <ValueInput
                    fieldCode={rule.field}
                    operator={rule.operator}
                    value={rule.value}
                    onChange={(value) => handleValueChange(rule.id, value)}
                  />
                </Box>
              )}
            </Box>
          );
        })
      )}

      <Button
        variant="outlined"
        startIcon={<AddOutlined />}
        onClick={handleAddRule}
        sx={{ mt: 2 }}
        fullWidth
        size="small"
      >
        {t('logic_builder.add_condition')}
      </Button>
    </Box>
  );
}
