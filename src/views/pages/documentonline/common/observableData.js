import Vue from 'vue';
let documentonlineConfig = {
  globalSearchKeyword: ''
};
export let documentonlineStore = Vue.observable(documentonlineConfig);
export let documentonlineMutations = {
  setGlobalSearchKeyword(globalSearchKeyword) {
    documentonlineStore.globalSearchKeyword = globalSearchKeyword;
  }
};
