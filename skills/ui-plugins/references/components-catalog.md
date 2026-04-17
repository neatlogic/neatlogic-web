# Components Catalog
Generated from `src/resources/plugins` by scanning `.vue` files.
Use this as a discovery index; verify details in the component source before coding.

## DslEditor/dsl-editor.vue
- props:
  - `value`
  - `suggestList`
- emits:
  - `clearSuggestList`
  - `getSuggestList`
  - `input`

## DslEditor/dsl-expression.vue
- props:
  - `needInputer`
  - `expressionData`
- emits:
  - `backspace`
  - `input`

## TsCkeditor/TsCkeditor.vue
- name: `TsCkeditor`
- props:
  - `width`
- emits:
  - `change`
  - `changeVal`
  - `on-blur`
  - `on-change`
  - `ready`

## TsCodemirror/TsCodemirror.vue
- name: `TsCodemirror`
- props:
  - `isLoading`
- emits:
  - `change`
  - `onBlur`
  - `onFocus`
  - `onScroll`
  - `repeatClick`
  - `update:value`

## TsCondition/TsCondition.vue

## TsDiagram_deprecated/diagram.vue
- name: `DiagremVue`

## TsDialog/TsDialog.vue
- name: `TsDialog`
- props:
  - `zindex`
  - `type`
- emits:
  - `on-cancel`
  - `on-close`
  - `on-ok`
  - `onFull`
  - `update:isShow`

## TsForm/TsForm.vue
- name: `TsForm`
- props:
  - `labelPosition`
- emits:
  - `change`
  - `update:textConfig`

## TsForm/TsFormCascader.vue
- name: `TsFormCascader`
- props:
  - `value`
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`

## TsForm/TsFormCheckbox.vue
- name: `TsFormCheckbox`
- props:
  - `valueName`
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`

## TsForm/TsFormDatePicker.vue
- name: `TsFormDatePicker`
- props:
  - `multiple`
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
  - `type`
  - `name`
  - `value`
  - `config`
- emits:
  - `on-change`

## TsForm/TsFormInput.vue
- name: `TsFormInput`
- props:
  - `value`
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
  - `label`

## TsForm/TsFormRadio.vue
- name: `TsFormRadio`
- props:
  - `valueName`
- emits:
  - `change`
  - `change-label`
  - `on-change`
  - `update:value`

## TsForm/TsFormSelect.vue
- name: `TsFormSelect`
- props:
  - `overflow`
  - `mode`
  - `value`
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
  - `falseValue`
- emits:
  - `change`
  - `on-change`
  - `update:value`

## TsForm/TsFormTree.vue
- name: `TsFormTree`
- props:
  - `multiple`
- emits:
  - `change`
  - `change-label`
  - `load-data`
  - `on-change`

## TsQuartz/TsQuartz.vue
- name: `TsQuartz`
- props:
  - `transfer`
  - `showType`
- emits:
  - `change`
  - `input`

## TsSheet/TsSheet.vue
- props:
  - `disabled`
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
  - `formItem`
  - `formItemList`
  - `mode`
  - `disabled`
  - `readonly`
  - `isClearSpecifiedAttr`
- emits:
  - `emit`
  - `remove`
  - `resize`
  - `select`

## TsSheet/customitem-edit-dialog.vue
- props:
  - `id`
- emits:
  - `close`

## TsSheet/extend/extend-config-dialog.vue
- emits:
  - `close`

## TsSheet/extend/extend-tag-test.vue

## TsSheet/extend/extend-test.vue

## TsSheet/extend/help/config-help.vue

## TsSheet/extend/help/methods-help.vue

## TsSheet/form-edit.vue
- name: `required`
- props:
  - `initData`
  - `formData`
  - `errorData`

## TsSheet/form-item-config.vue
- name: `key`
- props:
  - `error`
  - `formItem`
  - `formItemList`
  - `customFormItem`
  - `disabled`
  - `initFormItemList`
- emits:
  - `close`
  - `editSubForm`
  - `inheritFormItem`

## TsSheet/form-item-key-dialog.vue
- name: `regex`
- props:
  - `formItemList`
- emits:
  - `close`

## TsSheet/form-item-reaction-dialog.vue
- name: `required`
- props:
  - `formItem`
  - `formItemList`
- emits:
  - `close`

## TsSheet/form-item-reaction-setvalueother-setting.vue
- name: `required`
- props:
  - `currentAttrUuid`
- emits:
  - `change`

## TsSheet/form-item.vue
- props:
  - `needLabel`
  - `showStatusIcon`
  - `mode`
  - `formItem`
  - `formItemList`
  - `value`
  - `formData`
  - `customFormItem`
  - `clearable`
  - `disabled`
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
  - `data`
- emits:
  - `close`

## TsSheet/form-reference-dialog.vue
- emits:
  - `close`

## TsSheet/form-row-reaction-dialog.vue
- props:
  - `rowcount`
  - `reaction`
  - `formItemList`
- emits:
  - `close`

## TsSheet/form-scene-dialog.vue
- emits:
  - `close`
  - `deleteScene`
  - `updateDefaultSceneUuid`
  - `updateSceneReadOnly`

## TsSheet/form-scene-edit.vue
- name: `required`
- props:
  - `initFormData`
  - `initFormConfig`
  - `formData`
  - `formConfig`

## TsSheet/form-width-dialog.vue
- emits:
  - `close`

## TsSheet/form/component/base.vue
- name: `required`
- props:
  - `mode`
  - `value`
  - `formItem`
  - `formItemList`
  - `filter`
  - `readonly`
  - `disabled`
  - `required`
  - `readonlyTextIsHighlight`
  - `isClearEchoFailedDefaultValue`
- emits:
  - `resize`
  - `setValue`

## TsSheet/form/component/customitem.vue
- props:
  - `mode`
  - `value`
  - `formItem`
  - `formItemList`
  - `filter`
  - `readonly`
  - `disabled`
  - `customFormItem`
- emits:
  - `resize`
  - `setValue`

## TsSheet/form/component/formaccounts/formaccounts-dialog.vue
- emits:
  - `close`

## TsSheet/form/component/formaccounts/index.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formcascader.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formcheckbox.vue
- props:
  - `readonly`
  - `disabled`
- emits:
  - `resize`

## TsSheet/form/component/formckeditor.vue
- props:
  - `readonly`
  - `disabled`
- emits:
  - `resize`

## TsSheet/form/component/formcollapse.vue
- props:
  - `currentTabObj`
- emits:
  - `dropHideComponent`
  - `emit`
  - `resize`
  - `select`

## TsSheet/form/component/formcube.vue

## TsSheet/form/component/formdate.vue
- name: `tomore`
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formdivider/index.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formexpression.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formlabel.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formlink.vue

## TsSheet/form/component/formnumber.vue
- name: `tonumber`
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formpassword.vue
- props:
  - `readonly`
  - `disabled`
  - `rowUuid`

## TsSheet/form/component/formradio.vue
- emits:
  - `resize`

## TsSheet/form/component/formrate.vue

## TsSheet/form/component/formscript.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formselect.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formtab.vue
- props:
  - `tabReaction`
  - `tabValue`
  - `currentTabObj`
- emits:
  - `dropHideComponent`
  - `emit`
  - `resize`
  - `select`

## TsSheet/form/component/formtable.vue
- props:
  - `readonly`
  - `disabled`
  - `extraFormItemList`

## TsSheet/form/component/formtableinputer/column-item.vue
- props:
  - `rowUuid`
  - `columnReadonly`
  - `extraUuid`
  - `rowData`
- emits:
  - `change`
  - `delete`
  - `dropHideComponent`
  - `getCurrentRowData`
  - `select`

## TsSheet/form/component/formtableinputer/index.vue
- name: `regex`
- props:
  - `readonly`
  - `disabled`
- emits:
  - `resize`

## TsSheet/form/component/formtableselector/formtableselector-datalist.vue
- props:
  - `disabled`
  - `readonly`
- emits:
  - `change`
  - `resize`

## TsSheet/form/component/formtableselector/formtableselector-dialog.vue
- props:
  - `mode`
  - `value`
  - `formItem`
  - `filter`
  - `formItemList`
  - `formData`
  - `formDataForWatch`
  - `extendConfigList`
- emits:
  - `close`

## TsSheet/form/component/formtableselector/index.vue
- props:
  - `readonly`
  - `disabled`
- emits:
  - `resize`

## TsSheet/form/component/formtableselector/search/cmdbci-search.vue
- name: `number`
- props:
  - `searchColumnDetailList`
- emits:
  - `changeConditionValue`

## TsSheet/form/component/formtableselector/search/common-search.vue
- props:
  - `searchColumnDetailList`
- emits:
  - `changeConditionValue`

## TsSheet/form/component/formtableselector/search/view/select-attr.vue
- props:
  - `attrData`
  - `valueList`

## TsSheet/form/component/formtext.vue
- name: `regex`

## TsSheet/form/component/formtextarea.vue
- name: `regex`
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formtime.vue
- name: `tomore`
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formtreeselect.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formupload.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/component/formuserselect.vue
- props:
  - `readonly`
  - `disabled`

## TsSheet/form/config/base-config.vue
- props:
  - `error`
  - `formItem`
  - `formItemList`
  - `disabled`
  - `initFormItemList`

## TsSheet/form/config/common/condition-attr-list.vue
- props:
  - `formAttrList`

## TsSheet/form/config/common/condition-group.vue
- name: `required`
- props:
  - `value`
  - `formItemList`
  - `formItem`
- emits:
  - `input`
  - `reactionValid`

## TsSheet/form/config/common/data-source-filter.vue
- props:
  - `disabled`
- emits:
  - `change`

## TsSheet/form/config/common/expression-setting.vue
- props:
  - `formItemUuid`
- emits:
  - `setConfig`

## TsSheet/form/config/common/reaction-filter.vue
- name: `required`
- props:
  - `value`
  - `formItem`
  - `formItemList`
  - `martixAttrList`
- emits:
  - `input`

## TsSheet/form/config/common/reaction-setvalue.vue
- props:
  - `value`
- emits:
  - `input`

## TsSheet/form/config/common/static-data-editor.vue
- props:
  - `needCopyValue`
  - `needBatchEdit`
  - `value`
  - `disabled`
- emits:
  - `change-level`
  - `input`

## TsSheet/form/config/common/tag-source-setting.vue
- name: `required`
- props:
  - `labelPosition`

## TsSheet/form/config/customitem-config.vue
- props:
  - `error`
  - `formItem`
  - `formItemList`
  - `customFormItem`

## TsSheet/form/config/formaccounts-conf.vue

## TsSheet/form/config/formcascader-conf.vue
- props:
  - `levelDataList`

## TsSheet/form/config/formcheckbox-conf.vue
- props:
  - `matrixConfig`

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
- props:
  - `validateSetting`

## TsSheet/form/config/formpassword-conf.vue

## TsSheet/form/config/formradio-conf.vue
- props:
  - `matrixConfig`

## TsSheet/form/config/formrate-conf.vue

## TsSheet/form/config/formscript-conf.vue

## TsSheet/form/config/formselect-conf.vue
- props:
  - `matrixConfig`

## TsSheet/form/config/formtab-conf/index.vue

## TsSheet/form/config/formtab-conf/tab-list-setting.vue
- props:
  - `needCopyValue`
  - `needBatchEdit`
  - `value`
  - `disabled`
- emits:
  - `change-level`
  - `input`

## TsSheet/form/config/formtableinputer-conf/formtableinput-data-source.vue
- name: `required`

## TsSheet/form/config/formtableinputer-conf/formtableinputer-attr-config-dialog.vue
- name: `required`
- props:
  - `formItemConfig`
  - `property`
  - `isNeedTable`
- emits:
  - `close`

## TsSheet/form/config/formtableinputer-conf/formtableinputer-table-config.vue
- props:
  - `source`
  - `formItemList`
  - `extendConfigList`
- emits:
  - `setDataConfig`

## TsSheet/form/config/formtableinputer-conf/formuserselect-setting.vue

## TsSheet/form/config/formtableinputer-conf/index.vue

## TsSheet/form/config/formtableselector-conf/formtableselector-attr-config-dialog.vue
- name: `required`
- props:
  - `formItemUuid`
  - `formItemConfig`
  - `property`
  - `formItemList`
  - `isNeedTable`
- emits:
  - `close`

## TsSheet/form/config/formtableselector-conf/index.vue
- props:
  - `matrixConfig`

## TsSheet/form/config/formtext-conf.vue
- name: `tomore`

## TsSheet/form/config/formtextarea-conf.vue
- name: `tomore`

## TsSheet/form/config/formtime-conf.vue

## TsSheet/form/config/formtreeselect-conf.vue

## TsSheet/form/config/formupload-conf.vue

## TsSheet/form/config/formuserselect-conf.vue
- props:
  - `groupConfig`

## TsSheet/subformconfig.vue
- props:
  - `currentFormData`
  - `formConfig`

## TsTopoNew/topo.vue
- name: `TsTopo`

## TsZtree/TsZtree.vue
- name: `TsZtree`
- props:
  - `nodes`
  - `url`
  - `params`
  - `rootName`
  - `idKey`
  - `pIdKey`
  - `setting`
  - `expandAll`
  - `hoverDomList`
  - `onClick`
  - `onDrop`
  - `beforeExpand`
  - `onExpand`
  - `value`
  - `enableToggleClick`
  - `beforeDrop`
  - `beforeDrag`
  - `urlKey`
  - `nodeClasses`
  - `beforeClick`
  - `renderName`
  - `renderTitle`
- emits:
  - `ready`

## VerticalPager/vertical-pager.vue
- props:
  - `currentPage`
  - `pageCount`
- emits:
  - `change`

