<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="pl-md" :class="isShowApp ? '' : 'mt-xs'">
      <InputSearcher v-model="keyword" border="bottom" @change="searchTree(1)"></InputSearcher>
    </div>
    <div
      v-if="isShowApp"
      class="tsfont-plus text-action mt-nm pl-md text-href"
      style="margin-bottom: -5px;"
      @click="openAppEdit"
    >{{ $t('page.apply') }}</div>
    <div ref="scroll">
      <Scroll :on-reach-bottom="handleReachBottom" :loading-text="loadingTip" :height="scrollHeight">
        <Tree
          :data="treeList"
          class="app-config-tree"
          :class="treeList && treeList.length == 0 ? 'pl-nm' : ''"
          :load-data="getSubTree"
          :render="renderContent"
          @on-select-change="(nodeList, node) => selectTreeNode(node)"
        ></Tree>
      </Scroll>
    </div>
    <AppTreeEdit v-if="isShowAppEdit" :isEdit="isEditApp" @close="closeAppTreeEdit"></AppTreeEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    AppTreeEdit: resolve => require(['./components/app-tree-edit'], resolve)
  },
  props: {
    height: {
      type: Number
    },
    filter: {
      // 过滤条件
      type: Object,
      default: function() {
        return {};
      }
    },
    isShowApp: {
      // 是否显示添加应用按钮
      type: Boolean,
      default: false
    },
    isShowEnv: {
      // 是否显示环境层
      type: Boolean,
      default: true
    },
    readonly: {
      // 只读，不显示操作按钮
      type: Boolean,
      default: false
    },
    hasAll: {
      // 是否显示所有文案
      type: Boolean,
      default: false
    },
    isFirstSelected: {
      // 是否默认选中首个
      type: Boolean,
      default: false
    },
    refreshParams: {
      /*
        刷新应用配置树数据
        {
          operationType: add/edit, // 新增还是编辑
          configType: app/module/env // 应用层/模块层/环境层
          abbrName: // 简称，新增之后，勾选新增模块和环境
          name: // 应用配置树，名称(编辑时才需要)
          envId // 添加环境时，才需要传递（环境可以一次性添加多个，默认选中第一个）
        }
      */
      type: Object,
      default: function() {
        return {};
      }
    },
    selectedParams: {
      // 详情页面返回，应用配置树勾选
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      scrollHeight: 0,
      keyword: '',
      loadingTip: this.$t('page.loading'),
      pageCount: 0,
      currentPage: 1,
      pageSize: 20,
      rowNum: null,
      treeList: [],
      isEditApp: false,
      isShowAppEdit: false,
      selectedTreeNode: {},
      loadingShow: false,
      searchParams: {...this.filter} // 搜索条件
    };
  },
  beforeCreate() {},
  created() {
    if (!this.height) {
      window.addEventListener('resize', this.calcScrollHeight);
    }
    if ((this.refreshParams && this.$utils.isEmptyObj(this.refreshParams)) && this.selectedParams && this.$utils.isEmptyObj(this.selectedParams)) {
      this.getTreeList();
    }
  },
  beforeMount() {},
  mounted() {
    if (!this.height) {
      setTimeout(() => {
        this.calcScrollHeight();
      }, 300); 
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcScrollHeight);
  },
  destroyed() {},
  methods: {
    calcScrollHeight() {
      //70离上部高度
      this.scrollHeight = document.body.clientHeight - this.$refs['scroll'].getBoundingClientRect().top - 20;
      this.pageSize = Math.round(this.scrollHeight / 20) || 20;
    },
    getSubTree(node, callback) {
      let currentNode = node || {};
      if (currentNode && !currentNode.appModuleId) {
        // 查找模块层数据
        this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: currentNode.appSystemId }).then(res => {
          if (res && res.Status == 'OK') {
            const childrenList = res.Return;
            let children = [];
            children = childrenList.map(item => {
              return item.isHasEnv && this.isShowEnv ? { title: this.getTreeName(item), appSystemId: currentNode.appSystemId, appModuleId: item.id, isConfig: currentNode.isConfig, configType: 'module', loading: false, children: [], path: `${currentNode.path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, isHasAllAuthority: currentNode.isHasAllAuthority, isConfigAuthority: currentNode.isConfigAuthority, authActionSet: currentNode.authActionSet || [] } : { title: this.getTreeName(item), appSystemId: currentNode.appSystemId, appModuleId: item.id, isConfig: currentNode.isConfig, configType: 'module', path: `${currentNode.path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, isHasAllAuthority: currentNode.isHasAllAuthority, isConfigAuthority: currentNode.isConfigAuthority, authActionSet: currentNode.authActionSet || []};
            });
            callback(children);
          }
        });
      } else if (currentNode && currentNode.appModuleId && !currentNode.envId) {
        // 查找环境层数据
        let params = {
          appSystemId: currentNode.appSystemId,
          appModuleId: currentNode.appModuleId,
          isHasEnv: 1
        };
        this.$api.deploy.applicationConfig.getEnvTreeList(params).then(res => {
          if (res && res.Status == 'OK') {
            const envList = res.Return || [];
            let children = [];
            children = envList.map(item => {
              return { title: item.name, appSystemId: currentNode.appSystemId, appModuleId: currentNode.appModuleId, envId: item.id, isConfig: currentNode.isConfig, configType: 'env', path: `${currentNode.path}/${item.name}`, isDeletable: item.isDeletable, isHasAllAuthority: currentNode.isHasAllAuthority, isConfigAuthority: currentNode.isConfigAuthority, authActionSet: currentNode.authActionSet || []};
            });
            callback(children);
          }
        });
      }
    },
    getTreeList(currentPage) {
      let params = {
        currentPage: currentPage || this.currentPage,
        pageSize: this.pageSize,
        ...this.searchParams
      };
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.searchAppSystemList(params).then(res => {
        if (res && res.Status == 'OK') {
          this.handleTreeList(res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    handleTreeList(returnData) {
      let treeList = [];
      if (this.currentPage > 1) {
        treeList = [].concat(this.treeList, returnData.tbodyList);
        this.currentPage = returnData.currentPage;
        this.pageSize = returnData.pageSize;
        this.rowNum = returnData.rowNum;
        this.treeList = treeList.map(item => {
          return item.isHasModule ? { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, loading: false, children: [], path: this.getTreeName(item), isHasModule: item.isHasModule, isHasEnv: item.isHasEnv, isHasAllAuthority: item.isHasAllAuthority, isConfigAuthority: item.isConfigAuthority, authActionSet: item.authActionSet || [] } : { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, path: this.getTreeName(item), isHasEnv: item.isHasEnv, isHasAllAuthority: item.isHasAllAuthority, isConfigAuthority: item.isConfigAuthority, authActionSet: item.authActionSet || [] };
        });
      } else {
        treeList = returnData.tbodyList || [];
        this.currentPage = returnData.currentPage;
        this.pageSize = returnData.pageSize;
        this.rowNum = returnData.rowNum;
        this.treeList = [];
        this.treeList = treeList.map(item => {
          return item.isHasModule ? { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, loading: false, children: [], path: this.getTreeName(item), isHasModule: item.isHasModule, isHasEnv: item.isHasEnv, isHasAllAuthority: item.isHasAllAuthority, isConfigAuthority: item.isConfigAuthority, authActionSet: item.authActionSet || []} : { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, path: this.getTreeName(item), isHasEnv: item.isHasEnv, isHasAllAuthority: item.isHasAllAuthority, isConfigAuthority: item.isConfigAuthority, authActionSet: item.authActionSet || [] };
        });
      }
      if (this.hasAll) {
        let treeList = [];
        treeList = this.$utils.deepClone(this.treeList);
        this.treeList = [];
        this.treeList.unshift({
          title: this.$t('page.all'),
          configType: 'all',
          expand: true,
          selected: true,
          children: treeList
        });
      }
      if (this.isFirstSelected && this.$utils.isEmptyObj(this.selectedParams)) {
        // 首个选中
        this.treeList && this.treeList.forEach((item, index) => {
          if (index == 0) {
            this.$set(item, 'selected', true);
            this.selectTreeNode(item);
          }
        });
      }
    },
    getTreeName(item) {
      return item.title ? item.title : (item.abbrName ? (item.name ? `${item.abbrName}[${item.name}]` : item.abbrName) : '');
    },
    searchTree(currentPage) {
      if (currentPage) {
        this.currentPage = currentPage;
      }
      if (this.keyword) {
        let params = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          keyword: this.keyword,
          ...this.searchParams
        };
        this.$api.deploy.applicationConfig.searchAppSystemList(params).then(res => {
          if (res && res.Status == 'OK') {
            this.handleTreeList(res.Return);
          }
        });
      } else {
        this.getTreeList();
      }
      this.$emit('searchTree');
    },
    handleReachBottom() {
      //引用滚动加载
      if (this.currentPage) {
        this.currentPage += 1;
      }
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
          if (this.currentPage > 1 && this.treeList.length >= this.rowNum) {
            this.loadingTip = this.$t('page.loadfinish');
            return;
          } else {
            this.getTreeList();
          }
        }, 1000);
      });
    },
    selectTreeNode(node) {
      if (node && node.envId) {
        node['configType'] = 'env';
      }
      this.selectedTreeNode = node;
      this.$emit('selectedTreeNode', node);
    },
    renderContent(h, { root, node, data }) {
      if (this.readonly) {
        return h('span', 
          {
            class: 'overflow', 
            style: {display: 'inline-block', width: '180px'},
            attrs: {
              title: data.title
            }
          },
          data.title);
      } else {
        return h(
          'span',
          {
            on: {
              mouseenter: () => {
                this.$set(data, 'isShow', true);
              },
              mouseleave: () => {
                this.$set(data, 'isShow', false);
              }
            }
          },
          [
            h('span', 
              {
                class: 'overflow', 
                style: {display: 'inline-block', width: '180px'},
                attrs: {
                  title: data.title,
                  id: `tree_${data.appSystemId}`
                }
              },
              data.title),
            h(
              'span',
              {
                style: {
                  display: data.isShow ? 'inline-block' : 'none',
                  float: 'right'
                }
              },
              [
                h('span', {
                  class: [data.isFavorite ? 'tsfont-star' : 'tsfont-star-border', 'pl-sm'], // 收藏 tsfont-star
                  style: {
                    display: data.configType == 'app' ? 'inline-block' : 'none'
                  },
                  on: {
                    click: e => {
                      e.stopPropagation();
                      this.handleCollect(data);
                    }
                  }
                })
              ]
            )
          ]
        );
      }
    },
    handleCollect(node) {
      // 收藏 || 未收藏
      if (node) {
        let params = {
          appSystemId: node.appSystemId,
          isFavorite: node.isFavorite ? 0 : 1
        };
        this.$api.deploy.applicationConfig.saveAppFavorite(params).then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(params.isFavorite ? this.$t('message.collectionsuccess') : this.$t('message.cancelsuccess'));
            this.$set(node, 'isFavorite', params.isFavorite);
          }
        });
      }
    },
    openAppEdit() {
      this.isEditApp = false;
      this.isShowAppEdit = true;
    },
    closeAppTreeEdit(needRefresh, params) {
      this.isEditApp = false;
      this.isShowAppEdit = false;
      if (needRefresh) {
        let {abbrName} = params;
        this.pollTree(1, {abbrName: abbrName});
      }
    },
    getModuleList(abbrName, appModuleId) {
      let {appSystemId, isConfig, path} = this.selectedTreeNode;
      this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: appSystemId }).then(res => {
        if (res && res.Status == 'OK') {
          const childrenList = res.Return;
          let children = [];
          let selectedTreeNode = {};
          children = childrenList.map(item => {
            return item.isHasEnv ? { title: this.getTreeName(item), appSystemId: appSystemId, appModuleId: item.id, isConfig: isConfig, configType: 'module', loading: false, children: [], path: `${path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, abbrName: item.abbrName} : { title: this.getTreeName(item), appSystemId: appSystemId, appModuleId: item.id, isConfig: isConfig, configType: 'module', path: `${path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, abbrName: item.abbrName};
          });
          children && children.forEach(item => {
            if (item.abbrName == abbrName || item.appModuleId == appModuleId) {
              this.$set(item, 'selected', true);
              selectedTreeNode = item;
            }
          });
          this.$set(this.selectedTreeNode, 'children', children);
          this.$set(this.selectedTreeNode, 'expand', true);
          this.$set(this.selectedTreeNode, 'selected', false);
          this.$set(this.selectedTreeNode, 'isHasModule', 1);
          this.selectTreeNode(selectedTreeNode);
        }
      });
    },
    getEnvList(envId) {
      if (this.selectedTreeNode && !this.$utils.isEmptyObj(this.selectedTreeNode)) {
        let {appSystemId, appModuleId, isConfig, path} = this.selectedTreeNode;
        let params = {
          appSystemId: appSystemId,
          appModuleId: appModuleId,
          isHasEnv: 1
        };
        this.$api.deploy.applicationConfig.getEnvTreeList(params).then(res => {
          if (res && res.Status == 'OK') {
            const envList = res.Return || [];
            let children = [];
            let selectedTreeNode = {};
            children = envList.map(item => {
              return { title: item.name, appSystemId: appSystemId, appModuleId: appModuleId, envId: item.id, isConfig: isConfig, configType: 'env', path: `${path}/${item.name}`, isDeletable: item.isDeletable};
            });
            children && children.forEach(item => {
              if (item.envId == envId) {
                this.$set(item, 'selected', true);
                selectedTreeNode = item;
              }
            });
            this.$set(this.selectedTreeNode, 'children', children);
            this.$set(this.selectedTreeNode, 'expand', true);
            this.$set(this.selectedTreeNode, 'selected', false);
            this.$set(this.selectedTreeNode, 'isHasEnv', 1);
            this.selectTreeNode(selectedTreeNode);
          }
        });
      }
    },
    updateAppOrModule(params) {
      // 更新应用配置树，当前选中的应用
      if (params) {
        this.$set(this.selectedTreeNode, 'name', params.name);
        this.$set(this.selectedTreeNode, 'abbrName', params.abbrName);
        this.$set(this.selectedTreeNode, 'path', this.getTreeName(params));
        this.$set(this.selectedTreeNode, 'title', this.getTreeName(params));
      }
    },
    pollTree(currentPage, obj) {
      let {appSystemId, appModuleId, envId, abbrName} = obj;
      let params = {
        currentPage: currentPage || this.currentPage,
        pageSize: this.pageSize,
        ...this.searchParams
      };
      let treeList = [];
      this.loadingShow = true;
      this.$api.deploy.applicationConfig.searchAppSystemList(params).then(res => {
        if (res && res.Status == 'OK') {
          this.loadingShow = false;
          let returnData = res.Return;
          treeList = currentPage == 1 ? returnData.tbodyList || [] : [].concat(this.treeList, returnData.tbodyList);
          this.currentPage = returnData.currentPage;
          this.pageSize = returnData.pageSize;
          this.rowNum = returnData.rowNum;
          this.pageCount = returnData.pageCount;
          this.treeList = treeList.map(item => {
            return item.isHasModule ? { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, loading: false, children: [], path: this.getTreeName(item), isHasModule: item.isHasModule, isHasEnv: item.isHasEnv, abbrName: item.abbrName} : { title: this.getTreeName(item), appSystemId: item.id, configType: 'app', isConfig: item.isConfig, isFavorite: item.isFavorite, path: this.getTreeName(item), isHasEnv: item.isHasEnv, abbrName: item.abbrName };
          });
          let filterTreeList = this.treeList.filter((item) => {
            return (item.appSystemId == appSystemId || item.abbrName == abbrName);
          });
          if (filterTreeList && filterTreeList.length > 0) {
            if (appModuleId) {
            // 模块层
              let {isConfig, path} = filterTreeList[0];
              this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: appSystemId }).then(res => {
                if (res && res.Status == 'OK') {
                  const childrenList = res.Return;
                  let children = [];
                  children = childrenList.map(item => {
                    return item.isHasEnv ? { title: this.getTreeName(item), appSystemId: appSystemId, appModuleId: item.id, isConfig: isConfig, configType: 'module', loading: false, children: [], path: `${path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, abbrName: item.abbrName} : { title: this.getTreeName(item), appSystemId: appSystemId, appModuleId: item.id, isConfig: isConfig, configType: 'module', path: `${path}/${this.getTreeName(item)}`, isHasEnv: item.isHasEnv, abbrName: item.abbrName};
                  });
                  for (let i = 0; i < this.treeList.length; i++) {
                    if (this.treeList[i] && this.treeList[i].appSystemId == appSystemId) {
                      this.$set(this.treeList[i], 'expand', true);
                      this.$set(this.treeList[i], 'children', children);
                      this.treeList[i] && this.treeList[i].children.forEach((item) => {
                        if (item.appModuleId == appModuleId) {
                          if (envId) {
                            // 环境层
                            let {appSystemId, appModuleId, isConfig, path} = item;
                            let params = {
                              appSystemId: appSystemId,
                              appModuleId: appModuleId,
                              isHasEnv: 1
                            };
                            this.$api.deploy.applicationConfig.getEnvTreeList(params).then(res => {
                              if (res && res.Status == 'OK') {
                                const envList = res.Return || [];
                                let children = [];
                                children = envList.map(item => {
                                  return { title: item.name, appSystemId: appSystemId, appModuleId: appModuleId, envId: item.id, isConfig: isConfig, configType: 'env', path: `${path}/${item.name}`, isDeletable: item.isDeletable};
                                });
                                this.$set(item, 'children', children);
                                this.$set(item, 'expand', true);
                                item.children && item.children.forEach(cItem => {
                                  if (cItem.envId == envId) {
                                    this.$set(cItem, 'selected', true);
                                    this.$nextTick(() => {
                                      this.$utils.jumpTo('#tree_' + appSystemId);
                                    });
                                    this.selectTreeNode(cItem);
                                  }
                                });
                              }
                            });
                          } else {
                            this.$set(item, 'selected', true);
                            this.$nextTick(() => {
                              this.$utils.jumpTo('#tree_' + appSystemId);
                            });
                            this.selectTreeNode(item);
                          }
                        }
                      });
                      break;
                    }
                  }
                }
              });
            } else {
              for (let i = 0; i < this.treeList.length; i++) {
                // 应用层
                if (this.treeList[i] && (this.treeList[i].appSystemId == appSystemId || this.treeList[i].abbrName == abbrName)) {
                  this.$set(this.treeList[i], 'selected', true);
                  this.selectTreeNode(this.treeList[i]);
                  let jumpToAppSystemId = appSystemId || filterTreeList[0].appSystemId;
                  this.$nextTick(() => {
                    this.$utils.jumpTo('#tree_' + jumpToAppSystemId);
                  });
                  break;
                }
              }
            }
          } else {
            if (this.currentPage <= this.pageCount) {
              setTimeout(() => {
                this.pollTree(this.currentPage + 1, obj);
              }, 2000);
            }
          }
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    height: {
      handler(val) {
        this.scrollHeight = val;
      },
      immediate: true
    },
    refreshParams: {
      handler(obj) {
        if (obj && !this.$utils.isEmptyObj(obj)) {
          let {configType, operationType, abbrName, envId, name} = obj;
          if (configType == 'app' || (configType == 'module' && operationType == 'edit')) {
            // 编辑(应用/模块)
            this.updateAppOrModule({name, abbrName});
          } else if (configType == 'module' && operationType == 'add') {
            // 添加模块
            this.getModuleList(abbrName);
          } else if (configType == 'env' && operationType == 'del') {
            let params = {
              currentPage: this.currentPage,
              pageSize: this.pageSize
            };
            if (this.filter) {
              Object.assign(params, this.filter);
            }
            this.$api.deploy.applicationConfig.searchAppSystemList(params).then(res => {
              if (res && res.Status == 'OK') {
                this.handleTreeList(res.Return);
                let {appSystemId, appModuleId} = obj;
                this.treeList && this.treeList.forEach(async(item) => {
                  if (item.appSystemId == appSystemId) {
                    this.$set(item, 'expand', true);
                    this.selectedTreeNode = item;
                    await this.getModuleList('', appModuleId);
                    item.children && item.children.forEach((mitem) => {
                      if (mitem.appModuleId == appModuleId) {
                        this.$set(mitem, 'selected', true);
                      }
                    });
                  }
                });
              }
            });
          } else if (configType == 'env') {
            // 添加环境
            if (this.isShowEnv) {
              this.getEnvList(envId);
            } else {
              this.$set(this.selectedTreeNode, 'isHasEnv', 1);
            }
          }
        }
      },
      immediate: true,
      deep: true
    },
    selectedParams: {
      handler(obj) {
        if (obj && !this.$utils.isEmptyObj(obj)) {
          this.pollTree(1, obj);
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.app-config-tree {
  /deep/ .ivu-tree-title {
    height: 32px;
    padding: 7px 10px 7px 20px;
    border-radius: 6px;
  }
  /deep/ .ivu-tree-arrow {
    padding-top: 5px;
  }
  
}
</style>
