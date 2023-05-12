const state = {
  isShowTaskList: false
};

// getters
const getters = {
  getIsShowTaskList(state, getters, rootState) {
    return state.isShowTaskList;
  }
};

// actions
const actions = {};

// mutations
const mutations = {
  setIsShowTaskList(state, data) {
    state.isShowTaskList = data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
