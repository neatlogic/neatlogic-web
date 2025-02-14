import Vue from 'vue';
//工单详情页，临时存储数据，便于在组件间共享数据
let processData = {
  stepDataList: [] // 步骤列表
};
export let store = Vue.observable(processData);
export let mutations = {
  setStepList(stepDataList) {
    store.stepDataList = stepDataList;
  }
};
