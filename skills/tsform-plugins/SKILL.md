---
name: tsform-plugins
description: Use when building or editing UI in this repo that needs form controls (input/select/radio/checkbox/switch/date/tree/cascader) or form layouts. Always prefer TsForm* components (TsFormInput, TsFormSelect, TsFormRadio, TsFormCheckbox, TsFormSwitch, TsFormDatePicker, TsFormTree, TsFormCascader, TsFormItem, TsForm) instead of native HTML controls or other UI libs.
---

# Tsform Plugins

## Overview

Use the TsForm plugin suite when generating pages so form controls are consistent with the project's UI system.
If a form control is needed, map it to the correct TsForm* component and follow the component's reference docs.

## Workflow

1. Identify the UI control(s) required by the page.
2. Map each control to its TsForm component (see mapping below).
3. Read the matching reference in `references/` for required props, slots, and events.
4. If the docs are insufficient, inspect the component implementation in `src/resources/plugins/TsForm/`.
5. Implement using TsForm* components; avoid native HTML inputs/selects unless no TsForm alternative exists.

If no TsForm component fits, stop and ask for guidance before using a native control.

## Component Mapping

- Text input, textarea, number, url, email, tel, password: `TsFormInput` (see `references/TsFormInput.md`)
- Select / dropdown: `TsFormSelect` (see `references/TsFormSelect.md`)
- Radio group: `TsFormRadio` (see `references/TsFormRadio.md`)
- Checkbox group: `TsFormCheckbox` (see `references/TsFormCheckbox.md`)
- Switch / toggle: `TsFormSwitch` (see `references/TsFormSwitch.md`)
- Date / datetime / time: `TsFormDatePicker` (see `references/TsFormDatePicker.md`)
- Tree select: `TsFormTree` (see `references/TsFormTree.md`)
- Cascader / multi-level selection: `TsFormCascader` (inspect `src/resources/plugins/TsForm/TsFormCascader.vue`)
- Form item wrapper / label handling: `TsFormItem` (see `references/TsFormItem.md`)
- Form layout / item list: `TsForm` (see `references/TsForm.md`)

When using config-driven `TsForm`, common `type` mappings in this repo include:

- `text`, `textarea`, `number`, `url`, `email`, `tel`, `password`: `TsFormInput`
- `select`: `TsFormSelect`
- `radio`: `TsFormRadio`
- `checkbox`: `TsFormCheckbox`
- `switch`: `TsFormSwitch`
- `date`, `datetime`, `datetimerange`, `year`, `month`, `time`, `timerange`: `TsFormDatePicker`
- `tree`: `TsFormTree`
- `cascader`: `TsFormCascader`
- `quartz`: prefer `TsQuartz` from `src/resources/plugins/TsQuartz/`
- `ckeditor`: prefer `TsCkeditor` from `src/resources/plugins/TsCkeditor/`
- `codemirror`: prefer `TsCodemirror` from `src/resources/plugins/TsCodemirror/`
- `userselect`: first inspect existing page usage or `TsSheet` implementations before adding a new control
- `slot`, `textspan`: follow existing `TsForm` page patterns

## Reference Usage

- Each TsForm component has a matching `.md` in `references/` copied from the source docs.
- Use the `.md` files for props/slots/events; use the `.vue` source for edge cases.
- Some templates in this repo use legacy tag names like `TsFromSwitch` while importing `TsFormSwitch`; follow local usage but keep the component source in `src/resources/plugins/TsForm/`.

## Source of Truth

- Primary docs: `skills/tsform-plugins/references/*.md`
- Component code: `src/resources/plugins/TsForm/`
