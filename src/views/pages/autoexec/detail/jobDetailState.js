import Vue from 'vue';
let data = {
  searchParam: {} //作业执行节点过滤条件
};
export let store = Vue.observable(data);
export let mutations = {
  setSearchParam(searchParam) {
    store.searchParam = searchParam;
  },
  getSearchParam() {
    return store.searchParam;
  }
};
