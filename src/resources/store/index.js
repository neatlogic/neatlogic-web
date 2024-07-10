import Vue from 'vue';
import Vuex from 'vuex';
import Actions from './action';
import Mutations from './mutation';
import Getters from './getter';
import leftMenu from './modules/leftMenu';
import topMenu from './modules/topMenu';
import leftTaskMenu from './modules/leftTaskMenu';

Vue.use(Vuex);
//vuex中的数据源，需要保存的数据就保存在这里
const State = {
  menuActive: 'show',
  requireRemain: false, //是否需要停留当前路由，默认不需要
  userInfo: {}, //当前用户所有信息
  themeType: null, // 存放当前主题type
  timer: null, //计时器
  now: Date.now(), //当前时间
  isTaskExpired: false, //工单是否超时
  isSiderTreeHide: false, //是否隐藏接口管理、操作审计、知识分类页面的左侧树形目录
  readMessage: null, //已读的消息，用于历史消息页面和消息中心的已读状态同步
  slaTimeList: [], // 工单时效列表，超时/剩余时间
  isUpdateExtramenu: false, //是否更新附加菜单列表
  isUpdateAutoexecJobListData: false // 是否更新自动化作业列表
};

const store = new Vuex.Store({
  modules: {
    leftMenu,
    topMenu,
    leftTaskMenu
  },
  state: State,
  mutations: Mutations,
  getters: Getters,
  actions: Actions
});
export default store;
