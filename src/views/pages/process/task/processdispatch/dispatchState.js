import Vue from 'vue';
let dispatchConfit = {
  showDetailConfig: {}
};
export let store = Vue.observable(dispatchConfit);
export let mutations = {
  setShowDetailConfig(showDetailConfig) {
    store.showDetailConfig = showDetailConfig;
  }
};
