const CompareUtil = {};
const CompareStorage = {};

CompareUtil.install = function (Vue, options) {
  Vue.prototype.$addWatchData = function (value) {
    if (value && this.$vnode && this.$vnode.tag) {
      if (!CompareStorage[this.$vnode.tag]) {
        CompareStorage[this.$vnode.tag] = {};
      }
      CompareStorage[this.$vnode.tag]['baseline'] = this.$utils.deepClone(value);
      CompareStorage[this.$vnode.tag]['current'] = value;
    }
  };
  Vue.prototype.$addBaselineData = function (value) {
    if (key && this.$vnode && this.$vnode.tag) {
      if (!CompareStorage[this.$vnode.tag]) {
        CompareStorage[this.$vnode.tag] = {};
      }
      CompareStorage[this.$vnode.tag]['baseline'] = value;
    }
  };
  Vue.prototype.$addCurrentData = function (value) {
    if (key && this.$vnode && this.$vnode.tag) {
      if (!CompareStorage[this.$vnode.tag]) {
        CompareStorage[this.$vnode.tag] = {};
      }
      CompareStorage[this.$vnode.tag]['current'] = value;
    }
  };
  Vue.mixin({
    created: function () {
      if (this.$vnode && this.$vnode.tag) {
        delete CompareStorage[this.$vnode.tag];
      }
    },
    beforeRouteLeave(to, from, next, url) {
      let isSame = true;
      if (CompareStorage[this.$vnode.tag]) {
        const oldData = CompareStorage[this.$vnode.tag]['baseline'];
        if (this.beforeLeaveCompare && typeof this.beforeLeaveCompare == 'function') {
          isSame = this.beforeLeaveCompare(oldData);
        } else {
          const newData = CompareStorage[this.$vnode.tag]['current'];
          isSame = this.$utils.isSame(oldData, newData);
        }
      }
      if (isSame) {
        url ? this.$utils.gotoHref(url) : next();
      } else {
        let _this = this;
        this.$utils.jumpDialog.call(
          this,
          {
            save: {
              //保存数据
              fn: async vnode => {
                if (_this.beforeLeave && typeof _this.beforeLeave == 'function') {
                  return await _this.beforeLeave();
                } else {
                  console.error('请在methods中声明async beforeLeave方法');
                }
              }
            }
          },
          to,
          from,
          next,
          url
        );
      }
    }
  });
};
export default CompareUtil;
