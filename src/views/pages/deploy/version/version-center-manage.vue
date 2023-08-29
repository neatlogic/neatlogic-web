<template>
  <div>
    <TsContain :enableCollapse="true" :siderWidth="220">
      <template v-slot:topLeft>
        <div class="action-group">
          <Tooltip
            v-if="appModuleData && !appModuleData.appId"
            :content="$t('term.deploy.selectaddversion')"
            max-width="400"
            placement="right"
            transfer
          >
            <span class="tsfont-plus text-disabled action-item">{{ $t('page.versions') }}</span>
          </Tooltip>
          <Tooltip
            v-else-if="!hasAuth"
            max-width="400"
            placement="right"
            transfer
          >
            <span class="tsfont-plus text-disabled action-item">{{ $t('page.versions') }}</span>
            <ul slot="content">
              <li v-if="!canEdit">{{ $t('term.deploy.noconfigauthtip') }}</li>
            </ul>
          </Tooltip>
          <span v-else-if="appModuleData && appModuleData.appId" class="action-item tsfont-plus" @click="addVersion">{{ $t('page.versions') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <AppModuleList
          v-model="appModuleData"
          :filter="{ authorityActionList: ['versionAndProductManager'] }"
          @getSelectedApp="getSelectedApp"
          @getSelectedModule="getSelectedModule"
        ></AppModuleList>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          :canEdit="true"
          v-bind="versionData"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @checkshow="checkshow"
        >
          <template slot="version" slot-scope="{ row }">
            <span v-if="row" class="text-href" @click="gotoDeployStatus(row)">{{ row.version }}</span>
          </template>
          <template slot="compileCount" slot-scope="{ row }">
            <span>{{ row.compileCount }} {{ row.compileFailCount ? $t('term.deploy.failurecount', {target: row.compileFailCount}) : '' }}</span>
          </template>
          <template slot="buildNo" slot-scope="{ row }">
            <div v-if="row.buildNoList && row.buildNoList.length > 0">
              <CommonStatus
                v-for="(item, index) in row.buildNoList"
                v-show="index == 0"
                :key="index"
                :statusValue="getStatusValue(item.status)"
                :statusName="item.buildNo"
                class="pr-xs cursor"
                type="block"
                @click="() => openBuildNoDialog(row, item)"
              ></CommonStatus>
              <Poptip
                v-if="row.buildNoList.length > 1"
                word-wrap
                :width="225 + (row.buildNoList.length / 50) * 50"
                :transfer="true"
                trigger="hover"
                placement="top"
              >
                <span class="tsfont-option-horizontal text-href"></span>
                <div slot="content" class="clearfix">
                  <div
                    v-for="(item, index) in row.buildNoList"
                    v-show="index > 1"
                    :key="index"
                    class="mb-xs version-item"
                  ><CommonStatus
                    :statusValue="getStatusValue(item.status)"
                    :statusName="item.buildNo"
                    class="cursor"
                    type="block"
                    @click="() => openBuildNoDialog(row, item)"
                  ></CommonStatus></div>
                </div>
              </Poptip>
            </div>
          </template>
          <template slot="env" slot-scope="{ row }">
            <div v-if="row.envList && row.envList.length > 0">
              <CommonStatus
                v-for="(item, index) in row.envList"
                :key="index"
                :statusValue="getStatusValue(item.status)"
                :statusName="item.envName"
                class="pr-xs cursor-pointer"
                type="block"
                @click="() => openEnvDialog(row, item)"
              ></CommonStatus>
            </div>
          </template>
          <template slot="appModuleAbbrName" slot-scope="{ row }">
            <span v-if="row">{{ getModuleName(row) }}</span>
          </template>
          <template slot="isFreeze" slot-scope="{ row }">
            <Poptip
              v-if="!hasAuth"
              width="400"
              trigger="hover"
              placement="top"
              :content="$t('term.deploy.notversionproductauth')"
            >
              <TsFormSwitch
                v-model="row.isFreeze"
                :trueValue="1"
                :falseValue="0"
                :disabled="!hasAuth"
              ></TsFormSwitch>
            </Poptip>
            <TsFormSwitch
              v-else
              v-model="row.isFreeze"
              :trueValue="1"
              :falseValue="0"
              @on-change="isFreeze => switchLockVersion(row.id, isFreeze)"
            ></TsFormSwitch>
          </template>
          <template slot="description" slot-scope="{ row }">
            <div v-if="(row.description && row.description.length < 10) || !row.description">
              {{ row.description }}
            </div>
            <Tooltip
              v-else
              max-width="320"
              theme="light"
              transfer
              :content="row.description"
            >
              <div class="description-text overflow">{{ row.description }}</div>
            </Tooltip>
          </template>
          <template slot="action" slot-scope="{ row, index }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-trash-o icon" @click="deleteVersion(row.id, row.version, index)">{{ $t('page.delete') }}</li>
                <li class="tsfont-file-single icon" @click="openProjectDirectoryDialog(row.id)">{{ $t('term.deploy.projectdirectory') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <VersionAddDialog v-if="isShowVersionAddDialog" :params="versionParams" @close="closeVersionAddDialog"></VersionAddDialog>
    <BuildNoDialog
      v-if="isShowBuildNoDialog"
      :buildNoParams="buildNoParams"
      :statusValue="statusValue"
      :statusName="statusName"
      :title="buildNoTitle"
      :hasAllAuth="hasAuth"
      @close="isShowBuildNoDialog = false"
    ></BuildNoDialog>
    <EnvDialog
      v-if="isShowEnvDialog"
      :envParams="envParams"
      :statusValue="statusValue"
      :statusName="statusName"
      :title="envTitle"
      :hasAllAuth="hasEnvsAuth"
      @close="isShowEnvDialog = false"
    ></EnvDialog>
    <ProjectDirectoryDialog
      v-if="isShowProjectDirectoryDialog"
      :params="projectDirectoryParams"
      :hasAllAuth="hasAuth"
      @close="isShowProjectDirectoryDialog = false"
    ></ProjectDirectoryDialog>
  </div>
</template>
<script>
import versionCenterMixin from './versionCenterMixin.js';
export default {
  name: '', // 版本中心
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    CommonStatus: resolve => require(['@/resources/components/Status/CommonStatus.vue'], resolve),
    AppModuleList: resolve => require(['../application-config/config/app/app-module-list.vue'], resolve),
    VersionAddDialog: resolve => require(['./version-add-dialog'], resolve), // 新增版本
    BuildNoDialog: resolve => require(['./build-no/build-no-dialog'], resolve), // build-no
    EnvDialog: resolve => require(['./env-dialog'], resolve), // env
    ProjectDirectoryDialog: resolve => require(['./project-directory-dialog'], resolve) // 工程目录
  },
  mixins: [versionCenterMixin],
  props: {},
  data() {
    return {
      appModuleData: {},
      isShowVersionAddDialog: false,
      isShowBuildNoDialog: false,
      isShowEnvDialog: false,
      isShowAuthDialog: false,
      searchParam: { authorityActionList: ['versionAndProductManager'] }, // 操作权限，制品管理&版本
      versionData: {},
      versionParams: {}, // 版本
      buildNoParams: {},
      envParams: {},
      statusName: '',
      statusValue: '',
      buildNoTitle: '',
      envTitle: '', // 环境弹窗title
      authList: [],
      hasEnvsAuth: false, //是否拥有制品管理&版本&环境权限
      selectedApp: null,
      selectedModule: null,
      versionId: '', // 版本id
      theadList: [],
      defaultTheadList: [
        {
          title: this.$t('page.versions'),
          key: 'version',
          isDisabled: true,
          isShow: 1
        },
        {
          title: this.$t('page.compilecount'),
          key: 'compileCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.sealplate'),
          key: 'isFreeze',
          isDisabled: false,
          isShow: 1
        },
        {
          title: 'BuildNo',
          key: 'buildNo',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('page.environment'),
          key: 'env',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('page.module'),
          key: 'appModuleAbbrName',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.issuecount'),
          key: 'issueCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.fileaddcount'),
          key: 'fileAddCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.filemodifycount'),
          key: 'fileModifyCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.filedeletecount'),
          key: 'fileDeleteCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.lineaddcount'),
          key: 'lineAddCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('term.deploy.linedeletecount'),
          key: 'lineDeleteCount',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('page.description'),
          key: 'description',
          isDisabled: false,
          isShow: 1
        },
        {
          title: this.$t('page.createtime'),
          type: 'time',
          key: 'fcd',
          isDisabled: false,
          isShow: 1
        },
        {
          key: 'action'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    let query = this.$route.query;
    if (query && !this.$utils.isEmptyObj(query) && query.appSystemId) {
      let {appSystemId, appModuleId, envId} = query;
      this.appModuleData = {
        appId: appSystemId ? parseInt(appSystemId) : null,
        moduleId: appModuleId ? parseInt(appModuleId) : null,
        envId: envId ? parseInt(envId) : null
      };
    }
    if (query && !query.appSystemId && !query.isBack) {
      this.$addHistoryData('appModuleEnvData', {}); // 清空上一次内容
    }
    this.theadList = this.defaultTheadList;
    this.changeCurrent();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getSelectedApp(app) {
      this.selectedApp = app;
      this.authList = app && app.authActionSet && app.authActionSet.length > 0 ? app.authActionSet : [];
      if (app?.id) {
        this.versionId = app.id;
        this.getTheadList();
      }
      console.log('app', app);
    },
    getSelectedModule(module) {
      this.selectedModule = module;
    },
    addVersion() {
      this.isShowVersionAddDialog = true;
    },
    closeVersionAddDialog(needRefresh) {
      this.isShowVersionAddDialog = false;
      if (needRefresh) {
        this.changeCurrent();
      }
    },
    searchVersion() {
      this.$api.deploy.version.searchVersion(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.versionData = res.Return;
        }
      });
    },
    changeCurrent(currentPage = 1) {
      this.searchParam.currentPage = currentPage;
      this.searchVersion();
    },
    changePageSize(pageSize) {
      this.searchParam.currentPage = 1;
      this.searchParam.pageSize = pageSize;
      this.searchVersion();
    },
    selectedTreeNode(node) {
      this.versionParams = {};
      this.projectDirectoryParams = {};
      if (node) {
        let { appSystemId, appModuleId, configType, title } = node;
        if (configType == 'app') {
          this.searchParam.appSystemIdList = [appSystemId];
          this.changeCurrent();
          this.versionParams = {
            appSystemId: appSystemId
          };
        } else if (configType == 'module') {
          this.searchParam = {
            appSystemIdList: [appSystemId],
            appModuleIdList: [appModuleId]
          };
          this.changeCurrent();
          this.versionParams = {
            appSystemId: appSystemId,
            appModuleId: appModuleId
          };
          this.projectDirectoryParams = {
            moduleName: title
          };
        } else if (configType == 'all') {
          // 所有
          this.searchParam = {};
          this.versionParams = {};
          this.changeCurrent();
        }
      }
    },
    gotoDeployStatus(row) {
      if (row) {
        let { appSystemAbbrName, appModuleAbbrName, version, id, isFreeze } = row;
        this.$router.push({
          path: './version-detail',
          query: { 
            versionId: id, 
            title: appSystemAbbrName ? (appModuleAbbrName ? `${appSystemAbbrName}/${appModuleAbbrName}/V${version}` : `${appSystemAbbrName}/V${version}`) : `V${version}`,
            versionName: version,
            isFreeze: isFreeze,
            hasAuth: this.hasAuth // 是否有制品管理员权限
          }
        });
      }
    },
    openBuildNoDialog(row, buildNoItem) {
      if (row && buildNoItem) {
        let { id, version } = row;
        let { buildNo, statusName, status } = buildNoItem;
        this.buildNoParams = {
          id,
          buildNo,
          type: 'build'
        };
        this.statusName = statusName;
        this.statusValue = status;
        this.buildNoTitle = `${version}-build${buildNo || ''}`;
        this.isShowBuildNoDialog = true;
      }
    },
    getStatusValue(status) {
      let statusObj = {
        released: 'released',
        compileFailed: 'compileFailed',
        releaseFailed: 'releaseFailed'
      };
      return statusObj[status] || 'running';
    },
    getModuleName(row) {
      let moduleName = '';
      if (row) {
        let { appSystemAbbrName, appModuleAbbrName } = row;
        moduleName = appSystemAbbrName ? (appModuleAbbrName ? `${appSystemAbbrName}/${appModuleAbbrName}` : appSystemAbbrName) : '';
      }
      return moduleName;
    },
    openEnvDialog(row, item) {
      if (row && item) {
        let { buildNo, statusName, status, envId, envName, isMirror } = item;
        let { id, version } = row;
        this.envParams = {
          id,
          envId,
          buildNo,
          isMirror,
          type: 'env'
        };
        this.statusName = statusName;
        this.statusValue = status;
        this.envTitle = `${envName}-${version}`;
        this.hasEnvsAuth = this.hasEnvAuth(envId);
      }
      this.isShowEnvDialog = true;
    },
    restoreHistory(historyData) {
      this.appModuleData = historyData['appModuleEnvData'] || {};
    },
    checkshow(headList, isShowColumn) {
      // 拖拽排序行列，显示隐藏列
      console.log('返回的内容', headList);
      this.$api.deploy.version
        .saveVersionThead({
          versionId: this.versionId,
          config: { theadList: headList}
        });
    },
    getTheadList() {
      return this.$api.deploy.version
        .getVersionTheadList({
          versionId: this.versionId
        }).then((res) => {
          if (res?.Status == 'OK') {
            console.log('res.return', res.Return);
            this.theadList = res?.Return?.config?.theadList ? res.Return.config.theadList : this.defaultTheadList;
          }
        });
    }
  },
  filter: {},
  computed: {
    canEdit() {
      // [编辑配置]权限
      if ((this.selectedApp && this.selectedApp.isHasAllAuthority) || this.authList.includes('operation#edit') || this.authList.includes('operation#all') || this.authList.length == 0) {
        return true;
      }
      return false;
    },
    hasAuth() {
      // [版本&制品管理]权限
      if ((this.selectedApp && this.selectedApp.isHasAllAuthority) || this.authList.includes('operation#versionAndProductManager') || this.authList.includes('operation#all') || this.authList.length == 0) {
        return true;
      }
      return false;
    },
    hasEnvAuth() {
      return function(envId) {
        // [版本&制品管理&环境]权限
        if ((this.selectedApp && this.selectedApp.isHasAllAuthority) || (envId && this.authList.includes('opeartion#versionAndProductManager') && this.authList.includes(`env#${envId}`)) || (this.authList.includes('operation#all') && this.authList.includes('env#all')) || this.authList.length == 0) {
          return true;
        }
        return false;
      };
    }
  },
  watch: {
    appModuleData: {
      handler: function(val) {
        const appSystemId = val && val.appId;
        const appModuleId = val && val.moduleId;
        if (appSystemId && appModuleId) {
          //选中了模块
          this.searchParam = {
            appSystemIdList: [appSystemId],
            appModuleIdList: [appModuleId]
          };
          this.changeCurrent();
          this.versionParams = {
            appSystemId: appSystemId,
            appModuleId: appModuleId
          };
        } else if (appSystemId) {
          //选中了应用系统
          this.searchParam.appSystemIdList = [appSystemId];
          this.changeCurrent();
          this.versionParams = {
            appSystemId: appSystemId
          };
        } else {
          // 所有
          this.searchParam = {};
          this.changeCurrent();
        }
        this.$addHistoryData('appModuleEnvData', val);
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.version-item {
  text-align: center;
  display: inline-block;
  width: 40px;
}
.status-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 20% 20% 20% 20% 20%;
}
.description-text {
  display: inline-block;
  width: 155px;
}
</style>
