// 外部项目导入的自定义组件
let importComponentConfig = {};
let exportComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('commercial-module', true, /component.js$/);
  const moduleComponentPathList = componentConfig.keys();
  moduleComponentPathList.forEach(routerPath => {
    const moduleNames = routerPath.split('/')[1];
    const lastValue = moduleNames.split('-');
    const moduleName = lastValue?.pop() || moduleNames;
    const exportValue = componentConfig(routerPath).default || {};
    importComponentConfig[moduleName] = exportValue;
  });
  for (let key in importComponentConfig) {
    if (key && importComponentConfig[key]) {
      exportComponentConfig = Object.assign(exportComponentConfig, importComponentConfig[key]);
    }
  }
} catch (error) {
  //
}
export default {
  ...exportComponentConfig
};
