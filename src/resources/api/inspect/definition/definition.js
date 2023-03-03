import axios from '../../http';

const definition = {
  getDefinitionList(keyword) {
    // 查询巡检模块集合列表接口
    return axios.post('/api/rest/inspect/collection/search', {keyword: keyword});
  },
  saveCombinationTool(params) {
    // 组合工具设置保存接口
    return axios.post('/api/rest/inspect/combop/save', params);
  },
  getCollectionByName(name) {
    // 根据模块名称，获取集合信息
    return axios.post('/api/rest/inspect/collection/get', {name});
  },
  saveCollection(params) {
    // 保存集合
    return axios.post('/api/rest/inspect/collection/def/save', params);
  },
  getCombopList() {
    // 获取组合工具列表
    return axios.post('/api/rest/autoexec/combop/list', {
      typeId: 1,
      needPage: false
    });
  },
  getCombinationToolList(keyword) {
    // 获取巡检工具设置列表
    return axios.post('/api/rest/inspect/combop/search', {keyword: keyword});
  },
  getTargetFilter(params) {
    // 获取指标过滤列表
    return axios.post('/api/rest/inspect/collection/fields/get', params);
  },
  saveTargetFilter(params) {
    // 保存指标过滤
    return axios.post('/api/rest/inspect/collection/fields/save', params);
  },
  getThresholdsCollectionList(params) {
    // 获取应用巡检阈值设置，需要依赖mongodb
    return axios.post('/api/rest/inspect/app/thresholds/collection/list', params);
  },
  getAppCollectionFields(params) {
    // 获取应用巡检数据结构和阈值规则，需要依赖mongodb
    return axios.post('/api/rest/inspect/app/collection/fields/get', params);
  },
  saveCollectionThresholds(params) {
    // 保存应用巡检阈值设置，需要依赖mongodb
    return axios.post('/api/rest/inspect/app/collection/thresholds/save', params);
  },
  copyCollectionThreshold(params) {
    // 复制应用巡检阈值设置，需要依赖mongodb
    return axios.post('/api/rest/inspect/app/collection/thresholds/copy', params);
  },
  getThresholdSource(params) {
    // 获取应用巡检阈值来源，需要依赖mongodb
    return axios.post('/api/rest/inspect/resource/thresholds/source/get', params);
  }
};

export default definition;
