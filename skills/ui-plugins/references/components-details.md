# Components Detailed Catalog
Generated from `src/resources/plugins` by scanning component source. Treat as a guide; confirm details in the `.vue` file for edge cases.

## DslEditor/dsl-editor.vue
- props:
  - `value` (type=String)
  - `suggestList` (type=Array)
- emits:
  - `clearSuggestList`
  - `getSuggestList`
  - `input`

## DslEditor/dsl-expression.vue
- props:
  - `needInputer` (type=Boolean, default=false)
  - `expressionData` (type=Object)
- emits:
  - `backspace`
  - `input`

## TsCkeditor/TsCkeditor.vue
- name: `TsCkeditor`
- props:
  - `width` (type=String, default='100%')
  - `value` (default='')
  - `showIconToggle` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
  - `placeholder` (type=String)
  - `onChange` (type=Function)
  - `removePlugins` (default=() => [])
  - `params` (default=() => {})
- emits:
  - `change`
  - `changeVal`
  - `on-blur`
  - `on-change`
  - `ready`
- slots:
  - `validMessage`

## TsCodemirror/TsCodemirror.vue
- name: `TsCodemirror`
- props:
  - `isLoading` (type=Boolean, default=false)
  - `loadingText` (type=String, default='')
  - `lineNumbers` (type=Boolean, default=true)
  - `value` (type=String, default='')
  - `classCode` (default='')
  - `isReadOnly` (type=Boolean, default=false)
  - `theme` (type=String, default='eclipse')
  - `height` (type=String, default='100%')
  - `code` (type=String, default='')
  - `blurText` (type=String, default='')
  - `disabled` (default=false)
  - `config` (type=Object)
  - `placeholder` (type=String)
  - `isCopy` (type=Boolean, default=false)
- emits:
  - `change`
  - `onBlur`
  - `onFocus`
  - `onScroll`
  - `repeatClick`
  - `update:value`
- slots:
  - `validMessage`

## TsCondition/TsCondition.vue

## TsDiagram_deprecated/diagram.vue
- name: `DiagremVue`

## TsDialog/TsDialog.vue
- name: `TsDialog`
- props:
  - `zindex` (type=Number)
  - `type` (default='modal')
  - `fullscreen` (default=false)
  - `top` (type=String)
  - `hasHeader` (default=true)
  - `isScrollbar` (default=false)
  - `hasFooter` (default=true)
  - `position` (default='right')
  - `hasMask` (default=true)
  - `loading` (default=false)
  - `width` (default='small')
  - `height` (type=String)
  - `maskClose` (default=false)
  - `className` (type=String)
  - `okText`
  - `okBtnDisable` (default=false)
  - `cancelText`
  - `title`
  - `content`
  - `showCloseIcon` (default=true)
  - `btnType` (default='primary')
  - `bgOp` (default=false)
  - `defaultFull` (default=false)
  - `btnList`
  - `transfer` (type=Boolean, default=true)
  - `theme` (type=Object)
- emits:
  - `on-cancel`
  - `on-close`
  - `on-ok`
  - `onFull`
  - `update:isShow`
- slots:
  - `default`
  - `footer`
  - `header`

## TsForm/TsForm.vue
- name: `TsForm`
- props:
  - `labelPosition` (default='right')
  - `labelAlign` (type=String, default='top')
  - `tooltip` (type=String)
  - `tipPlacement` (type=String)
  - `itemList` (type=[Array, Object], required=true)
  - `dataConfig` (type=[Object, String, Boolean])
  - `border`
  - `itemWidth` (type=[Number, String])
  - `width` (type=[String, Number], default='100%' // 默认改为100%，之前是75%)
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
  - `isHidden` (type=Boolean, default=false)
  - `filterEmpty` (default=false)
  - `theme` (type=Object //主题)
- emits:
  - `change`
  - `update:textConfig`

## TsForm/TsFormCascader.vue
- name: `TsFormCascader`
- props:
  - `value` (default=null)
  - `dataList` (type=Array)
  - `format` (type=Function)
  - `changeOnSelect` (default=false)
  - `trigger` (type=String, default='click')
  - `clearable` (type=Boolean, default=true)
  - `placeholder` (type=String)
  - `filterable` (type=Boolean, default=false)
  - `transfer` (type=Boolean, default=false)
  - `isChangeWrite` (default=true)
  - `onChange` (type=Function //改变时触发)
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`
- slots:
  - `validMessage`

## TsForm/TsFormCheckbox.vue
- name: `TsFormCheckbox`
- props:
  - `dataList` (type=Array)
  - `name` (type=String)
  - `valueName` (default='value')
  - `textName` (default='text')
  - `value` (default=() => [])
  - `url` (default='')
  - `params` (type=Object)
  - `rootName`
  - `vertical` (default=false)
  - `disabled` (type=Boolean, default=false)
  - `onChange` (type=Function)
  - `sperateText` (type=String, default='|')
  - `dealDataByUrl`
  - `ajaxType` (type=String, default='post')
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`

## TsForm/TsFormDatePicker.vue
- name: `TsFormDatePicker`
- props:
  - `type` (type=String)
  - `format` (type=String)
  - `clearable` (type=Boolean, default=true)
  - `value`
  - `placeholder` (type=String)
  - `valueType` (default='normal' // normal timestamp format)
  - `splitPanels` (default=false)
  - `transfer` (type=Boolean)
  - `scrollParent` (type=[Object, String])
  - `options` (type=[Object])
  - `open` (default=null)
  - `separator` (default='-')
  - `placement` (type=String, default='bottom-start')
  - `timePickerOptions` (default=null)
  - `selectableRange` (default=null)
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `on-clear`
  - `on-clickoutside`
  - `on-ok`
  - `update:value`

## TsForm/TsFormHandler.vue
- name: `TsFormHandler`
- props:
  - `type` (type=String)
- emits:
  - `on-change`

## TsForm/TsFormInput.vue
- name: `TsFormInput`
- props:
  - `type` (type=String)
  - `name` (type=String)
  - `value` (default='')
  - `maxlength` (type=[Number, String])
  - `placeholder` (type=String)
  - `onChange` (type=Function)
  - `autosize`
  - `isChangeWrite` (default=true)
  - `prepend` (type=String)
  - `append` (type=String)
  - `prefix` (type=String)
  - `suffix` (type=String)
  - `icon` (type=String)
  - `height` (default=false)
  - `showRemain` (default=true)
  - `search` (default=false)
  - `min` (type=Number)
  - `max` (type=Number)
  - `theme` (type=Object)
- emits:
  - `change`
  - `change-label`
  - `clickIcon`
  - `on-`
  - `on-blur`
  - `on-change`
  - `on-clear`
  - `on-enter`
  - `on-focus`
  - `on-search`
  - `update:value`

## TsForm/TsFormItem.vue
- name: `TsFormItem`
- props:
  - `label` (type=String, default='')
  - `labelWidth` (default=120)
  - `labelStrong` (type=Boolean, default=false)
  - `error` (type=String)
  - `labelFor` (type=String)
  - `labelPosition` (type=String, default='right')
  - `contentAlign`
  - `labelAlign` (default='top')
  - `validateList` (type=Array, default=function() { return []; })
  - `name` (type=String)
  - `itemWidth` (type=[Number, String])
  - `required` (type=Boolean)
  - `tooltip` (type=String)
  - `tipPlacement` (type=String)
  - `type` (type=String)
  - `readonly` (type=Boolean, default=false)
  - `disabled` (default=false)
  - `buttonList` (type=Array)
  - `theme` (type=Object //主题)
- slots:
  - `default`

## TsForm/TsFormRadio.vue
- name: `TsFormRadio`
- props:
  - `dataList` (type=Array)
  - `name` (type=String)
  - `radioType` (type=String)
  - `textName` (default='text')
  - `value` (type=[String, Number, Boolean, Object, Array], default='')
  - `url` (default='')
  - `params` (type=Object)
  - `rootName`
  - `onChange` (type=Function)
  - `dealDataByUrl`
  - `ajaxType` (type=String, default='post')
  - `disabled` (type=Boolean, default=false)
  - `descName`
  - `allowToggle` (default=false)
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`
- slots:
  - `label`
  - `validMessage`

## TsForm/TsFormSelect.vue
- name: `TsFormSelect`
- props:
  - `name` (type=String)
  - `overflow` (type=Boolean, default=true)
  - `mode` (type=String, default='normal')
  - `search` (type=[Boolean, null], default=null)
  - `keyword` (type=String, default='keyword')
  - `idListName`
  - `placeholder` (type=String)
  - `firstText`
  - `multiple` (type=Boolean, default=false)
  - `allowCreate` (default=false)
  - `url` (default='')
  - `params` (type=Object)
  - `defaultValueIsFirst` (default=false)
  - `dynamicUrl` (default='')
  - `dynamicDefaultValue` (default=() => [])
  - `rootName`
  - `dataList` (type=Array)
  - `textName`
  - `tooltipName` (default='tooltip')
  - `childrenName`
  - `parentValueName`
  - `parentTextName`
  - `isEqualValue` (default=false)
  - `filterName`
  - `showName` (type=String)
  - `validateList` (type=Array)
  - `transfer` (type=Boolean, default=false)
  - `clearable` (type=Boolean, default=true)
  - `onBlur` (type=Function)
  - `onChangelabel` (type=Function)
  - `sperateText` (type=String, default='|')
  - `dealDataByUrl`
  - `ajaxType` (type=String, default='post')
  - `placement`
  - `needCallback` (default=false)
  - `firstLi` (default=false)
  - `firstIcon` (type=String, default='tsfont-plus text-href first-slot')
  - `firstSelect` (default=true)
  - `nowrapHead` (default=false)
  - `isNowrap` (default=false)
  - `dropdownMenuMaxWidth` (default=false)
  - `theme` (type=Object)
  - `isAutoSelectdOnlyValue` (default=false)
  - `pageSize` (default=20)
  - `isCanAll` (default=false)
  - `allText`
- emits:
  - `change`
  - `change-label`
  - `enter-search`
  - `first`
  - `inputBlur`
  - `on-blur`
  - `on-change`
  - `on-create`
  - `on-first`
  - `on-focus`
  - `on-open-change`
  - `searchCallback`
  - `update:needCallback`
  - `update:selectItemList`

## TsForm/TsFormSwitch.vue
- name: `TsFormSwitch`
- props:
  - `name` (type=String)
  - `falseValue` (default=0)
  - `trueValue` (default=1)
  - `value` (type=[String, Number, Boolean], default=false)
  - `onChange` (type=Function)
  - `beforeChange` (type=Function)
  - `trueText` (type=String)
  - `falseText` (type=String)
- emits:
  - `change`
  - `on-change`
  - `update:value`

## TsForm/TsFormTree.vue
- name: `TsFormTree`
- props:
  - `name` (type=String)
  - `multiple` (default=false)
  - `value`
  - `transfer` (type=Boolean, default=false)
  - `onChange` (type=Function)
  - `search` (default=false)
  - `rootName` (default='')
  - `valueName` (default='value')
  - `textName` (default='text')
  - `keyword` (type=String, default='keyword')
  - `dataList` (type=Array)
  - `size` (default='')
  - `childrenKey` (default='children')
  - `params` (type=Object)
  - `placeholder` (type=String)
  - `clearable` (type=Boolean, default=true)
  - `selectLastLevel` (type=Boolean, default=false)
  - `showPath` (default=false)
  - `disabled` (type=Boolean, default=false)
  - `sperateText` (type=String, default='/')
  - `ajaxType` (type=String, default='post')
  - `onChangelabel` (type=Function //改变时获取text触发)
- emits:
  - `change`
  - `change-label`
  - `load-data`
  - `on-change`

## TsQuartz/TsQuartz.vue
- name: `TsQuartz`
- props:
  - `transfer` (type=Boolean, default=true)
  - `value` (type=String)
  - `showType` (default='edit')
  - `config` (type=Object)
  - `desc` (type=String)
  - `onChange` (type=Function //改变时触发)
- emits:
  - `change`
  - `input`

## TsSheet/TsSheet.vue
- props:
  - `disabled` (type=Boolean, default=false)
  - `readonly` (type=Boolean, default=false)
  - `init` (type=Array, default=() => { return [10, 5]; })
  - `value` (type=Object)
  - `isFormSubassembly` (default=false)
  - `formSceneUuid` (type=[String, Number])
  - `isNeedValid` (default=true)
  - `isClearSpecifiedAttr` (default=false)
  - `disabledHideComponent` (default=false)
  - `externalData` (default=() => {})
  - `rowUuid` (type=String)
- emits:
  - `emit`
  - `input`
  - `removeComponent`
  - `resize`
  - `selectCell`
  - `setValue`
  - `updateFormValue`
  - `updateHiddenComponentList`
  - `updateHideComponentList`
  - `updateItemList`
  - `updateResize`

## TsSheet/child-form-item.vue
- props:
  - `formData` (type=Object)
  - `formItem` (type=Object)
  - `formItemList` (type=Array)
  - `mode` (type=String, default='edit')
  - `readonly` (type=Boolean, default=false)
  - `isClearSpecifiedAttr` (default=false)
  - `externalData` (default=() => {})
  - `needLabel` (default=false)
  - `disabledDelete` (default=false)
  - `formDataForWatch` (type=Object, default=() => {})
  - `extendConfigList` (type=Array, default=() => [] // 标签扩展配置列表)
- emits:
  - `emit`
  - `remove`
  - `resize`
  - `select`

## TsSheet/customitem-edit-dialog.vue
- props:
  - `id` (type=Number)
- emits:
  - `close`

## TsSheet/extend/extend-config-dialog.vue
- props:
  - `formItemList` (type=Array)
  - `list` (type=Array)
- emits:
  - `close`

## TsSheet/extend/extend-tag-test.vue
- props:
  - `extendConfigList` (type=Array)
  - `formItemList` (type=Array)
  - `formData` (type=[Array, Object])

## TsSheet/extend/extend-test.vue
- props:
  - `config` (type=Object)
  - `formItemList` (type=Array)

## TsSheet/extend/help/config-help.vue

## TsSheet/extend/help/methods-help.vue

## TsSheet/form-edit.vue
- name: `required`

## TsSheet/form-item-config.vue
- name: `key`
- props:
  - `error` (type=Array)
  - `initFormItemList` (default=() => [])
  - `source` (type=String, default='')
- emits:
  - `close`
  - `editSubForm`
  - `inheritFormItem`

## TsSheet/form-item-key-dialog.vue
- name: `regex`
- props:
  - `formItemList` (type=Array, default=() => [])
  - `copyedCell` (type=Object, default=() => {})
- emits:
  - `close`

## TsSheet/form-item-reaction-dialog.vue
- name: `required`
- props:
  - `formItem` (type=Object)
- emits:
  - `close`

## TsSheet/form-item-reaction-setvalueother-setting.vue
- name: `required`
- props:
  - `currentAttrUuid` (type=String, default='')
  - `value` (type=Array, default=() => [])
  - `hiddenFieldList` (default=() => [])
  - `attrList` (default=() => [])
- emits:
  - `change`

## TsSheet/form-item.vue
- props:
  - `needLabel` (type=Boolean, default=false)
  - `formItemList` (type=Array)
  - `disabled` (type=Boolean, default=false)
  - `readonly` (type=Boolean, default=false)
  - `formHighlightData` (type=Object, default=function() { return {}; })
  - `isClearEchoFailedDefaultValue` (default=false)
  - `isCustomValue` (default=false)
  - `formExtendData` (type=Object, default=() => {})
  - `isEnableDefaultValue` (default=true)
  - `isClearSpecifiedAttr` (default=false)
  - `externalData` (default=() => {})
  - `rowUuid` (type=String)
  - `extraFormItemList` (type=Array, default=() => [])
  - `isSetValue` (default=true)
  - `formDataForWatch` (type=Object, default=() => {})
  - `isNeedVadliValidate` (default=false)
- emits:
  - `change`
  - `delete`
  - `dropHideComponent`
  - `resize`
  - `select`
  - `setValue`
  - `updateHiddenComponentList`
  - `updateReactionSetValue`

## TsSheet/form-preview.vue
- props:
  - `data` (type=Object)
  - `formSceneUuid` (type=[String, Array])
  - `extendConfigList` (type=Array)
- emits:
  - `close`

## TsSheet/form-reference-dialog.vue
- props:
  - `formUuid` (type=String)
- emits:
  - `close`

## TsSheet/form-row-reaction-dialog.vue
- props:
  - `rowcount` (type=Number)
- emits:
  - `close`

## TsSheet/form-scene-dialog.vue
- props:
  - `uuid` (type=String)
  - `currentVersionUuid` (type=String)
  - `sceneUuid` (type=String)
  - `data` (type=Object)
  - `formConfig` (type=Object)
  - `processTaskId` (type=Number)
- emits:
  - `close`
  - `deleteScene`
  - `updateDefaultSceneUuid`
  - `updateSceneReadOnly`

## TsSheet/form-scene-edit.vue
- name: `required`

## TsSheet/form-width-dialog.vue
- props:
  - `formWidth` (type=Object)
- emits:
  - `close`

## TsSheet/form/component/base.vue
- name: `required`
- props:
  - `mode` (type=String, default='edit')
  - `formItemList` (type=Array, default=() => [])
  - `filter` (type=Array)
  - `disabled` (type=Boolean, default=false)
  - `required` (type=Boolean, default=false)
  - `formData` (type=Object)
  - `readonlyTextIsHighlight` (type=Boolean, default=false)
  - `isCustomValue` (default=false)
  - `isEnableDefaultValue` (default=true)
  - `isClearSpecifiedAttr` (default=false)
  - `externalData` (default=() => {})
  - `extendConfigList` (default=() => [])
  - `formDataForWatch` (type=Object, default=() => {})
  - `isNeedVadliValidate` (default=false)
- emits:
  - `resize`
  - `setValue`

## TsSheet/form/component/customitem.vue
- props:
  - `mode` (type=String, default='edit')
  - `formItemList` (type=Array)
  - `disabled` (type=Boolean, default=false)
  - `customFormItem` (type=Object}//测试时直接从外部传入的组件数)
- emits:
  - `resize`
  - `setValue`

## TsSheet/form/component/formaccounts/formaccounts-dialog.vue
- props:
  - `value` (type=Array)
- emits:
  - `close`

## TsSheet/form/component/formaccounts/index.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formcascader.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formcheckbox.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
- emits:
  - `resize`

## TsSheet/form/component/formckeditor.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
- emits:
  - `resize`

## TsSheet/form/component/formcollapse.vue
- emits:
  - `dropHideComponent`
  - `emit`
  - `resize`
  - `select`

## TsSheet/form/component/formcube.vue

## TsSheet/form/component/formdate.vue
- name: `tomore`
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formdivider/index.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formexpression.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formlabel.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formlink.vue

## TsSheet/form/component/formnumber.vue
- name: `tonumber`
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formpassword.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
  - `rowUuid` (type=String, default='' } //表格内嵌套时， 当前行uui)

## TsSheet/form/component/formradio.vue
- emits:
  - `resize`

## TsSheet/form/component/formrate.vue

## TsSheet/form/component/formscript.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formselect.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formtab.vue
- emits:
  - `dropHideComponent`
  - `emit`
  - `resize`
  - `select`

## TsSheet/form/component/formtable.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
  - `extraFormItemList` (type=Array, default=() => [])

## TsSheet/form/component/formtableinputer/column-item.vue
- props:
  - `rowUuid` (type=String)
  - `rowData` (type=Object, default=() => {})
  - `reactionData` (type=Object, default=() => {})
  - `reactionValueData` (type=Object, default=() => {})
  - `expressionData` (default=() => {})
- emits:
  - `change`
  - `delete`
  - `dropHideComponent`
  - `getCurrentRowData`
  - `select`

## TsSheet/form/component/formtableinputer/index.vue
- name: `regex`
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
- emits:
  - `resize`

## TsSheet/form/component/formtableselector/formtableselector-datalist.vue
- props:
  - `disabled` (type=Boolean)
  - `readonly` (type=Boolean, default=false)
  - `isClearSpecifiedAttr` (default=false)
  - `formItemList` (type=Array)
  - `formData` (type=Object)
- emits:
  - `change`
  - `resize`

## TsSheet/form/component/formtableselector/formtableselector-dialog.vue
- props:
  - `mode` (type=String, default='edit')
  - `filter` (type=Array)
  - `formItemList` (type=Array)
  - `formData` (type=Object)
  - `formDataForWatch` (type=Object)
  - `extendConfigList` (default=() => [])
  - `externalData` (default=() => {})
- emits:
  - `close`

## TsSheet/form/component/formtableselector/index.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)
- emits:
  - `resize`

## TsSheet/form/component/formtableselector/search/cmdbci-search.vue
- name: `number`
- props:
  - `searchColumnDetailList` (type=Array, default=() => [])
  - `filter` (type=Array)
  - `searchConditionValueList` (type=Array)
- emits:
  - `changeConditionValue`

## TsSheet/form/component/formtableselector/search/common-search.vue
- props:
  - `searchColumnDetailList` (type=Array, default=() => [])
  - `filter` (type=Array)
  - `searchConditionValueList` (type=Array //搜索条件的值列表)
- emits:
  - `changeConditionValue`

## TsSheet/form/component/formtableselector/search/view/select-attr.vue
- props:
  - `attrData` (type=Object)
  - `valueList` (type=Array)

## TsSheet/form/component/formtext.vue
- name: `regex`

## TsSheet/form/component/formtextarea.vue
- name: `regex`
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formtime.vue
- name: `tomore`
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formtreeselect.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formupload.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/component/formuserselect.vue
- props:
  - `readonly` (type=Boolean, default=false)
  - `disabled` (type=Boolean, default=false)

## TsSheet/form/config/base-config.vue
- props:
  - `error` (type=Array)
  - `initFormItemList` (type=Array, default=() => [])
  - `source` (type=String, default='')

## TsSheet/form/config/common/condition-attr-list.vue
- props:
  - `formAttrList` (type=Array)

## TsSheet/form/config/common/condition-group.vue
- name: `required`
- props:
  - `value` (type=Object)
  - `formItemList` (type=Array)
  - `formItem` (type=Object, default=() => {})
  - `reactionKey` (type=String)
- emits:
  - `input`
  - `reactionValid`

## TsSheet/form/config/common/data-source-filter.vue
- props:
  - `dataList` (type=[Array])
  - `matrixType` (type=String)
  - `value` (type=[Array])
  - `disabled` (type=Boolean, default=false)
- emits:
  - `change`

## TsSheet/form/config/common/expression-setting.vue
- props:
  - `formItemUuid` (default='')
  - `attrUuid` (default='')
  - `formItemList` (default=() => [])
  - `value` (type=Object, default=() => {})
  - `isRequired` (type=Boolean, default=false)
- emits:
  - `setConfig`

## TsSheet/form/config/common/reaction-filter.vue
- name: `required`
- props:
  - `value` (type=Object)
  - `formItem` (type=Object)
  - `martixAttrList` (type=Array)
- emits:
  - `input`

## TsSheet/form/config/common/reaction-setvalue.vue
- props:
  - `value` (type=[Array, Object], default=null)
  - `formItem` (type=Object, default=() => {})
  - `formItemList` (type=Array, default=() => [])
- emits:
  - `input`

## TsSheet/form/config/common/static-data-editor.vue
- props:
  - `needCopyValue` (type=Boolean, default=true)
  - `value` (type=Array)
  - `disabled` (type=Boolean, default=false)
- emits:
  - `change-level`
  - `input`

## TsSheet/form/config/common/tag-source-setting.vue
- name: `required`
- props:
  - `labelPosition` (type=String, default='top')
  - `config` (type=Object)
  - `disabled` (type=Boolean, default=false)
  - `extendConfigList` (type=Array, default=() => [])
  - `error` (type=Array, default=() => [])

## TsSheet/form/config/customitem-config.vue
- props:
  - `error` (type=Array)

## TsSheet/form/config/formaccounts-conf.vue

## TsSheet/form/config/formcascader-conf.vue

## TsSheet/form/config/formcheckbox-conf.vue

## TsSheet/form/config/formckeditor-conf.vue

## TsSheet/form/config/formcollapse-conf.vue

## TsSheet/form/config/formcube-conf.vue

## TsSheet/form/config/formdate-conf.vue

## TsSheet/form/config/formdivider-conf.vue

## TsSheet/form/config/formexpression-conf.vue

## TsSheet/form/config/formlabel-conf.vue
- emits:
  - `setValue`

## TsSheet/form/config/formlink-conf.vue

## TsSheet/form/config/formnumber-conf.vue
- name: `maxNumber`

## TsSheet/form/config/formpassword-conf.vue

## TsSheet/form/config/formradio-conf.vue

## TsSheet/form/config/formrate-conf.vue

## TsSheet/form/config/formscript-conf.vue

## TsSheet/form/config/formselect-conf.vue

## TsSheet/form/config/formtab-conf/index.vue

## TsSheet/form/config/formtab-conf/tab-list-setting.vue
- props:
  - `needCopyValue` (type=Boolean, default=true)
  - `value` (type=Array)
  - `disabled` (type=Boolean, default=false)
  - `formItemList` (type=Array)
- emits:
  - `change-level`
  - `input`

## TsSheet/form/config/formtableinputer-conf/formtableinput-data-source.vue
- name: `required`
- props:
  - `propertyLocal` (type=Object)
  - `formItemUuid` (type=String)
  - `formItemList` (type=Array)

## TsSheet/form/config/formtableinputer-conf/formtableinputer-attr-config-dialog.vue
- name: `required`
- props:
  - `formItemConfig` (type=Object)
  - `isNeedReaction` (type=Boolean, default=true)
  - `formItemList` (default=() => [])
  - `formItemUuid` (type=String)
  - `source` (type=String, default='')
- emits:
  - `close`

## TsSheet/form/config/formtableinputer-conf/formtableinputer-table-config.vue
- props:
  - `config` (type=Object)
  - `source` (type=String, default='')
  - `formItemList` (type=Array, default=() => [])
  - `extendConfigList` (type=Array, default=() => []} // 标签扩展配置列)
- emits:
  - `setDataConfig`

## TsSheet/form/config/formtableinputer-conf/formuserselect-setting.vue
- props:
  - `propertyLocal` (type=Object)

## TsSheet/form/config/formtableinputer-conf/index.vue

## TsSheet/form/config/formtableselector-conf/formtableselector-attr-config-dialog.vue
- name: `required`
- props:
  - `formItemUuid` (type=String)
  - `isNeedTable` (default=true)
  - `source` (type=String, default='')
  - `extendConfigList` (type=Array, default=() => [] } // 标签扩展配置列)
- emits:
  - `close`

## TsSheet/form/config/formtableselector-conf/index.vue

## TsSheet/form/config/formtext-conf.vue
- name: `tomore`

## TsSheet/form/config/formtextarea-conf.vue
- name: `tomore`

## TsSheet/form/config/formtime-conf.vue

## TsSheet/form/config/formtreeselect-conf.vue

## TsSheet/form/config/formupload-conf.vue

## TsSheet/form/config/formuserselect-conf.vue

## TsSheet/subformconfig.vue

## TsTopoNew/topo.vue
- name: `TsTopo`
- props:
  - `sdata` (type=Object)
  - `opts` (type=Object)

## TsZtree/TsZtree.vue
- name: `TsZtree`
- props:
  - `nodes` (type=Array)
  - `url` (type=String)
  - `params` (type=Object)
  - `expandAll` (type=Boolean, default=true)
  - `onClick` (type=Function)
- emits:
  - `ready`

## VerticalPager/vertical-pager.vue
- props:
  - `currentPage` (type=Number)
  - `pageCount` (type=Number)
- emits:
  - `change`

