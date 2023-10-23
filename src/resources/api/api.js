import autoexec from './autoexec';
import cmdb from './cmdb';
import common from './common';
import dashboard from './dashboard';
import deploy from './deploy';
import framework from './framework';
import globalsearch from './globalsearch';
import inspect from './inspect';
import knowledge from './knowledge';
import pbc from './pbc';
import process from './process';
import report from './report';
import rdm from './rdm';
import documentonline from './documentonline';
import dr from './dr';
let moduleApiConfig = {};
try {
  // 导入自定义模块，获取导出接口地址
  const apiConfig = require.context('commercial-module', true, /api.js$/);
  const moduleApiPathList = apiConfig.keys();
  moduleApiPathList.forEach(routerPath => {
    const moduleId = routerPath.split('/')[1];
    const exportValue = apiConfig(routerPath).default || {};
    const lastModuleName = moduleId.split('-');
    const moduleName = lastModuleName.pop();
    moduleApiConfig[moduleName] = exportValue;
  });
} catch (error) {
  //
}

export default {
  autoexec,
  common,
  cmdb,
  pbc,
  dashboard,
  framework,
  deploy,
  globalsearch,
  inspect,
  knowledge,
  process,
  report,
  rdm,
  documentonline,
  dr,
  ...moduleApiConfig
};
