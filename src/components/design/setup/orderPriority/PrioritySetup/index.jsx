import React from "react";
import { Checkbox, MenuItem, Select, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { changeAttribute, updatePriority } from "~/state/design/designState";
import styles from "./PrioritySetup.module.css";
import CustomTooltip from "~/components/common/Tooltip/Tooltip";
import { instructionByCode } from "~/state/design/addInstructions";
import { stripTags } from "~/utils/design/utils";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";
import OrderPriorityError from "../OrderPriorityError";

const clampLimit = (limit, size) =>
  Math.min(Math.max(limit ?? size - 1, 1), size - 1);

// rule -> { title i18n key, child `type` filter (rows/columns only) }
const RULE_CONFIG = {
  prioritise_questions: { title: "questions_priority" },
  prioritise_groups: { title: "groups_priority" },
  prioritise_options: { title: "options_priority" },
  prioritise_rows: { title: "rows_priority", type: "row" },
  prioritise_columns: { title: "columns_priority", type: "column" },
};

export default function PrioritySetup({ t, rule, code }) {
  const dispatch = useDispatch();
  const { t: tTooltips } = useTranslation(NAMESPACES.DESIGN_TOOLTIPS);

  const { title, type } = RULE_CONFIG[rule] || {};
  const isGroups = rule === "prioritise_groups";

  const value = useSelector((state) => state.designState[code][rule] || "NONE");

  const instruction = useSelector((state) =>
    instructionByCode(state.designState[code], "priority_groups")
  );
  const priorities = instruction?.priorities || [];
  const errors = instruction?.errors || [];

  const rawChildren = useSelector((state) => {
    const comp = state.designState[code];
    const lang = state.designState.langInfo.lang;
    return (comp?.children || [])
      .filter((el) => (type ? el.type === type : true))
      .filter((el) => {
        const groupType = el.groupType?.toLowerCase();
        return !(groupType === "end" || (isGroups && groupType === "welcome"));
      })
      .map((el) => ({
        code: el.code,
        label: state.designState[el.qualifiedCode]?.content?.[lang]?.label,
      }));
  });

  // For rows/columns the instruction holds one group per axis, so pick the
  // group relevant to this axis and keep the others (the other axis) intact.
  const axisCodes = rawChildren.map((c) => c.code);
  const relevantGroup = type
    ? priorities.find((g) =>
        (g.weights || []).some((w) => axisCodes.includes(w.code))
      )
    : priorities[0];
  const otherGroups = type
    ? priorities.filter((g) => g !== relevantGroup)
    : [];

  // Local selection state: a priority group needs >= 2 items, so the instruction
  // isn't written until then. Keeping the checkbox state here lets the user build
  // the selection back up from 0/1 without it being dropped each click.
  const [selectedCodes, setSelectedCodes] = React.useState(() =>
    (relevantGroup?.weights || []).map((w) => w.code)
  );
  // Re-seed when prioritisation is toggled on/off (initialSetup populates the
  // group). Switching component or axis remounts this via the SetupPanel
  // key={code+rule} (for arrays the rows and columns instances render side by
  // side as distinct keys), so `value` is the only in-place change to react to.
  React.useEffect(() => {
    setSelectedCodes((relevantGroup?.weights || []).map((w) => w.code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const children = rawChildren.map((c) => ({
    ...c,
    inGroup: selectedCodes.includes(c.code),
  }));
  const selectedCount = children.filter((c) => c.inGroup).length;
  const effectiveLimit = clampLimit(relevantGroup?.limit, selectedCount);

  const commitCodes = (codes, nextLimit) => {
    const validCodes = codes.filter((c) => axisCodes.includes(c));
    const nextPriorities =
      validCodes.length < 2
        ? otherGroups
        : [
            ...otherGroups,
            {
              // v1 uses equal weights — store member codes + a "show N of M" limit
              weights: validCodes.map((c) => ({ code: c })),
              limit: clampLimit(nextLimit, validCodes.length),
            },
          ];
    dispatch(updatePriority({ code, priorities: nextPriorities }));
  };

  const onToggle = (next) => {
    dispatch(
      changeAttribute({ code, key: rule, value: next === "NONE" ? undefined : next })
    );
  };

  const onCheck = (childCode, checked) => {
    const next = checked
      ? [...selectedCodes, childCode]
      : selectedCodes.filter((c) => c !== childCode);
    setSelectedCodes(next);
    commitCodes(next, relevantGroup?.limit);
  };

  return (
    <>
      <div className={styles.label}>
        <CustomTooltip body={tTooltips(title)} />
        <Typography fontWeight={700}>{t(title)}</Typography>
      </div>

      <Select
        className={styles.selectValue}
        fullWidth
        value={value}
        onChange={(e) => onToggle(e.target.value)}
      >
        <MenuItem value="NONE">{t("no_priority")}</MenuItem>
        <MenuItem value="PRIORITY">{t("prioritise")}</MenuItem>
      </Select>

      {value !== "NONE" && (
        <>
          <ul className={styles.list}>
            {children.map((item) => (
              <PriorityChildRow
                key={item.code}
                item={item}
                onCheck={(checked) => onCheck(item.code, checked)}
              />
            ))}
          </ul>

          {selectedCount >= 2 ? (
            <>
              <div className={styles.limitRow}>
                <Typography fontWeight={700}>{t("priority_show")}</Typography>
                <Select
                  size="small"
                  value={effectiveLimit}
                  onChange={(e) => commitCodes(selectedCodes, Number(e.target.value))}
                >
                  {Array.from({ length: selectedCount - 1 }, (_, i) => i + 1).map(
                    (n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    )
                  )}
                </Select>
              </div>
              <Typography
                className={styles.summary}
                variant="body2"
                color="text.secondary"
              >
                {t("priority_show_limit_from_count", {
                  limit: effectiveLimit,
                  count: selectedCount,
                })}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("priority_min_items")}
            </Typography>
          )}

          <OrderPriorityError errors={errors} />
        </>
      )}
    </>
  );
}

function PriorityChildRow({ item, onCheck }) {
  return (
    <li className={styles.listItem}>
      <Checkbox
        checked={item.inGroup}
        onChange={(e) => onCheck(e.target.checked)}
      />
      <span className={styles.itemLabel}>
        {item.code}: {stripTags(item.label)}
      </span>
    </li>
  );
}
