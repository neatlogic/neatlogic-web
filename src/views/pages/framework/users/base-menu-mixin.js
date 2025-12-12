export default {
  methods: {
    getMenuInfoList({groupList = []}) {
      const routerConfig = {};
      const dataList = [];

      const routerPathList = [require.context('@/views/pages', true, /router.js$/)];
      routerPathList.forEach(item => {
        item.keys().forEach(routerPath => {
          const moduleNames = routerPath.split('/')[1];
          const moduleName = moduleNames.split('-').pop() || moduleNames;
          const routeList = item(routerPath).default || [];
          routerConfig[moduleName] = routeList;
        });
      });

      const commercialRouterConfig = this.getCommercialModuleMenuInfo();
      Object.keys(commercialRouterConfig)
        .filter(key => !routerConfig[key])
        .forEach(key => {
          routerConfig[key] = commercialRouterConfig[key];
        });
      for (let key in routerConfig) {
        let groupItem = groupList.find(item => item.value == key);
        if (key && !this.$utils.isEmpty(groupItem) && !this.$utils.isEmpty(groupItem.text)) {
          dataList.push({
            text: groupItem.text,
            value: key,
            children: []
          });
          routerConfig[key].forEach(item => {
            if (item.name && item.meta && item.meta.ismenu && item.meta.authority) {
              let childrenItem = dataList.find(item => item.value == key);
              if (!this.$utils.isEmpty(childrenItem)) {
                childrenItem.children.push({
                  text: `${item.meta.title}`,
                  value: `${item.name}_${item.path}_${key}`,
                  authority: item.meta.authority ? (typeof item.meta.authority == 'string' ? item.meta.authority : typeof item.meta.authority == 'object' ? item.meta.authority.join(',') : '') : ''
                });
              }
            }
          });
        }
      }
      return dataList;
    },
    getCommercialModuleMenuInfo() {
      //商业版模块
      let routerConfig = {};
      let routerPathList = [];
      try {
        routerPathList.push(require.context('@/commercial-module', true, /router.js$/));
      } catch {
        // 模块找不到
      }
      routerPathList.forEach(item => {
        if (item && item.keys()) {
          item.keys().forEach(routerPath => {
            const moduleNames = routerPath.split('/')[1];
            const moduleName = moduleNames.split('-').pop() || moduleNames;
            const routeList = item(routerPath).default || [];
            routerConfig[moduleName] = routeList;
          });
        }
      });
      return routerConfig;
    }
  }
};
