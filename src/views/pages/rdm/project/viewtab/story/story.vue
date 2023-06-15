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
          <span class="action-item" @click="displayMode = displayMode === 'level' ? 'list' : 'level'">
            <span class="tsfont-flow-children" :class="{ 'text-primary': displayMode === 'list', 'text-grey': displayMode === 'level' }">{{ $t('term.rdm.listview') }}</span>
            <Divider type="vertical" />
            <span class="tsfont-formdynamiclist" :class="{ 'text-primary': displayMode === 'level', 'text-grey': displayMode === 'list' }">{{ $t('term.rdm.levelview') }}</span>
          </span>
          <span class="action-item tsfont-plus" @click="addIssue()">{{ $t('term.rdm.request') }}</span>
        </div>
      </template>
      <template v-slot:sider>
        <CatalogList :appId="appId" @changeCatalog="changeCatalog"></CatalogList>
      </template>
      <template v-slot:content>
        <IssueList
          v-if="isReady && appData"
          ref="issueList"
          :projectId="projectId"
          :mode="displayMode"
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
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve)
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
      isAttrSettingShow: false
    };
  },
  beforeCreate() {},
  created() {
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
  computed: {},
  watch: {}
};
</script>
