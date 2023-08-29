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
      ref="uploadDialog"
      :actionUrl="actionUrl"
      :formatList="formatList"
      :isValid="true"
      @on-success="searchIssue(1)"
    >
      <template slot="desc">
        <div v-download="downloadUrl" class="tsfont-download text-href" @click.stop>{{ $t('term.rdm.downloadtemplate') }}</div>
      </template>
    </UploadDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    CatalogList: resolve => require(['@/views/pages/rdm/project/viewtab/components/catalog-list.vue'], resolve),
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve),
    UploadDialog: resolve => require(['@/resources/components/UploadDialog/UploadDialog.vue'], resolve)
  },
  directives: { download },
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
      formatList: ['xls', 'xlsx'] //导入文件格式
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
    importTestcase() {
      this.$refs.uploadDialog.showDialog();
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
    downloadUrl() {
      return {
        url: 'api/binary/rdm/testcase/template/get',
        params: { projectId: this.projectId, appId: this.appId }
      };
    }
  },
  watch: {}
};
</script>
