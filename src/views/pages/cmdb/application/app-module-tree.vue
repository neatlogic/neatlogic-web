<template>
  <div>
    <div class="pr-sm" :class="alignType == 'table' ? 'pt-xs' : ''">
      <InputSearcher
        v-model="searchParam.keyword"
        border="bottom"
        :placeholder="$t('form.placeholder.keyword')"
        @change="searchAppSystem()"
      ></InputSearcher>
    </div>
    <div ref="scroll">
      <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
      <Scroll
        :on-reach-bottom="pageRange[1] < pageCount ? handleReachBottom : null"
        :on-reach-top="pageRange[0] > 1 ? handleReachTop : null"
        :loading-text="loadingTip"
        :height="scrollHeight"
        :distance-to-edge="10"
      >
        <div v-for="app in appSystemList" :key="app.id">
          <div class="app-item pl-xs pb-xs pt-xs cursor radius-sm overflow" :class="{ 'item-selected': !!app.isSelected }" @click="selectApp(app)">
            <span v-if="(level === 'module' || level === 'env') && app.isHasModule">
              <span v-if="!app.isLoading" :class="{ 'tsfont-drop-right': !app.isExpand, 'tsfont-drop-down': !!app.isExpand }" @click.stop="showModule(app)"></span>
              <Icon
                v-else
                type="ios-loading"
                size="16"
                class="loading"
              ></Icon>
            </span>
            <span v-else class="tsfont-dot"></span>
            <Tooltip class="tooltip-box" :content="app.abbrName + '（' + app.name + '）'" :transfer="true">
              <span class="name-pl overflow">{{ app.abbrName }}{{ app.name ? '(' + app.name + ')' : '' }}</span>
            </Tooltip>
          </div>
          <div v-if="app.isExpand && app.appModuleList && app.appModuleList.length > 0">
            <div v-for="module in app.appModuleList" :key="module.id">
              <div class="module-item ml-nm pb-xs pt-xs radius-sm overflow cursor module-flex" :class="{ 'item-selected': !!module.isSelected }" @click="selectModule(app, module)">
                <span v-if="level === 'env' && module.isHasEnv">
                  <span v-if="!module.isLoading" :class="{ 'tsfont-drop-right': !module.isExpand, 'tsfont-drop-down': !!module.isExpand }" @click.stop="showEnv(app, module)"></span>
                  <Icon
                    v-else
                    type="ios-loading"
                    size="16"
                    class="loading"
                  ></Icon>
                </span>
                <span v-else-if="level === 'env' && !module.isHasEnv" class="tsfont-dot"></span>
                <span v-else class="tsfont-application"></span>
                <Tooltip class="tooltip-box" :content="module.abbrName + (module.name ? '（' + module.name + '）' : '')" :transfer="true">
                  <span class="name-pl overflow">{{ module.abbrName }}{{ module.name ? '(' + module.name +')' : '' }}</span>
                </Tooltip>
              </div>
              <div v-if="module.isExpand && module.envList && module.envList.length > 0" class="ml-nm pb-xs pt-xs">
                <Tag
                  v-for="env in module.envList"
                  :key="env.id"
                  :color="env.isSelected ? 'primary' : 'default'"
                  class="cursor"
                  @click.native="selectEnv(app, module, env)"
                >
                  {{ env.name }}
                </Tag>
              </div>
            </div>
          </div>
        </div>
      </Scroll>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  props: {
    offsetTop: {
      //顶部间距
      type: Number,
      default: 0
    },
    offsetBottom: {
      //底部间距
      type: Number,
      default: 20
    },
    level: { type: String, default: 'module' }, //展示级别，分别是app,module和env
    value: { type: Object },
    allowInverse: { type: Boolean, default: true }, //是否允许反选，不允许默认会选中第一个节点
    filter: {
      // 过滤条件
      type: Object,
      default: function() {
        return {};
      }
    },
    alignType: {
      // 输入框底边线和右边对齐
      type: String,
      default: 'table' // table / tag
    }
  },
  data() {
    return {
      returnValue: this.value || {},
      searchParam: { keyword: '', pageSize: 50, ...this.filter }, //pagesize生成50，防止浏览器高度太大数据量太少不出现滚动条导致无法触发翻页
      pageCount: 0,
      selectedNode: null,
      appSystemList: [],
      scrollHeight: 0,
      loadingTip: this.$t('page.loadingtip'),
      selectedApp: null,
      selectedModule: null,
      selectedEnv: null,
      isShowAppEdit: false,
      isLoading: false,
      isSearching: false, //是否正在搜索，滚动分页避免冲突，禁止并发搜索
      pageRange: [1, 1] //数据页范围，由于是滚动分页，需要记录页码范围
    };
  },
  beforeCreate() {},
  async created() {
    await this.searchAppSystem();
    window.addEventListener('resize', this.calcScrollHeight);
  },
  beforeMount() {},
  mounted() {
    setTimeout(() => {
      this.calcScrollHeight();
    }, 300);
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
    //disableEmit为true,禁止触发外部搜索，只会改变节点的选中状态，此参数的目的是在回退后的首次加载中，避免连续触发两次搜索
    async reSelectNode(disableEmit) {
      let isHit = false;
      if (!this.$utils.isEmpty(this.returnValue)) {
        const appId = this.returnValue.appId;
        const moduleId = this.returnValue.moduleId;
        const envId = this.returnValue.envId;

        if (appId && !moduleId && !envId) {
          //选中应用
          const appNode = this.appSystemList.find(d => d.id === appId);
          if (appNode) {
            if (!appNode.isSelected) {
              this.selectApp(appNode, disableEmit);
            }
            isHit = true;
          }
        } else if (appId && moduleId && !envId) {
          //选中模块
          const appNode = this.appSystemList.find(d => d.id === appId);
          if (appNode && !appNode.isExpand) {
            await this.showModule(appNode);
          }
          if (appNode) {
            const moduleNode = appNode.appModuleList.find(d => d.id === moduleId);
            if (moduleNode) {
              if (!moduleNode.isSelected) {
                this.selectModule(appNode, moduleNode, disableEmit);
              }
              isHit = true;
            }
          }
        } else if (appId && moduleId && envId) {
          //选中环境
          const appNode = this.appSystemList.find(d => d.id === appId);
          if (appNode && !appNode.isExpand) {
            await this.showModule(appNode);
          }
          if (appNode) {
            const moduleNode = appNode.appModuleList.find(d => d.id === moduleId);
            if (moduleNode && !moduleNode.isExpand) {
              // await this.showEnv(appNode, moduleNode);
            }
            if (moduleNode) {
              const envNode = moduleNode.envList.find(d => d.id === envId);
              if (envNode) {
                if (!envNode.isSelected) {
                  this.selectEnv(appNode, moduleNode, envNode, disableEmit);
                }
                isHit = true;
              }
            }
          }
        }
      }
      if (!isHit) {
        //找不到选中的值则清空当前选中数据
        this.clearSelectedItem();
        if (!this.allowInverse && this.appSystemList && this.appSystemList.length > 0) {
          const app = this.appSystemList[0];
          this.selectApp(app, disableEmit);
        } else {
          if (!disableEmit) {
            this.emit();
          }
        }
      }
    },
    calcScrollHeight() {
      this.scrollHeight = document.body.clientHeight - this.$refs['scroll'].getBoundingClientRect().top - this.offsetBottom;
    },
    emit() {
      this.$addHistoryData('appModuleEnvData', this.returnValue);
      this.$emit('input', this.returnValue);
      this.$emit('getSelectedApp', this.selectedApp);
      this.$emit('getSelectedModule', this.selectedModule);
      this.$emit('getSelectedEnv', this.selectedEnv);
    },
    restoreHistory(historyData) {
      this.searchParam = historyData['searchParam'];
      if (historyData['pageRange']) {
        this.searchParam.pageRange = historyData['pageRange'];
      }
      this.returnValue = historyData['appModuleEnvData'] || {};
    },
    clearSelectedItem() {
      if (this.selectedApp) {
        this.$set(this.selectedApp, 'isSelected', false);
        this.selectedApp = null;
      }
      if (this.selectedModule) {
        this.$set(this.selectedModule, 'isSelected', false);
        this.selectedModule = null;
      }
      if (this.selectedEnv) {
        this.$set(this.selectedEnv, 'isSelected', false);
        this.selectedEnv = null;
      }
      if (this.returnValue && this.returnValue.appId) {
        this.$delete(this.returnValue, 'appId');
      }
      if (this.returnValue && this.returnValue.moduleId) {
        this.$delete(this.returnValue, 'moduleId');
      }
      if (this.returnValue && this.returnValue.envId) {
        this.$delete(this.returnValue, 'envId');
      }
    },
    selectApp(app, disableEmit) {
      if (app.isSelected) {
        if (this.allowInverse) {
          this.clearSelectedItem();
        }
      } else {
        this.clearSelectedItem();
        this.selectedApp = app;
        this.$set(app, 'isSelected', true);
        this.$set(this.returnValue, 'appId', app.id);
        this.emit(); // 详情页返回，缺少分发方法
      }
      if (!disableEmit) {
        this.emit();
      }
    },
    selectModule(app, module, disableEmit) {
      if (module.isSelected) {
        if (this.allowInverse) {
          this.clearSelectedItem();
        }
      } else {
        this.clearSelectedItem();
        this.selectedApp = app;
        this.selectedModule = module;
        this.$set(module, 'isSelected', true);
        this.$set(this.returnValue, 'appId', app.id);
        this.$set(this.returnValue, 'moduleId', module.id);
        this.emit(); // 详情页返回，缺少分发的方法
      }
      if (!disableEmit) {
        this.emit();
      }
    },
    //提供给外部使用，用于刷新某个app下的所有节点（删除模块时使用）
    async refreshAppByDelModule(appSystemId) {
      if (appSystemId) {
        await this.$api.cmdb.applicationManage.getAppmoduleListTree({ appSystemId: appSystemId }).then(res => {
          const appModuleList = res.Return && !this.$utils.isEmpty(res.Return) ? res.Return : [];
          const index = this.appSystemList.findIndex(d => d.id === appSystemId);
          if (index > -1) {
            this.$set(this.appSystemList[index], 'isHasModule', this.$utils.isEmpty(appModuleList) ? 0 : 1);
            this.$set(this.appSystemList[index], 'appModuleList', appModuleList);
          }
          this.returnValue = {
            appId: appSystemId
          };
          this.reSelectNode();
        });
      }
    },
    //提供给外部使用，用于刷新某个app下的所有节点（新增是使用）
    async refreshApp(uuid) {
      if (uuid) {
        await this.$api.cmdb.applicationManage.getAppsystemById({ uuid: uuid }).then(res => {
          const newAppNode = res.Return && !this.$utils.isEmptyObj(res.Return) ? res.Return : {};
          const {id = null, abbrName = '', name = ''} = newAppNode;
          const index = this.appSystemList.findIndex(d => d.id === id);
          if (index > -1) {
            const newAppObj = Object.assign(this.appSystemList[index], {id: id, name: name, abbrName: abbrName});
            this.$set(this.appSystemList, index, newAppObj);
            this.reSelectNode();
          } else {
            this.appSystemList.unshift(newAppNode); // 添加应用时，把应用放在数组第一个
            this.selectApp(newAppNode);
          }
        });
      }
    },
    //提供给外部使用，用于刷新某个module下的所有节点
    async refreshModule(uuid, appSystemId) {
      let moduleId = null;
      if (uuid) {
        await this.$api.cmdb.applicationManage.getAppmoduleById({ uuid: uuid }).then((res) => {
          if (res && res.Status == 'OK' && res.Return) {
            moduleId = res.Return.id;
          }
        });
        const index = this.appSystemList.findIndex(d => d.id === appSystemId);
        if (index > -1) {
          await this.$api.cmdb.applicationManage.getAppmoduleListTree({ appSystemId: appSystemId }).then(res => {
            const newModuleNode = res.Return && !this.$utils.isEmpty(res.Return) ? res.Return : [];
            if (newModuleNode) {
              this.$set(this.appSystemList[index], 'isHasModule', this.$utils.isEmpty(newModuleNode) ? 0 : 1); // 新加(删除)模块后，更新应用状态
              this.$set(this.appSystemList[index], 'appModuleList', newModuleNode);
              this.returnValue = {
                appId: appSystemId,
                moduleId: moduleId
              };
              this.reSelectNode();
            }
          });
        }
      }
    },
    selectEnv(app, module, env, disableEmit) {
      if (env.isSelected) {
        if (this.allowInverse) {
          this.clearSelectedItem();
        }
      } else {
        this.clearSelectedItem();
        this.selectedApp = app;
        this.selectedModule = module;
        this.selectedEnv = env;
        this.$set(env, 'isSelected', true);
        this.$set(this.returnValue, 'appId', app.id);
        this.$set(this.returnValue, 'moduleId', module.id);
        this.$set(this.returnValue, 'envId', env.id);
        this.emit(); // 详情页返回，缺少分发方法
      }
      if (!disableEmit) {
        this.emit();
      }
    },
    async showModule(app) {
      if (!app.isExpand) {
        this.$set(app, 'isLoading', true);
        await this.$api.cmdb.applicationManage
          .getAppmoduleListTree({ appSystemId: app.id })
          .then(res => {
            if (res.Status == 'OK') {
              this.$set(app, 'appModuleList', res.Return);
              this.$set(app, 'isExpand', true);
            }
          })
          .finally(() => {
            this.$set(app, 'isLoading', false);
          });
      } else {
        this.$set(app, 'isExpand', false);
      }
    },
    // async showEnv(app, module) { // 先注释，目前用不到，环境层数据
    //   if (!module.isExpand) {
    //     this.$set(module, 'isLoading', true);
    //     let params = {
    //       appSystemId: app.id,
    //       appModuleId: module.id,
    //       isHasEnv: 1
    //     };
    //     await this.$api.deploy.applicationConfig
    //       .getEnvTreeList(params)
    //       .then(res => {
    //         if (res && res.Status == 'OK') {
    //           const envList = res.Return || [];
    //           this.$set(module, 'envList', envList);
    //           this.$set(module, 'isExpand', true);
    //         }
    //       })
    //       .finally(() => {
    //         this.$set(module, 'isLoading', false);
    //       });
    //   } else {
    //     this.$set(module, 'isExpand', false);
    //   }
    // },
    async searchAppSystem(direction) {
      if (!this.isSearching) {
        this.isSearching = true;
        if (!direction) {
          this.isLoading = true;
          this.searchParam.currentPage = 1;
        } else if (direction === 'down') {
          this.searchParam.currentPage = this.pageRange[1] + 1;
        } else if (direction === 'up') {
          this.searchParam.currentPage = Math.max(1, this.pageRange[0] - 1);
          if (this.pageRange[0] === this.searchParam.currentPage) {
            this.isSearching = false;
            return; //如果已经是第一页，则不再搜索
          }
        }
        this.$addHistoryData('searchParam', this.searchParam);
        await this.$api.cmdb.applicationManage
          .getAppsystemListTree(this.searchParam)
          .then(async res => {
            if (res && res.Status == 'OK') {
              const dataList = res.Return.tbodyList || [];
              this.pageCount = res.Return.pageCount;
              const currentPage = Math.min(this.pageCount, this.searchParam.currentPage);
              if (dataList && dataList.length > 0) {
                if (this.level === 'module' || this.level === 'env') {
                  dataList.forEach(element => {
                    if (element.appModuleList && element.appModuleList.length > 0) {
                      this.$set(element, 'isExpand', true);
                    }
                  });
                }
                let appSystemIdList = [];
                this.appSystemList &&
                  this.appSystemList.forEach(item => {
                    appSystemIdList.push(item.id);
                  });
                if (!direction) {
                  this.appSystemList = dataList;
                  if (this.searchParam.pageRange) {
                    //第一次搜索完毕后需要清除pageRange参数，并且把当前页面设回正确的值
                    this.searchParam.currentPage = this.searchParam.pageRange[1];
                    this.pageRange = this.searchParam.pageRange;
                    this.$delete(this.searchParam, 'pageRange');
                  } else {
                    this.pageRange = [currentPage, currentPage];
                  }
                } else if (direction === 'down') {
                  dataList &&
                    dataList.forEach(item => {
                      // 添加应用后，处理下拉数据重复问题
                      if (!appSystemIdList.includes(item.id)) {
                        this.appSystemList.push(item);
                      }
                    });
                  this.pageRange[1] = currentPage;
                } else if (direction === 'up') {
                  dataList &&
                    dataList.forEach(item => {
                      // 添加应用后，处理下拉数据重复问题
                      if (!appSystemIdList.includes(item.id)) {
                        this.appSystemList.unshift(item);
                      }
                    });
                  this.pageRange[0] = currentPage;
                }
              } else {
                if (!direction) {
                  this.appSystemList = [];
                  this.pageRange = [currentPage, currentPage];
                }
              }
              this.$emit('getAppSystemIdList', this.appSystemList);
              //重新选中节点，禁用emit，防止触发二次搜索
              await this.reSelectNode(true);
            }
          })
          .finally(() => {
            this.isSearching = false;
            this.isLoading = false;
            this.$addHistoryData('pageRange', this.pageRange);
          })
          .catch(() => {
            this.$emit('getAppSystemIdList', []);
          });
      }
    },
    handleReachBottom() {
      this.searchAppSystem('down');
    },
    handleReachTop() {
      if (this.pageRange[0] > 1) {
        this.searchAppSystem('up');
      } else {
        return false;
      }
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
    value: {
      async handler(val) {
        this.returnValue = val || {};
        await this.reSelectNode();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.app-item {
  position: relative;
  display: flex;
}
.app-item .favorite-icon {
  position: absolute;
  right: 0px;
  visibility: hidden;
}
.app-item:hover .favorite-icon {
  visibility: visible;
}
.name-pl {
  display: inline-block;
  width: 100%;
  padding-left: 4px;
  padding-right: 32px;
}
 .tooltip-box {
    /deep/ &.ivu-tooltip,
    /deep/ .ivu-tooltip-rel {
      max-width: 100%;
      width: 100%;
    }
}
.module-flex {
  display: flex;
}
</style>
