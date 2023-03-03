//getters 可以用于监听、操作state中的值的变化，返回计算后的结果
import * as Types from './mutation-type.js';

const Getters = {
  themeType(state) {
    if (state.themeType === 'theme-dark') return 'dark';
    else return 'default';
  },
  // 当前登录用户的头像URL
  userAvatar(state) {
    if (!state.userInfo || Object.keys(state.userInfo).length === 0) return null;
    if (state.userInfo.avatar) {
      return BASEURLPREFIX + '/' + state.userInfo.avatar;
    } 
    return require('@/resources/assets/images/avatar/user.png');
  },
  // 当前登录用户的所有权限列表
  userAuthList(state) {
    if (!state.userInfo.userAuthList) return [];
    return state.userInfo.userAuthList.map(item => item.auth) || [];
  },
  // 返回一个函数，函数根据入参vipLevel可以获取用户的VIP等级图标
  getVipIconByLevel(state, getters) {
    let canViewVip = getters.userAuthList.includes('VIP_VIEW');
    return (vipLevel, hasAuth = canViewVip) => {
      if (hasAuth && [1, 2, 3, 4, 5].includes(vipLevel)) {
        return require(`@/resources/assets/images/vip/${vipLevel}.png`);
      }
      return '';
    };
  }
};

export default Getters;
