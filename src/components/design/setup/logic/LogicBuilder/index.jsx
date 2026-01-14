import React, { useEffect, useState, useMemo } from "react";
import { Query, Builder, Utils } from "@react-awesome-query-builder/mui";
import { getConfig } from "./config";
import "@react-awesome-query-builder/mui/css/styles.css";
import "./override.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import { stripTags, truncateWithEllipsis } from "~/utils/design/utils";
import { buildFields } from "./buildFields";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "~/hooks/useNamespaceLoader";

function LogicBuilder(props) {
  const { t: tLogic } = useTranslation(NAMESPACES.DESIGN_LOGIC);
  const {
    jsonLogicFormat,
    queryString,
    loadTree,
    uuid,
    loadFromJsonLogic,
    checkTree,
  } = Utils;
  const designState = useSelector((state) => {
    return state.designState;
  });
  const langInfo = React.useMemo(() => designState.langInfo);

  const baseConfig = useMemo(() => getConfig(tLogic), [tLogic]);

  const fields = React.useMemo(
    () =>
      buildFields(
        designState.componentIndex,
        props.code,
        designState,
        langInfo.mainLang,
        langInfo.languagesList.map((lang) => lang.code),
        tLogic
      ),
    [designState, tLogic]
  );

  const config = { ...baseConfig, fields };

  const initTree = props.logic
    ? checkTree(loadFromJsonLogic(props.logic, config), config)
    : loadTree({ id: uuid(), type: "group" });
  const [tree, setTree] = useState(initTree);
  const [html, setHtml] = useState(queryString(tree, config, true));

  const renderBuilder = (props) => (
    <div jey="builder" className="query-builder-container">
      <div className="query-builder">
        <Builder {...props} />
      </div>
    </div>
  );

  const onChange = (immutableTree) => {
    setTree(immutableTree);
  };

  const onInit = (immutableTree, _cfg, _actionMeta, actions) => {
    const children = immutableTree.get("children1");
    if (!children || children.size === 0) {
      const rootId = immutableTree.get("id");
      actions.addRule([rootId]);
    }
  };

  const saveState = () => {
    const { logic, errors } = jsonLogicFormat(tree, config);
    setHtml(queryString(tree, config, true));
    props.onChange(logic);
  };

  useEffect(() => {
    setHtml(queryString(tree, config, true));
  }, [designState.index]);

  return (
    <>
      {!props.dialogOpen && (
        <div key="result" className="query-builder-result">
          {props.logic && html ? (
            <pre className="condition-human-text">
              {truncateWithEllipsis(stripTags(html), 50)}
            </pre>
          ) : (
            <pre className="condition-human-text">
              {props.t("no_condition")}
            </pre>
          )}
          <div className="icon-container">
            <IconButton onClick={() => props.onDialogStateChanged(true)}>
              <EditOutlined />
            </IconButton>
          </div>
        </div>
      )}

      <Dialog
        fullScreen={true}
        sx={{ margin: "200px" }}
        open={props.dialogOpen}
        onClose={() => props.onDialogStateChanged(false)}
        aria-labelledby="alert-dialog-title-logic-builder"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title-logic-builder">
          {props.title}
        </DialogTitle>
        <DialogContent>
          <Query
            {...config}
            value={tree}
            onInit={onInit}
            onChange={onChange}
            renderBuilder={renderBuilder}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              props.onDialogStateChanged(false);
              saveState();
            }}
            autoFocus
            variant="contained"
          >
            {tLogic("logic_builder.agree")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default LogicBuilder;
