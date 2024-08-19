<template>
  <div>
    <TsContain>
      <template v-slot:content>
        <div v-for="(moduleGroup, index) in moduleGroupList" :key="index" class="mb-nm">
          <div v-if="moduleGroup.moduleList && moduleGroup.moduleList.length > 0" class="grid">
            <div class="mb-sm">
              <div>
                <span>{{ moduleGroup.groupName }}</span>
                <span class="text-grey">({{ moduleGroup.group }})</span>
              </div>
              <div class="mt-xs text-grey fz10">{{ moduleGroup.groupDescription }}</div>
            </div>
            <div>
              <TsCard
                v-if="moduleGroup.moduleList && moduleGroup.moduleList.length > 0"
                :cardList="moduleGroup.moduleList"
                :sm="8"
                :lg="6"
                :xl="6"
                :xxl="4"
                :padding="false"
              >
                <template slot-scope="{ row }">
                  <div class="padding cursor-pointer" @click.stop="openVersionLogDialog(row)">
                    <div>
                      <span :class="{ 'tsfont-plugin': row.hasInitialData }">{{ row.name }}</span>
                      <span class="text-grey ml-xs">({{ row.id }})</span>
                    </div>
                    <div class="mt-xs">
                      <span v-if="row.id !== 'web'" class="text-grey mr-xs">{{ 'pom ' + $t('page.versions') }}</span>
                      <span v-else class="text-grey mr-xs">{{ $t('page.versions') }}</span>
                      <span>{{ row.version || '-' }}</span>
                    </div>
                    <div class="mt-xs">
                      <span class="text-grey mr-xs">{{ 'changelog ' + $t('page.versions') }}</span>
                      <span>{{ row.changelogVersion || '-' }}</span>
                    </div>
                    <div class="mt-xs">
                      <span class="text-grey mr-xs">{{ $t('page.installtime') }}</span>
                      <span>{{ new Date(row.lastModified).toLocaleString() || '-' }}</span>
                    </div>
                  </div>
                </template>
                <template v-slot:control="{ row }">
                  <div v-if="row.hasInitialData" class="tsfont-download text-action" @click="exportData(row)">{{ $t('page.exportinitdata') }}</div>
                  <div v-if="row.hasInitialData" class="tsfont-upload text-action" @click="openImportDialog(row)">{{ $t('page.importinitdata') }}</div>
                </template>
              </TsCard>
            </div>
          </div>
        </div>
      </template>
    </TsContain>
    <ModuleImportDialog v-if="isImportDialogShow" :moduleId="currentModuleId" @close="closeImportDialog"></ModuleImportDialog>
    <VersionLogDialog v-if="isShowVersionLogDialog" :moduleId="currentModuleId" @close="closeVersionLogDialog"></VersionLogDialog>
  </div>
</template>
<script>
import download from '@/resources/mixins/download.js';
export default {
  name: '',
  components: {
    TsCard: () => import('@/resources/components/TsCard/TsCard.vue'),
    ModuleImportDialog: () => import('./module-import-dialog.vue'),
    VersionLogDialog: () => import('./version-log-dialog')
  },
  mixins: [download],
  props: {},
  data() {
    return {
      isImportDialogShow: false,
      isShowVersionLogDialog: false,
      currentModuleId: '',
      moduleGroupList: []
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
    searchModule() {
      this.$api.framework.module.searchModule().then(res => {
        this.moduleGroupList = res.Return;
        //补充前端版本和最后修改时间
        fetch('/version.md')
          .then(response => response.json())
          .then(data => {
            this.webBuildDate = data.fcd;
            this.webBuildVersion = data.version;
            this.moduleGroupList.push({
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
          }).catch(error => {
            this.error = error.message;
            console.log('Error fetching the version file:', error);
          });
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 250px auto;
}
</style>
