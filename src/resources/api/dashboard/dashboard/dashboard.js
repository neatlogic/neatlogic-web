import axios from '../../http';

export default {
  //仪表板获取
  getDashboard(id) {
    return axios.post('/api/rest/dashboard/get', {
      id: id
    });
  },
  //仪表板获取
  copyDashboard(data) {
    return axios.post('/api/rest/dashboard/copy', data);
  },
  //获取默认仪表板
  /*getDefault() {
    return axios.post('/api/rest/dashboard/getdefault', {});
  },*/
  //仪表板组件获取
  getWidget(data) {
    return axios.post('/api/rest/dashboard/widget/get', data);
  },

  // 获取仪表板数据
  getWidgetData(data) {
    return axios.post('/api/rest/dashboard/widget/data/get', data);
  },
  //保存仪表板
  saveDashboard(data) {
    return axios.post('/api/rest/dashboard/save', data);
  },
  //保存仪表板
  createDashboard(data) {
    return axios.post('/api/rest/dashboard/create', data);
  },
  //保存仪表板
  authorityUpdate(data) {
    return axios.post('/api/rest/dashboard/authority/update', data);
  },
  //查询仪表板
  searchDashboard(data) {
    return axios.post('/api/rest/dashboard/search', data);
  },
  //获取最近使用的仪表板
  /*getTopvisit(data) {
    return axios.post('/api/rest/dashboard/topvisit', data);
  },*/
  //删除仪表板
  deleteDashboard(id) {
    return axios.post('/api/rest/dashboard/delete', {
      id: id
    });
  },
  //设置仪表板为首页
  setDefault(data) {
    return axios.post('/api/rest/dashboard/default', data);
  },
  //获取仪表板处理器
  /*getHandler(data) {
    return axios.post('/api/rest/dashboard/handler/list', data || {});
  },*/
  //获取仪表板处理器
  conditionGet(data) {
    return axios.post('/api/rest/dashboard/condition/get', data || {});
  },
  // 获取图形配置数据
  widgetShowConfigGet(data) {
    return axios.post('/api/rest/dashboard/widget/showconfig/get', data);
  },
  // 获取图例列表
  chartList(data) {
    return axios.post('/api/rest/dashboard/chart/list', data);
  },
  // 保存图形widget
  /*saveWidget(data) {
    return axios.post('/api/rest/dashboard/widget/save', data);
  },*/
  // 删除图形widget
  /*deleteWidget(data) {
    return axios.post('/api/rest/dashboard/widget/delete', data);
  },*/
  // 高级搜索表单列表数据
  channelForm(data) {
    return axios.post('/api/rest/process/channel/form/get', data);
  }
  // 
};
