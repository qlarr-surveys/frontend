import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { LogicBuilderProvider, useLogicBuilder } from './LogicBuilderContext';
import { QlarrLogicBuilderInline } from './QlarrLogicBuilderInline';
import { treeToJsonLogic } from './utils/jsonLogic';

/**
 * Inner component that syncs state changes to parent
 */
function InlineLogicBuilderSync({ onChange }) {
  const { state } = useLogicBuilder();
  const { tree, isDirty } = state;

  // Use ref to store onChange to avoid triggering effect when callback reference changes
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync changes to parent whenever tree changes
  useEffect(() => {
    if (isDirty) {
      const jsonLogic = treeToJsonLogic(tree);
      onChangeRef.current({ jsonLogic, queryString: '' });
    }
  }, [tree, isDirty]);

  return <QlarrLogicBuilderInline />;
}

/**
 * QlarrLogicBuilderInlineWrapper - Inline version for sidebar display
 * Similar to SkipLogic component style - no dialog, displays directly in sidebar
 */
export function QlarrLogicBuilderInlineWrapper({
  code,
  jsonLogic,
  onChange,
  componentIndices,
  designState,
  mainLang,
  langList,
  t,
}) {
  return (
    <LogicBuilderProvider
      initialJsonLogic={jsonLogic}
      componentIndices={componentIndices}
      currentCode={code}
      designState={designState}
      mainLang={mainLang}
      langList={langList}
      t={t}
    >
      <InlineLogicBuilderSync onChange={onChange} />
    </LogicBuilderProvider>
  );
}

QlarrLogicBuilderInlineWrapper.propTypes = {
  code: PropTypes.string.isRequired,
  jsonLogic: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  componentIndices: PropTypes.object.isRequired,
  designState: PropTypes.object.isRequired,
  mainLang: PropTypes.string.isRequired,
  langList: PropTypes.arrayOf(PropTypes.string).isRequired,
  t: PropTypes.func.isRequired,
};

InlineLogicBuilderSync.propTypes = {
  onChange: PropTypes.func.isRequired,
};
