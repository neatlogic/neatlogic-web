<template>
  <div>
    <TsContain :enableCollapse="false">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-os" @click="editDisplayAttr()">
            {{ $t('term.rdm.attrsetting') }}
          </span>
          <span class="action-item tsfont-upload" @click="importTestcase()">{{ $t('term.rdm.importtestcase') }}</span>
          <span class="action-item" @click="addIssue()">
            <Button type="success">
              <span class="tsfont-plus">{{ $t('term.rdm.testcase') }}</span>
            </Button>
          </span>
        </div>
      </template>
      <template v-slot:sider>
        <CatalogList :appId="appId" :projectId="projectId" @changeCatalog="changeCatalog"></CatalogList>
      </template>
      <template v-slot:content>
        <IssueList
          v-if="isReady && appData"
          ref="issueList"
          :projectId="projectId"
          :app="appData"
          :canSearch="true"
          :canAction="true"
          :catalog="currentCatalog"
          :isShowEmptyTable="true"
        ></IssueList>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
      :catalogId="currentCatalog"
      @close="closeEditIssue"
    ></EditIssue>
    <AttrSettingDialog v-if="isAttrSettingShow" :appId="appId" @close="closeAttrSetting"></AttrSettingDialog>
    <UploadDialog
      v-if="isImportShow"
      :projectId="projectId"
      :appId="appId"
      @close="closeImport"
    >
    </UploadDialog>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    CatalogList: resolve => require(['@/views/pages/rdm/project/viewtab/components/catalog-list.vue'], resolve),
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve),
    UploadDialog: resolve => require(['@/views/pages/rdm/project/viewtab/testcase/testcase-import-dialog.vue'], resolve)
    
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      pageName: this.$t('term.rdm.requestmanage'),
      currentCatalog: null,
      currentIssueId: null,
      isEditIssueShow: false,
      displayMode: 'level',
      actionUrl: BASEURLPREFIX + '/api/binary/integration/import', //导入地址
      isAttrSettingShow: false,
      isImportShow: false
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
    closeImport(needRefresh) {
      this.isImportShow = false;
      if (needRefresh) {
        this.$refs['issueList'].refresh(1);
      }
    },
    importTestcase() {
      this.isImportShow = true;
    },
    editDisplayAttr() {
      this.isAttrSettingShow = true;
    },
    closeAttrSetting(needRefresh) {
      this.isAttrSettingShow = false;
      if (needRefresh) {
        this.reloadIssueList();
      }
    },
    toRequestDetail(id) {
      this.$router.push({ path: '/request-detail/' + this.projectId + '/' + this.appId + '/' + id });
    },
    addIssue() {
      this.isEditIssueShow = true;
      this.currentIssueId = null;
    },
    closeEditIssue(needRefresh) {
      this.isEditIssueShow = false;
      if (needRefresh) {
        this.refreshIssueList();
      }
    },
    changeCatalog(catalog) {
      if (catalog) {
        this.currentCatalog = catalog.id;
      } else {
        this.currentCatalog = null;
      }
    },
    editIssue(issue) {
      this.isEditIssueShow = true;
      this.currentIssueId = issue.id;
    }
  },
  filter: {},
  computed: {
   
  },
  watch: {}
};
</script>
