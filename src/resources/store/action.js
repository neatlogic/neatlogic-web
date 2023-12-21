import commonApi from '@/resources/api/common/index.js';
// action提交的是mutation，而不是直接变更state。
// action可以包含任意异步操作，同步操作宜放在mutaion中。
// action函数的返回值会自动包裹在promise.resolve()里。

const Actions = {
  //从后台获取用户信息并保存在VUEX中
  async getUserInfo({ commit }) {
    const res = await commonApi.getUser();
    commit('setUserInfo', res?.Return);
    return res;
  },
  // 设置定时器
  setTimer({ commit, state }, interval = 1000) {
    state.timer = setInterval(() => {
      commit('setNowTime');
    }, interval);
    return state.timer;
  }
};

export default Actions;
