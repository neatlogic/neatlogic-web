import Vue from 'vue';
let flowConfit = {
  combopGroupList: [], //组合工具组列表
  opType: null
};
export let store = Vue.observable(flowConfit);
export let mutations = {
  setCombopGroupList(combopGroupList) {
    store.combopGroupList = combopGroupList;
  },
  setOpType(opType) {
    store.opType = opType;
  },
  getOpType(opType) {
    return store.opType;
  }
};
