import store from '@/resources/store';
export default {
  hasRole: function(auth) {
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
  getCurrentUser() {
    return store.state.userInfo;
  }
};
