import Vue from 'vue';
let flowConfit = {
  automaticList: [], //分派器下拉列表
  allFormitemList: [] //表单组件
};
export let store = Vue.observable(flowConfit);
export let mutations = {
  setAutomaticList(automaticList) {
    store.automaticList = automaticList;
  },
  setFormItemList(allFormitemList) {
    store.allFormitemList = allFormitemList;
  }
};
