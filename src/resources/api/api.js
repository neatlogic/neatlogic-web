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
let moduleApiConfig = {};
let moduleList = ['autoexec', 'cmdb', 'common', 'dashboard', 'deploy', 'framework', 'globalsearch', 'inspect', 'knowledge', 'pbc', 'process', 'report', 'rdm', 'documentonline']; // 用于自定义页面接口导入做浅拷贝
let moduleConfig = {
  autoexec: autoexec,
  cmdb: cmdb,
  common: common,
  dashboard: dashboard,
  deploy: deploy,
  framework: framework,
  globalsearch: globalsearch,
  inspect: inspect,
  knowledge: knowledge,
  pbc: pbc,
  process: process,
  report: report,
  rdm: rdm,
  documentonline: documentonline
};
try {
  // 导入自定义模块，获取导出接口地址
  const apiConfig = require.context('@/commercial-module', true, /api.js$/);
  apiConfig.keys().forEach(apiPath => {
    if (apiPath) {
      const moduleName = apiPath.split('/')[1]?.split('-')?.pop() || apiPath.split('/')[1];
      const exportValue = apiConfig(apiPath).default || {};
      if (moduleList.includes(moduleName)) {
        moduleApiConfig[moduleName] = Object.assign(moduleConfig[moduleName], exportValue); //自定义页面接口导入，在现有模块基础上添加
      } else {
        moduleApiConfig[moduleName] = exportValue;
      }
    }
  });
} catch (error) {
  console.error('api.js抛出异常', error);
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
  ...moduleApiConfig
};
