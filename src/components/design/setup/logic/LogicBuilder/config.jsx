import merge from "lodash.merge";
import { MuiConfig } from "@react-awesome-query-builder/mui";
const InitialConfig = MuiConfig;

const wrapField = (field) => {
  return '<span class="logicField">' + field + "</span>";
};

const wrapOperator = (op) => {
  return '<span class="logicOp">' + op + "</span>";
};

const wrapValue = (value, valueTypes) => {
  return (
    '<span class="logicValue">' +
    (valueTypes == "text" ? '"' + value + '"' : value) +
    "</span>"
  );
};

const conjunctions = {
  AND: InitialConfig.conjunctions.AND,
  OR: InitialConfig.conjunctions.OR,
};

const operators = {
  ...InitialConfig.operators,
  less: {
    ...InitialConfig.operators.less,
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      return `${wrapField(field)} ${wrapOperator("<")} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  less_or_equal: {
    ...InitialConfig.operators.less_or_equal,
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      return `${wrapField(field)} ${wrapOperator("<=")} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  greater: {
    ...InitialConfig.operators.greater,
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      return `${wrapField(field)} ${wrapOperator(">")} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  greater_or_equal: {
    ...InitialConfig.operators.greater_or_equal,
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      return `${wrapField(field)} ${wrapOperator(">=")} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },

  equal: {
    ...InitialConfig.operators.equal,
    label: "Equals",
    jsonLogic: "==",
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "equals" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  not_equal: {
    ...InitialConfig.operators.not_equal,
    label: "Not Equals",
    jsonLogic: "!=",
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "not equals" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  starts_with: {
    ...InitialConfig.operators.starts_with,
    jsonLogic: "startsWith",
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "starts with" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  ends_with: {
    ...InitialConfig.operators.ends_with,
    jsonLogic: "endsWith",
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "ends with" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  between: {
    ...InitialConfig.operators.between,
    label: "Between",
    jsonLogic: "between",
    formatOp: (
      field,
      op,
      values,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let valFrom = values.first();
      let valTo = values.get(1);
      if (isForDisplay)
        return `${wrapField(field)} ${wrapOperator("between")} ${wrapValue(
          valFrom,
          valueTypes
        )} ${wrapOperator("and")} ${wrapValue(valTo, valueTypes)}`;
      else return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
    },
  },
  not_between: {
    ...InitialConfig.operators.not_between,
    label: "Not Between",
    jsonLogic: "not_between",
    formatOp: (
      field,
      op,
      values,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let valFrom = values.first();
      let valTo = values.get(1);
      if (isForDisplay)
        return `${wrapField(field)} ${wrapOperator("not between")} ${wrapValue(
          valFrom,
          valueTypes
        )} ${wrapOperator("and")} ${wrapValue(valTo, valueTypes)}`;
      else return `${field} >= ${valFrom} && ${field} <= ${valTo}`;
    },
  },
  like: {
    ...InitialConfig.operators.like,
    label: "Contains",
    jsonLogic: "contains",
    _jsonLogicIsRevArgs: false,
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "contains" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  not_like: {
    ...InitialConfig.operators.not_like,
    label: "Not Contains",
    jsonLogic: "not_contains",
    formatOp: (
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) => {
      const opStr = isForDisplay ? "does not contain" : opDef.label;
      return `${wrapField(field)} ${wrapOperator(opStr)} ${wrapValue(
        value,
        valueTypes
      )}`;
    },
  },
  select_any_in: {
    ...InitialConfig.operators.select_any_in,
    label: "Has Any Selected",
    jsonLogic: "in",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let formattedValues = values.join(", ");
      return `${wrapField(field)} ${wrapOperator("in")} (${wrapValue(
        formattedValues,
        ""
      )})`;
    },
  },
  select_not_any_in: {
    ...InitialConfig.operators.select_not_any_in,
    label: "Has None Selected",
    jsonLogic: "not_in",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let formattedValues = values.join(", ");
      return `${wrapField(field)} ${wrapOperator("not in")} (${wrapValue(
        formattedValues,
        ""
      )})`;
    },
  },
  multiselect_equals: {
    ...InitialConfig.operators.multiselect_equals,
    label: "Has Any Selected",
    jsonLogic: "in",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let formattedValues = values.join(", ");
      return `${wrapOperator("Any of")} (${wrapValue(
        formattedValues,
        ""
      )}) in ${wrapField(field)} ${wrapOperator("is selected")}`;
    },
  },
  multiselect_not_equals: {
    ...InitialConfig.operators.multiselect_not_equals,
    label: "Has None Selected",
    jsonLogic: "not_in",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      let formattedValues = values.join(", ");
      return `${wrapOperator("None of")} (${wrapValue(
        formattedValues,
        ""
      )}) in ${wrapField(field)} ${wrapOperator("is selected")}`;
    },
  },
  is_relevant: {
    label: "Is Displayed",
    jsonLogic: "is_relevant",
    cardinality: 0,
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is shown")}`;
    },
  },
  is_not_relevant: {
    label: "Is Hidden",
    jsonLogic: "is_not_relevant",
    cardinality: 0,
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is not shown")}`;
    },
  },
  is_valid: {
    label: "Is Valid",
    jsonLogic: "is_valid",
    cardinality: 0,
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is valid")}`;
    },
  },
  is_not_valid: {
    label: "Is Not Valid",
    jsonLogic: "is_not_valid",
    cardinality: 0,
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is not valid")}`;
    },
  },
  "is_empty": {
    cardinality: 0,
    label: "Is Empty",
    jsonLogic: "is_empty",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is empty")}`;
    },
  },
  is_online: {
    cardinality: 0,
    label: "Is Online",
    jsonLogic: "is_online",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is online")}`;
    },
  },
  is_offline: {
    cardinality: 0,
    label: "Is Offline",
    jsonLogic: "is_offline",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is Offline")}`;
    },
  },
  "is_not_empty": {
    cardinality: 0,
    label: "Is not Empty",
    jsonLogic: "is_not_empty",
    formatOp: (
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) => {
      return `${wrapField(field)} ${wrapValue("is not empty")}`;
    },
  },
};

const widgets = {
  ...InitialConfig.widgets,
  // examples of  overriding
  text: {
    ...InitialConfig.widgets.text,
  },
  slider: {
    ...InitialConfig.widgets.slider,
    customProps: {
      width: "300px",
    },
  },
  rangeslider: {
    ...InitialConfig.widgets.rangeslider,
    customProps: {
      width: "300px",
    },
  },
  date: {
    ...InitialConfig.widgets.date,
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD",
  },
  time: {
    ...InitialConfig.widgets.time,
    timeFormat: "HH:mm",
    valueFormat: "HH:mm:ss",
  },
  datetime: {
    ...InitialConfig.widgets.datetime,
    timeFormat: "HH:mm",
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
  },
  func: {
    ...InitialConfig.widgets.func,
    customProps: {
      showSearch: true,
    },
  },
  treeselect: {
    ...InitialConfig.widgets.treeselect,
    customProps: {
      showSearch: true,
    },
  },
};

const types = {
  ...InitialConfig.types,
  boolean: merge(InitialConfig.types.boolean, {
    widgets: {
      boolean: {
        widgetProps: {
          hideOperator: true,
          operatorInlineLabel: "is",
        },
      },
    },
  }),
};

const getLocaleSettings = (t) => ({
  valueLabel: t("logic_builder.value"),
  valuePlaceholder: t("logic_builder.value"),
  fieldLabel: t("logic_builder.field"),
  operatorLabel: t("logic_builder.operator"),
  fieldPlaceholder: t("logic_builder.select_field"),
  operatorPlaceholder: t("logic_builder.select_operator"),
  deleteLabel: null,
  addGroupLabel: t("logic_builder.add_group"),
  addRuleLabel: t("logic_builder.add_rule"),
  addSubRuleLabel: t("logic_builder.add_sub_rule"),
  delGroupLabel: null,
  notLabel: t("logic_builder.not"),
  valueSourcesPopupTitle: t("logic_builder.select_value_source"),
  removeRuleConfirmOptions: {
    title: t("logic_builder.confirm_delete_rule"),
    okText: t("logic_builder.yes"),
    okType: "danger",
  },
  removeGroupConfirmOptions: {
    title: t("logic_builder.confirm_delete_group"),
    okText: t("logic_builder.yes"),
    okType: "danger",
  },
});

const getSettings = (t) => ({
  ...InitialConfig.settings,
  ...getLocaleSettings(t),

  valueSourcesInfo: {
    value: {
      label: t("logic_builder.value"),
    },
    field: {
      label: t("logic_builder.field"),
      widget: "field",
    },
    func: {
      label: t("logic_builder.function"),
      widget: "func",
    },
  },
  canReorder: false,
  showNot: false,
  maxNesting: 1,
  canLeaveEmptyGroup: false, //after deletion
});

const funcs = {};

const getOperators = (t) => ({
  ...operators,
  select_any_in: {
    ...operators.select_any_in,
    label: t("logic_builder.has_any_selected"),
  },
  select_not_any_in: {
    ...operators.select_not_any_in,
    label: t("logic_builder.has_none_selected"),
  },
  multiselect_equals: {
    ...operators.multiselect_equals,
    label: t("logic_builder.has_any_selected"),
  },
  multiselect_not_equals: {
    ...operators.multiselect_not_equals,
    label: t("logic_builder.has_none_selected"),
  },
  equal: {
    ...operators.equal,
    label: t("logic_builder.equals"),
  },
  not_equal: {
    ...operators.not_equal,
    label: t("logic_builder.not_equals"),
  },
  between: {
    ...operators.between,
    label: t("logic_builder.between"),
  },
  not_between: {
    ...operators.not_between,
    label: t("logic_builder.not_between"),
  },
  like: {
    ...operators.like,
    label: t("logic_builder.contains"),
  },
  not_like: {
    ...operators.not_like,
    label: t("logic_builder.not_contains"),
  },
  is_relevant: {
    ...operators.is_relevant,
    label: t("logic_builder.is_displayed"),
  },
  is_not_relevant: {
    ...operators.is_not_relevant,
    label: t("logic_builder.is_hidden"),
  },
  is_valid: {
    ...operators.is_valid,
    label: t("logic_builder.is_valid"),
  },
  is_not_valid: {
    ...operators.is_not_valid,
    label: t("logic_builder.is_not_valid"),
  },
  is_empty: {
    ...operators.is_empty,
    label: t("logic_builder.is_empty"),
  },
  is_not_empty: {
    ...operators.is_not_empty,
    label: t("logic_builder.is_not_empty"),
  },
  is_online: {
    ...operators.is_online,
    label: t("logic_builder.is_online"),
  },
  is_offline: {
    ...operators.is_offline,
    label: t("logic_builder.is_offline"),
  },
});

export const getConfig = (t) => ({
  ctx: MuiConfig.ctx,
  conjunctions,
  operators: getOperators(t),
  widgets,
  types,
  settings: getSettings(t),
  funcs,
});
