<template>
  <div id="app-module-list-tree-wrap">
    <div class="pr-sm pt-xs">
      <InputSearcher v-model="searchParam.keyword" border="bottom" @change="searchAppSystem()"></InputSearcher>
    </div>
    <div ref="scroll">
      <Loading v-if="isLoading" :loadingShow="true" type="fix"></Loading>
      <div v-for="app in appSystemList" :key="app.id">
        <div class="app-item pl-xs pb-xs pt-xs cursor radius-sm overflow" @click.stop="showModule(app)">
          <span v-if="app.isHasModule">
            <span v-if="!app.isLoading" :class="{ 'tsfont-right': !app.isExpand, 'tsfont-down': !!app.isExpand }"></span>
            <Icon
              v-else
              type="ios-loading"
              size="16"
              class="loading"
            ></Icon>
          </span>
          <span v-else class="tsfont-dot"></span>
          <Tooltip
            class="tooltip-box"
            :content="app.abbrName + '（' + app.name + '）'"
            :transfer="true"
            :max-width="500"
          >
            <div style="width: 100%;">
              <span class="name-pl overflow">{{ (app.abbrName +(app.name ? '(' + app.name + ')' : '' )) }}</span>
            </div>
          </Tooltip>
        </div>
        <div v-if="app.isExpand && app.appModuleList && app.appModuleList.length > 0">
          <!--<div class="fz10 text-grey ml-nm mb-xs">模块列表</div>-->
          <div v-for="module in app.appModuleList" :key="module.id">
            <div class="module-item ml-nm pb-xs pt-xs radius-sm overflow cursor module-flex" @click.stop="showEnv(app, module)">
              <span v-if="module.isHasEnv">
                <span v-if="!module.isLoading" :class="{ 'tsfont-right': !module.isExpand, 'tsfont-down': !!module.isExpand }"></span>
                <Icon
                  v-else
                  type="ios-loading"
                  size="16"
                  class="loading"
                ></Icon>
              </span>
              <span v-else-if="!module.isHasEnv" class="tsfont-dot"></span>
              <span v-else class="tsfont-application"></span>
              <Tooltip class="tooltip-box" :content="module.abbrName + (module.name ? '（' + module.name + '）' : '')" :transfer="true">
                <div style="width: 100%">
                  <span class="name-pl overflow" v-html="module.keywordHighlight ? module.keywordHighlight : (module.abbrName +(module.name ? '(' + module.name + ')' : '' ))"></span>
                </div>
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
                <span>
                  {{ env.name }}
                </span>
              </Tag>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentPage < pageCount" class="text-href pl-lg" @click="searchAppSystem(searchParam.currentPage + 1)">加载更多</div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    value: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      returnValue: this.value || {},
      searchParam: { keyword: '', pageSize: 50 },
      pageCount: 0,
      currentPage: 1,
      appSystemList: [],
      isLoading: false,
      selectedEnv: {}
    };
  },
  beforeCreate() {},
  async created() {
    await this.searchAppSystem();
  },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
  },
  destroyed() {},
  methods: {
    async showModule(app) {
      if (!app.isHasModule) {
        return;
      }
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
    async showEnv(app, module) {
      if (!module.isHasEnv) {
        return;
      }
      if (!module.isExpand) {
        this.$set(module, 'isLoading', true);
        let params = {
          appSystemId: app.id,
          appModuleId: module.id,
          isHasEnv: 1
        };
        await this.$api.cmdb.applicationManage.getAppenvListTree(params).then(res => {
          if (res && res.Status == 'OK') {
            const envList = res.Return || [];
            this.$set(module, 'envList', envList);
            this.$set(module, 'isExpand', true);
          }
        }).finally(() => {
          this.$set(module, 'isLoading', false);
        });
      } else {
        this.$set(module, 'isExpand', false);
      }
    },
    async searchAppSystem(currentPage) {
      if (!currentPage) {
        this.isLoading = true;
        this.searchParam.currentPage = 1;
      } else {
        this.searchParam.currentPage = currentPage;
      }
      await this.$api.cmdb.applicationManage
        .getAppsystemListTree(this.searchParam)
        .then(async res => {
          if (res && res.Status == 'OK') {
            const dataList = res.Return.tbodyList || [];
            this.pageCount = res.Return.pageCount;
            this.currentPage = res.Return.currentPage;
            if (dataList && dataList.length > 0) {
              let appSystemIdList = [];
              this.appSystemList &&
                  this.appSystemList.forEach(item => {
                    appSystemIdList.push(item.id);
                  });
              if (!currentPage) {
                this.appSystemList = dataList;
                this.initSelectNode();
              } else {
                dataList &&
                    dataList.forEach(item => {
                      // 添加应用后，处理下拉数据重复问题
                      if (!appSystemIdList.includes(item.id)) {
                        this.appSystemList.push(item);
                      }
                    });
              }
            } else {
              if (!currentPage) {
                this.appSystemList = [];
              }
            }
          }
        }).finally(() => {
          this.isLoading = false;
        });
    },
    selectEnv(app, module, env, disableEmit) {
      if (env.isSelected) {
        return;
      } else {
        if (this.selectedEnv) {
          this.$set(this.selectedEnv, 'isSelected', false);
          this.selectedEnv = null;
        }
        this.selectedEnv = env;
        this.$set(env, 'isSelected', true);
        if (!disableEmit) {
          this.$set(this.returnValue, 'appSystemId', app.id);
          this.$set(this.returnValue, 'appSystemName', app.name);
          this.$set(this.returnValue, 'appModuleId', module.id);
          this.$set(this.returnValue, 'appModuleName', module.name);
          this.$set(this.returnValue, 'envId', env.id);
          this.$set(this.returnValue, 'envName', env.name);
          // this.$set(this.returnValue, 'typeIdList', env.name);
        }
        this.$emit('update', this.returnValue);
      }
    },
    async initSelectNode() {
      if (!this.$utils.isEmpty(this.returnValue)) {
        const appSystemId = this.returnValue.appSystemId;
        const appModuleId = this.returnValue.appModuleId;
        const envId = this.returnValue.envId;
        const appNode = this.appSystemList.find(d => d.id === appSystemId);
        if (appNode && !appNode.isExpand) {
          await this.showModule(appNode);
        }
        if (appNode) {
          const moduleNode = appNode.appModuleList.find(d => d.id === appModuleId);
          if (moduleNode && !moduleNode.isExpand) {
            await this.showEnv(appNode, moduleNode);
          }
          if (moduleNode) {
            const envNode = moduleNode.envList.find(d => d.id === envId);
            if (envNode) {
              if (!envNode.isSelected) {
                this.selectEnv(appNode, moduleNode, envNode, true);
              }
            }
          }
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import (reference) '~@/resources/assets/css/variable.less';
  .theme(@text-color){
   #app-module-list-tree-wrap {
    a {
      vertical-align: middle; // 解决右键菜单打开新连接，会有动一下的问题
    }
    a:hover {
      color: @text-color;
    }
    }
  }
  html {
    .theme(@default-text);

    &.theme-dark {
      .theme(@dark-text);
    }
  }
</style>
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
