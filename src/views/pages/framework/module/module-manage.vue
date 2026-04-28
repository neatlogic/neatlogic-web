<template>
  <div>
    <TsContain>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-setting" @click="openSettingDialog">{{ $t('page.setting') }}</span>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="groupTheadList"
          :tbodyList="moduleGroupTableList"
          :fixedHeader="false"
          :showPager="false"
          keyName="group"
          class="inner-table"
        >
          <template v-slot:groupName="{ row }">
            <div>
              <span>{{ row.groupName }}</span>
              <span class="text-grey ml-xs">({{ row.group }})</span>
            </div>
            <div v-if="row.groupDescription" class="mt-xs text-grey fz10">{{ row.groupDescription }}</div>
          </template>
          <template v-slot:moduleList="{ row }">
            <div class="job-expand-table-box">
              <TsTable
                :theadList="moduleTheadList"
                :tbodyList="row.moduleList"
                :hideAction="false"
                :showPager="false"
                :showTotal="false"
                height="auto"
              >
                <template v-slot:name="{ row: module }">
                  <span class="cursor-pointer text-href" :class="{ 'tsfont-plugin': module.hasInitialData }" @click.stop="openVersionLogDialog(module)">{{ module.name }}</span>
                  <span class="text-grey ml-xs">({{ module.id }})</span>
                </template>
                <template v-slot:version="{ row: module }">
                  <span>{{ module.version || '-' }}</span>
                </template>
                <template v-slot:changelogVersion="{ row: module }">
                  <span>{{ module.changelogVersion || '-' }}</span>
                </template>
                <template v-slot:lastModified="{ row: module }">
                  <span>{{ formatDate(module.lastModified) }}</span>
                </template>
                <template v-slot:action="{ row: module }">
                  <div class="tstable-action">
                    <ul class="tstable-action-ul">
                      <li class="tsfont-history" @click.stop="openVersionLogDialog(module)">{{ $t('term.framework.versionlog') }}</li>
                      <li v-if="module.hasInitialData" class="tsfont-download" @click.stop="exportData(module)">{{ $t('page.exportinitdata') }}</li>
                      <li v-if="module.hasInitialData" class="tsfont-upload" @click.stop="openImportDialog(module)">{{ $t('page.importinitdata') }}</li>
                    </ul>
                  </div>
                </template>
              </TsTable>
            </div>
          </template>
          <template v-slot:alias="{ row }">
            <span>{{ row.alias || '-' }}</span>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <ModuleImportDialog v-if="isImportDialogShow" :moduleId="currentModuleId" @close="closeImportDialog"></ModuleImportDialog>
    <VersionLogDialog v-if="isShowVersionLogDialog" :moduleId="currentModuleId" @close="closeVersionLogDialog"></VersionLogDialog>
    <ModuleSettingDialog
      v-if="isSettingDialogShow"
      :groupList="settingGroupList"
      :config="moduleManageConfig"
      @close="closeSettingDialog"
    ></ModuleSettingDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ModuleImportDialog: () => import('./module-import-dialog.vue'),
    VersionLogDialog: () => import('./version-log-dialog'),
    ModuleSettingDialog: () => import('./module-setting-dialog.vue')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      isImportDialogShow: false,
      isShowVersionLogDialog: false,
      isSettingDialogShow: false,
      currentModuleId: '',
      moduleGroupList: [],
      moduleManageConfig: {}
    };
  },
  beforeCreate() {},
  created() {
    this.searchModule();
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
    async searchModule() {
      await Promise.all([this.getModuleManageSetting(), this.getModuleList()]);
    },
    getModuleList() {
      return this.$api.framework.module.searchModule().then(res => {
        const moduleGroupList = res.Return || [];
        //补充前端版本和最后修改时间
        return fetch('/version.md')
          .then(response => response.json())
          .then(data => {
            moduleGroupList.push({
              group: 'web',
              groupName: '前端',
              groupDescription: '前端页面',
              groupSort: 0,
              moduleList: [
                {id: 'web',
                  name: '前端',
                  lastModified: data.fcd,
                  version: data.version
                }
              ]
            });
            this.moduleGroupList = moduleGroupList;
          }).catch(error => {
            console.log('Error fetching the version file:', error);
            this.moduleGroupList = moduleGroupList;
          });
      });
    },
    getModuleManageSetting() {
      return this.$api.framework.module.getModuleManageSetting().then(res => {
        const setting = res.Return || {};
        this.moduleManageConfig = setting.config || {};
      });
    },
    openImportDialog(row) {
      this.isImportDialogShow = true;
      this.currentModuleId = row.id;
    },
    closeImportDialog() {
      this.isImportDialogShow = false;
      this.currentModuleId = '';
    },
    exportData(row) {
      const param = {
        url: '/api/binary/module/data/export',
        params: { moduleId: row.id }
      };
      this.download(param);
    },
    openVersionLogDialog(row) {
      this.currentModuleId = row.id;
      this.isShowVersionLogDialog = true;
    },
    closeVersionLogDialog() {
      this.currentModuleId = '';
      this.isShowVersionLogDialog = false;
    },
    openSettingDialog() {
      this.isSettingDialogShow = true;
    },
    closeSettingDialog(config) {
      this.isSettingDialogShow = false;
      if (config) {
        this.moduleManageConfig = config;
      }
    },
    formatDate(value) {
      if (!value) {
        return '-';
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString();
    }
  },
  filter: {},
  computed: {
    groupTheadList() {
      return [
        { key: 'groupName', title: this.$t('page.group'), width: 240 },
        { key: 'alias', title: this.$t('page.alias'), width: 180 },
        { key: 'moduleList', title: this.$t('page.module') }
      ];
    },
    moduleTheadList() {
      return [
        { key: 'name', title: this.$t('page.module'), width: 240 },
        { key: 'changelogVersion', title: 'changelog ' + this.$t('page.versions'), width: 160 },
        { key: 'version', title: this.$t('page.versions'), width: 160 },
        { key: 'lastModified', title: this.$t('page.installtime'), width: 180 },
        { key: 'action', title: '', width: 220 }
      ];
    },
    settingGroupList() {
      return this.moduleGroupList
        .filter(group => group.group !== 'web' && group.moduleList && group.moduleList.length > 0)
        .map(group => ({
          group: group.group,
          groupName: group.groupName,
          groupDescription: group.groupDescription
        }));
    },
    groupSettingMap() {
      const settingMap = {};
      const groupList = this.moduleManageConfig.groupList || [];
      groupList.forEach((item, index) => {
        settingMap[item.group] = {
          alias: item.alias,
          sort: item.sort != null ? item.sort : index
        };
      });
      return settingMap;
    },
    moduleGroupTableList() {
      const settingMap = this.groupSettingMap;
      return this.moduleGroupList
        .map((group, index) => {
          const setting = settingMap[group.group] || {};
          return {
            ...group,
            alias: setting.alias || '',
            sort: setting.sort != null ? setting.sort : index,
            moduleList: group.moduleList || []
          };
        })
        .filter(group => group.moduleList && group.moduleList.length > 0)
        .sort((a, b) => a.sort - b.sort);
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.job-expand-table-box {
  &.tstable-container .tstable-body th {
    height: 32px !important;
  }
}
</style>
