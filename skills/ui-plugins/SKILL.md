---
name: ui-plugins
description: Use when generating or editing UI in this repo so code reuses existing components from src/resources/plugins and src/resources/components instead of native HTML or ad-hoc widgets. Applies to pages, dialogs, inputs, editors, trees, pagers, and form-related UI.
---

# UI Plugins

## Overview

Keep UI consistent by preferring existing reusable components under `src/resources/plugins` and `src/resources/components`.
Before adding native HTML or a third-party widget, check the plugin inventory and existing shared components first.
Also prefer the global UI library `neatlogic-ui` (iview-based) components when a plugin component is not the right fit.

## Workflow

1. Identify the UI requirement (input/select/dialog/pager/editor/tree/etc.).
2. Check `references/components-index.md` for an existing component under `src/resources/plugins`.
3. If no plugin fits, inspect `src/resources/components/` for an existing shared component before creating a new one.
4. Open the chosen component `.vue` file to confirm props, events, slots, and usage.
5. If no local reusable component fits, prefer `neatlogic-ui` components (global ViewUI install).
6. Do not introduce native HTML widgets as direct replacements for existing project components.
7. If no project component or `neatlogic-ui` component fits, stop and ask for guidance.

## Selection Notes

- For form controls and form layouts, prefer TsForm components and follow the `tsform-plugins` skill.
- `references/components-index.md` only covers `src/resources/plugins`; it does not include `src/resources/components`.
- Reuse mature shared components in `src/resources/components` such as `UserSelect`, `TsTable`, `TsTree`, and `ReferenceSelect` when they match the page requirement.
- Existing project components are the default choice for ongoing development; do not fall back to native HTML controls when a project component already covers the need.
- Some components are internal helpers; use top-level components in each plugin directory unless a page already uses the internal one.
- `neatlogic-ui` is installed globally in `src/resources/base.js` (`Vue.use(ViewUI)`), so its components can be used without local registration.
- UI theme and iview overrides live in `src/resources/assets/css/common.less`; design tokens are in `src/resources/assets/css/variable.less`.

## Resources

### references/
- `references/components-index.md`: Inventory of plugin directories and entry components.
- `references/components-catalog.md`: Auto-scanned component catalog with names, props, and emitted events.
- `references/components-details.md`: Deep scan of component props/defaults/model/emits/slots extracted from source.
- `references/neatlogic-ui-components.md`: Component inventory for `neatlogic-ui` (iview-based) from `node_modules`.
