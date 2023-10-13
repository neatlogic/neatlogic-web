let Loader = {
  load(newObj, customModule) {
    if (process.env.VUE_APP_CUSTOMMODULE) {
      try {
        if (customModule === 'formview') {
          customModule = require.context('dummy-module/components/form/view', true, /\.vue$/);
        } else if (customModule === 'formedit') {
          customModule = require.context('dummy-module/components/form/edit', true, /\.vue$/);
        } else {
          // 如果后续再加方法，直接加url再去做if就可以了
          console.error('没有定义' + customModule + '的定制组件');
        }
      } catch (e) {
        console.error('无法加载' + customModule + '的定制组件,异常：' + e);
      }
      if (customModule && newObj) {
        customModule.keys().forEach(key => {
          if (customModule(key).default.name) {
            newObj[customModule(key).default.name.toLowerCase()] = customModule(key).default;
          }
        });
      }
    }
  }
};

export default Loader;
