import Vue from 'vue';
// 工单详情页临时共享状态。
let processData = {
  // 保存类入口的全局就绪锁，避免详情或表单未初始化时提前读取数据并提交。
  isDetailReady: false,
  stepDataList: []
};
export let store = Vue.observable(processData);
export let mutations = {
  setDetailReady(isReady) {
    store.isDetailReady = !!isReady;
  },
  setStepList(stepDataList) {
    store.stepDataList = stepDataList;
  }
};
