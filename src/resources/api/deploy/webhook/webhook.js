import axios from '../../http';
const webhook = {
  searchJobWebhookList(params) {
    // 查询触发器
    return axios.post('/api/rest/deploy/job/webhook/search', params);
  },
  getJobWebhookById(params) {
    // 根据id查询作业触发器详情
    return axios.post('/api/rest/deploy/job/webhook/get', params);
  },
  getWebhookAuditList(params) {
    // 执行记录
    return axios.post('/api/rest/deploy/job/webhook/audit/search', params);
  },
  updateWebhookByIsActive(params) {
    // 是否激活作业触发器
    return axios.post('/api/rest/deploy/job/webhook/activate', params);
  },
  saveJobWebhook(params) {
    // 保存作业触发器
    return axios.post('/api/rest/deploy/job/webhook/save', params);
  },
  delJobWebhookById(params) {
    // 删除作业触发器
    return axios.post('/api/rest/deploy/job/webhook/delete', params);
  },
  getIntegrationAuditDetail(params) {
    // 获取执行记录，输入和输出参数
    return axios.post('/api/rest/integration/audit/detail/get', params);
  }
};
export default webhook;
