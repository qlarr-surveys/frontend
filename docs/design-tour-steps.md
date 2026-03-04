# Design Screen Tour Steps

Tour for new users visiting the survey design screen.

## Tour Steps

| Step | data-tour | CSS Selector | Element | File |
|------|-----------|-------------|---------|------|
| 1 | `content-panel` | `[data-tour="content-panel"]` | Main workspace (pages area) | `src/components/design/ContentPanel/index.jsx` |
| 2 | `page-group` | `[data-tour="page-group"]` | First page card (Page 1) | `src/components/Group/GroupDesign.jsx` |
| 3 | `question-types-list` | `[data-tour="question-types-list"]` | All question type categories (Text based → end of sidebar) | `src/components/design/NewComponentsPanel/index.jsx` |
| 4 | `add-page` | `[data-tour="add-page"]` | Sections / Add a new Page | `src/components/design/NewComponentsPanel/index.jsx` |
| 5 | `thank-you-page` | `[data-tour="thank-you-page"]` | Thank You Page (Final Page) | `src/components/Group/GroupDesign.jsx` |
| 6 | `preview-button` | `[data-tour="preview-button"]` | Preview button (top right) | `src/components/manage/SurveyHeader/index.jsx` |
| 7 | `side-tabs` | `[data-tour="side-tabs"]` | Sidebar icon tabs (Design, Theme, Translation, Settings, Responses) | `src/components/design/SideTabs/index.jsx` |

## Other data-tour attributes (not used in tour steps but available)

| data-tour | CSS Selector | Element | File |
|-----------|-------------|---------|------|
| `left-panel` | `[data-tour="left-panel"]` | Entire left panel wrapper | `src/components/design/LeftPanel/index.jsx` |
| `question-types` | `[data-tour="question-types"]` | Individual question type category (repeats per category) | `src/components/design/NewComponentsPanel/index.jsx` |
| `survey-header` | `[data-tour="survey-header"]` | Header bar with back arrow and survey name | `src/components/manage/SurveyHeader/index.jsx` |

## Notes

- `page-group` is conditionally applied only to the first regular page (not welcome or end type, index === 0)
- `thank-you-page` is conditionally applied only to groups with type `"end"`
- `question-types` repeats on each category div — use `question-types-list` to target the wrapper around all of them
- Debug borders are in `src/index.css` — remove the `[data-tour]` rules before shipping
