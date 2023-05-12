import Vue from 'vue';
let config = {
  logo: ''
};
export let store = Vue.observable(config);
export let mutations = {
  setLogo(logo) {
    store.logo = logo;
  }
};
