import Vue from 'vue';
let scriptData = {
  phaseShowMap: {} //流水线阶段显示map
};
export let storeScript = Vue.observable(scriptData);
export let mutationsScript = {
  setCombopPhaseShowMap(uuid, isShow) {
    if (!storeScript.phaseShowMap) {
      storeScript.phaseShowMap = {};
    }
    Vue.set(storeScript.phaseShowMap, uuid, isShow || !storeScript.phaseShowMap[uuid]);
  }
};
