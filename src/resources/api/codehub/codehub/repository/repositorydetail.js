import axios from '@/resources/api/http.js';

const repositorydetail = {
  // getList(data) { //获取仓库列表
  //   return axios.post('/api/rest/codehub/repository/search', data);
  // },
  sync(data) { //同步
    return axios.post('/api/rest/codehub/repository/sync', data);
  },
  getActive(data) {
    return axios.post('/api/rest/codehub/repository/commitlog/search', data);
  },
  getBranch(data) {
    return axios.post('/api/rest/codehub/repository/branch/search', data);
  },
  deleteBranch(data) {
    return axios.post('/api/rest/codehub/repository/branch/delete', data);
  },
  saveBranch(data) {
    return axios.post('/api/rest/codehub/repository/branch/save', data);
  },
  getTag(data) {
    return axios.post('/api/rest/codehub/repository/tag/search', data);
  },
  deleteTag(data) {
    return axios.post('/api/rest/codehub/repository/tag/delete', data);
  },
  saveTag(data) {
    return axios.post('/api/rest/codehub/repository/tag/save', data);
  },
  getFile(data) {
    return axios.post('/api/rest/codehub/repository/file/search', data);
  },
  getSeachgroup(data) {
    return axios.post('/api/rest/codehub/repository/branchortag/search', data);    
  },
  getNotifySetting(data) {
    //获取仓库配置的通知关联信息
    return axios.post('/api/rest/codehub/notify/relate/search', data);    
  },
  saveNotifySetting(data) {
    //保存仓库配置的通知关联信息
    return axios.post('/api/rest/codehub/notify/relate/save', data);    
  },
  getCommitDiff(data) {
    return axios.post('/api/rest/codehub/commit/diff', data);
  },

  getSvnAuthList(data) {
    //svn授权总列表
    return axios.post('/api/rest/codehub/repository/svn/getauth', data);
  },
  getSvnAuthByPath(data) {
    //svn根据路径获取的授权
    return axios.post('/api/rest/codehub/repository/svn/getauth', data);
  },
  getSvnAuthTree(data) {
    //svn路径树图
    return axios.post('/api/rest/codehub/repository/svn/pathtree', data);
  },
  saveSvnAuth(data) {
    //保存svn权限
    return axios.post('/api/rest/codehub/repository/svn/putauth', data);
  },
  deleteSvnAuth(data) {
    //删除svn权限
    return axios.post('/api/rest/codehub/repository/svn/deleteauth', data);
  },
  searchSvnGroup(data) {
    return axios.post('/api/rest/codehub/repository/svn/getgroup', data);
  },

  searchSvnMember(data) {
    return axios.post('/api/rest/codehub/repository/svn/getmemberbygroup', data);
  },
  deleteGitAuth(type, data) {
    //删除git权限
    if (type && type == 'member') {
      return axios.post('/api/rest/codehub/repository/gitlab/removeProjectMember', data);
    } else {
      return axios.post('/api/rest/codehub/repository/gitlab/removeShareProjectWithGroup', data);
    }
  },
  getGitAuthList(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/listProjectMembers', data);
  },
  searchGitGroup(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/listProjectSharedWithGroups', data);
  },
  saveGitAuth(type, data) {
    //删除git权限
    if (type && type == 'member') {
      return axios.post('/api/rest/codehub/repository/gitlab/addProjectMember', data);
    } else {
      return axios.post('/api/rest/codehub/repository/gitlab/addShareProjectWithGroup', data);
    }
  },
  getProtectBranchList(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/listProtectBranches', data);
  },
  deleteProtectBranch(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/removeProtectBranch', data);
  },
  saveGitProtect(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/protectBranch', data);
  },
  getActives(data) {
    return axios.post('/api/rest/codehub/action/search', data);
  },
  getGroupUser(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/listGroupMembers', data);
  },
  getUser(data) {
    return axios.post('/api/rest/codehub/repository/gitlab/getUser', data);
  }
};
export default repositorydetail;
