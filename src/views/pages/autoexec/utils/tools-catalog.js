import Vue from 'vue';
const toolCatalogUtils = {
  expandAllTree(treeList) {
    if (treeList && treeList.children && treeList.children.length > 0) {
      treeList.children.forEach(item => {
        if (item.children && item.children.length > 0) {
          this.expandAllTree(item);
        }
        item['expand'] = true;
      });
    }
  },
  getTreeList(isSelected = false) {
    // isSelected 是否默认选中所有
    let _this = this;
    // 获取左侧树列表
    return Vue.prototype.$https.post('/api/rest/autoexec/catalog/fulltree').then((res) => {
      if (res.Status == 'OK') {
        let treeList = [res.Return];
        if (treeList && treeList.length > 0) {
          treeList[0]['expand'] = true;
          treeList[0].selected = !!isSelected;
          treeList[0].id = 'all';
          if (treeList[0].children && treeList[0].children.length > 0) {
            treeList[0].children.forEach((item) => {
              _this.expandAllTree(item);
              item['expand'] = true;
            });
          }
        }
        return Promise.resolve(treeList);
      }
    });
  },
  handleCatalogIdAlltoZero(Obj) {
    // 处理工具目录为所有情况，把all改成0
    let configObj = (Obj && JSON.parse(JSON.stringify(Obj))) || {};
    let catalogId = '';
    if (configObj && configObj.hasOwnProperty('catalogId')) {
      if (configObj.catalogId == 'all') {
        catalogId = 0;
      } else if (configObj.catalogId == 0) {
        catalogId = 'all';
      } else {
        catalogId = configObj.catalogId;
      }
    } 
    return catalogId;
  }
};

export default toolCatalogUtils;
