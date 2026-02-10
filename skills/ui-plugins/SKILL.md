---
name: ui-plugins
description: Use when generating or editing UI in this repo so code uses existing components from src/resources/plugins instead of native HTML or ad-hoc widgets. Applies to pages, dialogs, inputs, editors, trees, pagers, and form-related UI.
---

# UI Plugins

## Overview

Keep UI consistent by preferring existing plugin components under `src/resources/plugins`.
Before adding native HTML or a third-party widget, check the plugin inventory and reuse a matching component.
Also prefer the global UI library `neatlogic-ui` (iview-based) components when a plugin component is not the right fit.

## Workflow

1. Identify the UI requirement (input/select/dialog/pager/editor/tree/etc.).
2. Check `references/components-index.md` for an existing component under `src/resources/plugins`.
3. Open the component `.vue` file to confirm props, events, slots, and usage.
4. If no plugin fits, prefer `neatlogic-ui` components (global ViewUI install).
5. Avoid native HTML unless neither plugin nor `neatlogic-ui` fits.
6. If there is no suitable component, stop and ask for guidance.

## Selection Notes

- For form controls and form layouts, prefer TsForm components and follow the `tsform-plugins` skill.
- Some components are internal helpers; use top-level components in each plugin directory unless a page already uses the internal one.
- `neatlogic-ui` is installed globally in `src/resources/base.js` (`Vue.use(ViewUI)`), so its components can be used without local registration.
- UI theme and iview overrides live in `src/resources/assets/css/common.less`; design tokens are in `src/resources/assets/css/variable.less`.

## Resources

### references/
- `references/components-index.md`: Inventory of plugin directories and entry components.
- `references/components-catalog.md`: Auto-scanned component catalog with names, props, and emitted events.
- `references/components-details.md`: Deep scan of component props/defaults/model/emits/slots extracted from source.
- `references/neatlogic-ui-components.md`: Component inventory for `neatlogic-ui` (iview-based) from `node_modules`.
