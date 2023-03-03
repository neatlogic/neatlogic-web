//需要修改store中的值唯一的方法就是提交mutation来修改
import * as Types from './mutation-type.js';

const Mutations = {
  // 左侧菜单的显示隐藏
  [Types.UPDATE_MENU](state, menuActive) {
    if (menuActive === 'show') {
      menuActive = 'hide';
    } else {
      menuActive = 'show';
    }
    state.menuActive = menuActive;
  },
  // 设置当前登录用户的信息
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo || {};
  },
  // 设置主题
  setThemeType(state, theme) {
    state.themeType = theme;
  },
  // 计时
  setNowTime(state) {
    state.now = Date.now();
  },
  // 停止计时
  clearTimer(state) {
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
  },
  // 设置工单超时状态
  setTaskExpire(state, isTaskExpired) {
    state.isTaskExpired = isTaskExpired;
  },
  // 侧边栏树形目录的显示和隐藏
  setSiderTreeHide(state, isSiderTreeHide) {
    state.isSiderTreeHide = isSiderTreeHide;
  },
  setMessageRead(state, payload) {
    state.readMessage = payload;
  }
};

export default Mutations;
