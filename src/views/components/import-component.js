// 外部项目导入的自定义组件
let importComponentConfig = {};
let exportComponentConfig = {};
try {
  // 导入自定义组件
  const componentConfig = require.context('import-module-url', true, /component.js$/);
  const moduleComponentPathList = componentConfig.keys();
  moduleComponentPathList.forEach(routerPath => {
    const moduleName = routerPath.split('/')[1];
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
