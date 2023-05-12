import menuApi from '@/resources/api/common/menu';

const state = {
  isTaskoverview: false,
  workerMenuUpdateCount: 0, // 更新工单中心左侧菜单
  workerMenuUpdateAction: null, // 保存分类
  workerMenuIsWillDo: 0, // 是否待办
  activeClassifyData: null, // 当前所有工单中心分类的数据
  taskTypeId: null, //当前工单分类id
  taskViewType: 'table', //工单中心展示类型
  dashboardAddData: null, // dashboard
  knowledgeTypeMenu: [], // 知识分类
  isKnowledgeCircleUpdated: true, //知识圈是否更新了Data
  cmdbCustomViewCount: 0, //CMDB自定义视图数量
  rdmProjectCount: 0, //RDM项目数量
  workCenterMenuData: null, //工单分类接口返回数据
  workcenterList: null,
  dashboardCount: 0, //仪表板数量
  recentIssuesMenuData: null, // 最新问题分类返回数据(巡检)
  recentIssuesList: null
};

// getters
const getters = {
  getActiveClassifyData(state, getters, rootState) {
    return state.activeClassifyData;
  },
  getTaskViewType(state, getters, rootState) {
    return state.taskViewType;
  },
  getTaskTypeId(state, getters, rootState) {
    return state.taskTypeId;
  },
  getWorkerMenuIsWillDo(state, getters, rootState) {
    return state.workerMenuIsWillDo;
  },
  getKnowLedgeTypeName(state) {
    const knowledgeTypeConfig = state.knowledgeTypeMenu.reduce((result, current) => {
      result[current.value] = current.text;
      return result;
    }, {});
    return value => {
      return knowledgeTypeConfig[value] || '知识分类';
    };
  }
};

// actions
const actions = {
  async getKnowledgeTypeMenu({ commit, state }) {
    const res = await menuApi.updateKnowledgeMenu();
    commit('setKnowledgeTypeMenu', res.Return || []);
  },
  async getWorkCenterMenuData({ commit, state }) {
    const res = await menuApi.updateProcessMenu();
    if (res && res.Status == 'OK') {
      commit('setWorkCenterMenuData', res.Return);
    }
  },
  async getRecentIssuesMenuData({ commit, state }) {
    // 获取新分类菜单
    const res = await menuApi.updateInspectMenu();
    if (res && res.Status == 'OK') {
      commit('setRecentIssuesMenuData', res.Return);
    }
  }
};

// mutations
const mutations = {
  setWorkCenterMenuData(state, data) {
    // state.workCenterMenuList.splice(0, state.workCenterMenuList.length, ...data);
    // if (!state.activeClassifyData) state.activeClassifyData = state.workCenterMenuList[0];
    state.workCenterMenuData = data;
    if (data) {
      data.viewType && (state.taskViewType = data.viewType);
      data.workcenterList && (state.workcenterList = data.workcenterList);
    }
  },
  setWorkerMenuUpdate(state, data) {
    state.workerMenuUpdateCount++;
    state.workerMenuUpdateAction = data;
  },
  setActiveClassifyData(state, data) {
    state.activeClassifyData = data;
  },
  setTaskViewType(state, data) {
    //获取工单中心数据展示类型
    state.taskViewType = data;
  },
  setTaskTypeId(state, data) {
    //获取当前是哪一个工单分类的uuid
    state.taskTypeId = data;
  },
  setIsTaskOverview(state, data) {
    state.isTaskoverview = data;
  },
  setDashboardAddData(state, data) {
    state.dashboardAddData = data;
  },
  setCmdbCustomViewCount(state, data) {
    if (data == 'add') {
      state.cmdbCustomViewCount++;
    } else {
      state.cmdbCustomViewCount--;
    }
  },
  setRdmProjectCount(state, data) {
    if (data == 'add') {
      state.rdmProjectCount++;
    } else {
      state.rdmProjectCount--;
    }
  },
  setDashboardCount(state, data) {
    if (data == 'add') {
      state.dashboardCount++;
    } else {
      state.dashboardCount--;
    }
  },
  setWorkerMenuIsWillDo(state, data) {
    if (data) {
      state.workerMenuIsWillDo = 1;
    } else {
      state.workerMenuIsWillDo = 0;
    }
  },
  setKnowledgeTypeMenu(state, data) {
    state.knowledgeTypeMenu = data;
  },
  isKnowledgeCircleUpdated(state, updated) {
    state.isKnowledgeCircleUpdated = updated;
  },
  setRecentIssuesMenuData(state, data) {
    state.recentIssuesMenuData = data;
    if (data) {
      state.recentIssuesList = data;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
