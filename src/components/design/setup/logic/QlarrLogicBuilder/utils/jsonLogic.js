import { OPERATORS, findOperatorByJsonLogicOp } from '../config/operators';

/**
 * Build a mapping from JSON Logic operator names to our operator keys
 * Generated from OPERATORS config to maintain single source of truth
 */
const JSON_LOGIC_OP_TO_KEY = Object.fromEntries(
  Object.entries(OPERATORS).map(([key, op]) => [op.jsonLogicOp, key])
);

/**
 * Log parse warnings in development mode only
 */
function logParseWarning(message, context) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[JsonLogic Parser]', message, context);
  }
}

/**
 * Generate a unique ID for tree nodes
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Create an empty tree with a root group
 */
export function createEmptyTree() {
  return {
    id: generateId(),
    type: 'group',
    conjunction: 'and',
    children: [],
  };
}

/**
 * Create a new empty rule
 */
export function createEmptyRule() {
  return {
    id: generateId(),
    type: 'rule',
    field: null,
    operator: null,
    value: null,
  };
}

/**
 * Convert internal tree model to JSON Logic format
 * This must produce output compatible with the existing jsonToJs() function
 */
export function treeToJsonLogic(tree) {
  const validChildren = tree.children.filter((rule) => isRuleValid(rule));

  if (validChildren.length === 0) {
    return null;
  }

  const childLogic = validChildren
    .map((rule) => ruleToJsonLogic(rule))
    .filter((logic) => logic !== null);

  if (childLogic.length === 0) {
    return null;
  }

  // If only one rule, return it directly (no wrapping conjunction)
  if (childLogic.length === 1) {
    return childLogic[0];
  }

  // Wrap multiple rules in conjunction
  return { [tree.conjunction]: childLogic };
}

/**
 * Check if a rule has all required fields
 */
function isRuleValid(rule) {
  if (!rule.field || !rule.operator) {
    return false;
  }

  const operatorDef = OPERATORS[rule.operator];
  if (!operatorDef) {
    return false;
  }

  // Zero-cardinality operators don't need a value
  if (operatorDef.cardinality === 0) {
    return true;
  }

  // Cardinality 1 needs a value
  if (operatorDef.cardinality === 1) {
    return rule.value !== null && rule.value !== '';
  }

  // Cardinality 2 (range) needs an array of two values
  if (operatorDef.cardinality === 2) {
    return (
      Array.isArray(rule.value) &&
      rule.value.length === 2 &&
      rule.value[0] !== null &&
      rule.value[1] !== null
    );
  }

  return false;
}

/**
 * Convert a single rule to JSON Logic
 */
function ruleToJsonLogic(rule) {
  if (!rule.field || !rule.operator) {
    return null;
  }

  const operatorDef = OPERATORS[rule.operator];
  if (!operatorDef) {
    return null;
  }

  const fieldVar = { var: rule.field };

  // Zero-cardinality operators (no value needed)
  if (operatorDef.cardinality === 0) {
    return { [operatorDef.jsonLogicOp]: fieldVar };
  }

  // Single value operators
  if (operatorDef.cardinality === 1) {
    // Handle select operators - value might be an array of selected options
    if (
      rule.operator === 'select_any_in' ||
      rule.operator === 'select_not_any_in' ||
      rule.operator === 'multiselect_equals' ||
      rule.operator === 'multiselect_not_equals'
    ) {
      const values = Array.isArray(rule.value) ? rule.value : [rule.value];
      return { [operatorDef.jsonLogicOp]: [fieldVar, values] };
    }

    return { [operatorDef.jsonLogicOp]: [fieldVar, rule.value] };
  }

  // Range operators (cardinality 2)
  if (operatorDef.cardinality === 2 && Array.isArray(rule.value)) {
    const [min, max] = rule.value;
    return { [operatorDef.jsonLogicOp]: [fieldVar, min, max] };
  }

  return null;
}

/**
 * Convert JSON Logic to internal tree model
 * This parses the format produced by react-awesome-query-builder
 */
export function jsonLogicToTree(jsonLogic) {
  const root = createEmptyTree();

  if (!jsonLogic || typeof jsonLogic !== 'object') {
    return root;
  }

  const parsed = parseJsonLogicNode(jsonLogic);

  if (parsed) {
    if (parsed.type === 'group') {
      return parsed;
    } else {
      // Single rule - wrap in a group
      root.children = [parsed];
    }
  }

  return root;
}

/**
 * Parse a JSON Logic node into our tree structure
 */
function parseJsonLogicNode(node) {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const keys = Object.keys(node);
  if (keys.length === 0) {
    return null;
  }

  const key = keys[0];
  const value = node[key];

  // Handle conjunctions (and/or)
  if (key === 'and' || key === 'or') {
    const children = value
      .map((child) => parseJsonLogicNode(child))
      .filter((child) => child !== null && child.type === 'rule');

    return {
      id: generateId(),
      type: 'group',
      conjunction: key,
      children,
    };
  }

  // Handle operators
  return parseOperatorRule(key, value);
}

/**
 * Parse an operator expression into a LogicRule
 */
function parseOperatorRule(jsonLogicOp, value) {
  // Find the operator by its JSON Logic operator name
  const operatorDef = findOperatorByJsonLogicOp(jsonLogicOp);

  // If not found directly, try looking up by key
  const opKey = operatorDef?.key || findOperatorKeyByJsonLogicOp(jsonLogicOp);

  if (!opKey) {
    logParseWarning('Could not resolve operator, rule ignored', { jsonLogicOp, value });
    return null;
  }

  const rule = {
    id: generateId(),
    type: 'rule',
    field: null,
    operator: opKey,
    value: null,
  };

  // Extract field and value based on operator cardinality
  const op = OPERATORS[opKey];
  if (!op) {
    return null;
  }

  // Zero-cardinality operators: value is just { var: "field" }
  if (op.cardinality === 0) {
    const fieldVar = extractFieldVar(value);
    if (fieldVar) {
      rule.field = fieldVar;
    }
    return rule;
  }

  // Array-based operators: [{ var: "field" }, value] or [{ var: "field" }, min, max]
  if (Array.isArray(value)) {
    const fieldVar = extractFieldVar(value[0]);
    if (fieldVar) {
      rule.field = fieldVar;
    }

    // Range operators (cardinality 2)
    if (op.cardinality === 2 && value.length >= 3) {
      rule.value = [value[1], value[2]];
    }
    // Single value operators
    else if (value.length >= 2) {
      rule.value = value[1];
    }
  }

  return rule;
}

/**
 * Extract field name from a { var: "field" } structure
 */
function extractFieldVar(value) {
  if (
    value &&
    typeof value === 'object' &&
    'var' in value &&
    typeof value.var === 'string'
  ) {
    return value.var;
  }
  return null;
}

/**
 * Map JSON Logic operator names to our operator keys
 * Uses the generated JSON_LOGIC_OP_TO_KEY map from OPERATORS config
 */
function findOperatorKeyByJsonLogicOp(jsonLogicOp) {
  const key = JSON_LOGIC_OP_TO_KEY[jsonLogicOp];
  if (!key) {
    logParseWarning('Unknown JSON Logic operator', { jsonLogicOp });
  }
  return key || null;
}

/**
 * Deep clone a tree structure
 */
export function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}
