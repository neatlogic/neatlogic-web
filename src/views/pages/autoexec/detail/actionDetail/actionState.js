import Vue from 'vue';
let flowConfit = {
  combopGroupList: [] //组合工具组列表
};
export let store = Vue.observable(flowConfit);
export let mutations = {
  setCombopGroupList(combopGroupList) {
    store.combopGroupList = combopGroupList;
  }
};
