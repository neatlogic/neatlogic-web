import store from '@/resources/store';
export default {
  hasRole: function (auth) {
    if (auth) {
      if (typeof auth == 'string') {
        return store.getters.userAuthList.includes(auth);
      } else if (auth instanceof Array) {
        let hasRole = true;
        if (auth.length > 0) {
          auth.forEach(a => {
            hasRole = store.getters.userAuthList.includes(a);
            if (!hasRole) {
              return false;
            }
          });
        }
        return hasRole;
      }
    }
    return true;
  },
  matchAuth: function (authList) {
    const userInfo = store.state.userInfo;
    if (authList && authList.length > 0) {
      //console.log(userInfo);
      //console.log(authList);
      for (let i = 0; i < authList.length; i++) {
        if (authList[i] === 'common#alluser') {
          return true;
        }
        if (authList[i] === 'user#' + userInfo.uuid) {
          return true;
        }
        if (userInfo.teamUuidList.includes(authList[i])) {
          return true;
        }
        if (userInfo.roleUuidList.includes(authList[i])) {
          return true;
        }
      }
    }
    return false;
  },
  getCurrentUser() {
    return store.state.userInfo;
  }
};
