<template>
  <div>
    <TsContain :siderWidth="220" :isSiderHide="true" enableCollapse>
      <template v-slot:sider>
        <AppModuleList
          ref="appModuleList"
          v-model="appModuleData"
          :filter="{authorityActionList: ['view']}"
        ></AppModuleList>
      </template>
      <template v-slot:content>
        <div class="activeversion-main">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <template v-if="activeVersionData && !loadingShow">
            <div v-for="item in activeVersionData.tbodyList" :key="item.appSystemId" class="pb-lg">
              <div class="pb-nm">
                <span>{{ item.appSystemAbbrName }}</span>
                <span v-if="item.appSystemName">[{{ item.appSystemName }}]</span>
              </div>
              <div v-if="item.moduleList && item.moduleList.length">
                <div
                  v-for="(m,mindex) in item.moduleList"
                  :id="'module_' + m.appModuleId"
                  :key="mindex"
                  class="module-list"
                >
                  <div class="bg-op radius-lg">
                    <div class="module-top border-color">
                      <div class="module-name">
                        <span>{{ m.appModuleAbbrName }}</span>
                        <span v-if="m.appModuleName">[{{ m.appModuleName }}]</span>
                      </div>
                      <div class="tsfont-history" :class="$utils.isEmpty(m.envList)?'text-disabled':'text-action'" @click="openVersion(m, item)">{{ $t('page.hisversions') }}</div>
                    </div>
                    <template v-if="m.envList && m.versionList">
                      <div class="module-content">
                        <div v-if="m.envList && m.envList.length" class="env pb-nm">
                          <div v-for="(e,eindex) in m.envList" :key="eindex">
                            <div>{{ e.envName }}</div>
                            <div class="text-tip">{{ e.version }}</div>
                          </div>
                        </div>
                        <div v-if="m.versionList && m.versionList.length" class="version">
                          <div v-for="(v,vindex) in m.versionList" :key="vindex" class="version-list pb-nm">
                            <div class="version-info">
                              <span class="version-name pr-md overflow">{{ v.version }}</span>
                              <span class="text-tip pr-xs">{{ $t('page.compile') }}</span>
                              <span class="pr-sm" :class="v.compileSuccessCount> 0?'text-success':'text-tip'">{{ v.compileSuccessCount }}</span>
                              <span :class="v.compileFailCount> 0?'text-danger':'text-tip'">{{ v.compileFailCount }}</span>
                            </div>
                            <div class="version-compile">
                              <div
                                v-for="(e,eindex) in v.envList"
                                :key="eindex"
                                class="version-compile-list"
                                :class="eindex===0?'not-line':''"
                              >
                                <div class="version-line" :class="e.status=='deployed'?'border-color-primary':'border-primary-grey'"></div>
                                <div class="version-dot bg-op">
                                  <div class="dot-i" :class="e.status=='deployed'?'border-color-primary active' :'bg-dot'"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <div v-else class="text-tip text-center padding">{{ $t('page.notarget', {target: $t('term.deploy.activeversion')}) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-tip">{{ $t('page.notarget', {target: $t('term.deploy.activeversion')}) }}</div>
            </div>
            <div v-if="!appSystemId && activeVersionData.rowNum > 0" class="page-container bg-grey text-right">
              <Page 
                :current.sync="activeVersionData.currentPage"
                :page-size="activeVersionData.pageSize"
                :total="activeVersionData.rowNum"
                size="small"
                transfer
                show-total
                show-sizer
                @on-change="currentPage => searchActiveVersionList(currentPage)"
                @on-page-size-change="pageSize => changePageSize(pageSize)"
              />
            </div>
          </template>
          <template v-else>
            <NoData></NoData>
          </template>
        </div>
      </template>
    </TsContain>
    <HistoryVersionDialog
      v-if="isShowVersionDialog"
      :appSystemId="appSystemId"
      :appModuleId="appModuleId"
      :title="appModuleName"
      :envList="envList"
      @close="isShowVersionDialog=false"
    ></HistoryVersionDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AppModuleList: resolve => require(['../application-config/config/app/app-module-list.vue'], resolve),
    HistoryVersionDialog: resolve => require(['./history-version-dialog.vue'], resolve)
  },
  props: {},
  data() {
    return {
      loadingShow: true,
      activeVersionData: null,
      appModuleData: {},
      isShowVersionDialog: false,
      appSystemId: null,
      appModuleId: null,
      appModuleName: '',
      envList: [],
      searchParams: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    searchActiveVersionList(currentPage) {
      let data = {};
      currentPage && this.$set(this.searchParams, 'currentPage', currentPage);
      if (this.appSystemId) {
        this.$set(data, 'defaultValue', [this.appSystemId]);
      }
      Object.assign(data, this.searchParams);
      this.loadingShow = true;
      this.$api.deploy.activeversion.searchActiveVersionList(data).then(res => {
        if (res.Status == 'OK') {
          this.activeVersionData = res.Return;
          this.$nextTick(() => {
            this.appModuleId && this.$utils.jumpTo('#module_' + this.appModuleId);
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    openVersion(m, item) {
      if (this.$utils.isEmpty(m.envList)) {
        return;
      }
      this.appSystemId = m.appSystemId;
      this.appModuleId = m.appModuleId;
      this.appModuleName = item.appSystemAbbrName + (item.appSystemName ? '[' + item.appSystemName + ']' : '') + '/' + m.appModuleAbbrName + (m.appModuleName ? '[' + m.appModuleName + ']' : ''); 
      this.envList = m.envList || [];
      this.isShowVersionDialog = true;
    },
    changePageSize(pageSize) {
      this.$set(this.searchParams, 'pageSize', pageSize);
      this.searchActiveVersionList(1);
    }
  },
  filter: {},
  computed: {},
  watch: {
    appModuleData: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.appModuleId = val.moduleId || null;
          if (val.appId && val.appId === this.appSystemId) {
            val.moduleId && this.$utils.jumpTo('#module_' + val.moduleId);
          } else {
            this.appSystemId = val.appId;
            this.searchActiveVersionList(1);
          }
        } else {
          this.appSystemId = null;
          this.searchActiveVersionList(1);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.activeversion-main {
  position: relative;
  .module-list {
    &:not(:last-child) {
      padding-bottom: 10px;
    }
    .module-top {
      padding: 16px 16px 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid;
    }
    .module-content {
      padding: 16px 16px 16px 24px;
      .env {
        display: flex;
        padding-left: 200px;
        padding-right: 40px;
        justify-content: space-between;
        >div {
          &:nth-child(n+2) {
            flex-grow: 1;
            text-align: right;
          }
        }
      }
      .version {
        .version-list {
          position: relative;
          padding-left: 200px;
          .version-info {
            position: absolute;
            left: 0;
            top: 0;
            width: 200px;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            .version-name {
              width: 112px;
            }
          }
        }
        .version-compile {
          display: flex;
          align-items: center;
          height: 1.4rem;
          padding-right: 48px;
          .version-compile-list {
            position: relative;
            top: 10px;
            min-height: 20px;
            &:nth-child(n+2) {
              flex-grow: 1;
              text-align: right;
              .version-dot {
                left: calc(100% - 10px);
                i { 
                  left: 6px;
                }
              }
            }
            .version-line {
              width: 100%;
              border-top: 2px solid;
            }
            &.not-line {
              .version-line {
                display: none;
              }
            }
          }
          .version-dot {
            position: absolute;
            top: -9px;
            left: 0;
            width: 20px;
            height: 18px;
            z-index: 1;
            text-align: center;
            padding-top: 6px;
            .dot-i{
              width: 6px;
              height: 6px;
              border-radius: 50%;
              margin: 0 auto;
              &.active {
                width: 8px;
                height: 8px;
                border: 2px solid;
              }
              &.bg-dot {
                top: 6px
              }
            }
          }
          .version-active-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border:3px solid;
          }
        }
      }
    }
  }
}
</style>
