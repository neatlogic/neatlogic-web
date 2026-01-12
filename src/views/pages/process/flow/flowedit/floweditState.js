import Vue from 'vue';
let flowConfit = {
  automaticList: [], //分派器下拉列表
  allFormitemList: [], //表单组件
  currentFormConfig: {} //当前表单配置
};
export let store = Vue.observable(flowConfit);
export let mutations = {
  setAutomaticList(automaticList) {
    store.automaticList = automaticList;
  },
  setFormItemList(allFormitemList) {
    store.allFormitemList = allFormitemList;
  },
  setCurrtentFormConfig(formConfig) {
    store.currentFormConfig = formConfig || {};
  }
};
