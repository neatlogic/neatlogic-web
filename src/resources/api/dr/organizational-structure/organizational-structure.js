import axios from '@/resources/api/http';
const organizationalStructure = {
  saveOrganizationUser(params) {
    return axios.post('/api/rest/dr/organization/user/save', params);
  },
  searchOrganizationUser(params) {
    // 查询组织架构下的用户列表
    return axios.post('/api/rest/dr/organization/user/search', params);
  },
  deleteOrganizationUserById(params) {
    // 删除组织架构下的用户
    return axios.post('/api/rest/dr/organization/user/delete', params);
  },
  saveOrganizationalStructure(params) {
    return axios.post('/api/rest/dr/organization/save', params);
  },
  deleteOrganizationalStructureById(params) {
    return axios.post('/api/rest/dr/organization/delete', params);
  },
  searchOrganizationalStructureData(params) {
    // 获取组织架构完整树
    return axios.post('/api/rest/dr/organization/tree', params);
  }
};
export default organizationalStructure;
