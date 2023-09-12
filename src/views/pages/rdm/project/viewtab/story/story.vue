<template>
  <div>
    <TsContain :enableCollapse="false">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <!--<span class="action-item">
            <Dropdown>
              <a href="javascript:void(0)" class="tsfont-eye">
                视图
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem
                  v-for="(view,index) in viewList"
                  :key="index"
                >
                  {{ view.name }}
                </DropdownItem>
                <DropdownItem divided @click.native="addView()">{{ $t('dialog.title.addtarget',{'target':$t('term.cmdb.view')}) }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>-->
          <span class="action-item">
            <Dropdown>
              <a href="javascript:void(0)" class="tsfont-blocks">
                {{ viewModeName }}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="changeViewMode('table')">{{ $t('page.list') }}</DropdownItem>
                <DropdownItem
                  @click.native="
                    changeViewMode('storywall');
                    changeDisplayMode('list');
                  "
                >
                  {{ $t('term.rdm.storywall') }}
                </DropdownItem>
                <DropdownItem @click.native="changeViewMode('gantt')">{{ $t('term.rdm.gantt') }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
          <span class="action-item tsfont-os" @click="editDisplayAttr()">
            {{ $t('term.rdm.attrsetting') }}
          </span>
          <span class="action-item" :class="{'disable': viewMode === 'storywall'}" @click="changeDisplayMode()">
            <span class="tsfont-flow-children" :class="{ 'text-primary': displayMode === 'list' }">{{ $t('term.rdm.listview') }}</span>
            <Divider type="vertical" />
            <span class="tsfont-formdynamiclist" :class="{ 'text-primary': displayMode === 'level', }">{{ $t('term.rdm.levelview') }}</span>
          </span>
          <span class="action-item" @click="addIssue()">
            <Button type="success">
              <span class="tsfont-plus">{{ $t('term.rdm.request') }}</span>
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
          :mode="displayMode"
          :app="appData"
          :canSearch="true"
          :canAction="true"
          :viewmode="viewMode"
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
    <EditViewDialog v-if="isViewShow" :appId="appId" @close="isViewShow=false;"></EditViewDialog>
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
    EditViewDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-view-dialog.vue'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      pageName: this.$t('term.rdm.requestmanage'),
      currentCatalog: null,
      currentIssueId: null,
      isEditIssueShow: false,
      isAttrSettingShow: false,
      isShowGantt: false,
      displayMode: 'level',
      viewList: [],
      isViewShow: false
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
    addView() {
      this.isViewShow = true;
    },
    restoreHistory(historyData) {
      if (historyData) {
        if (historyData['displayMode']) {
          this.displayMode = historyData['displayMode'];
        }
        if (historyData['viewmode']) {
          this.viewMode = historyData['viewmode'];
        }
      }
    },
    changeDisplayMode(displayMode) {
      if (!displayMode) {
        if (this.viewMode !== 'storywall') {
          this.displayMode = this.displayMode === 'level' ? 'list' : 'level';
        }
      } else {
        if (this.displayMode != displayMode) {
          this.displayMode = displayMode;
        }
      }
      this.$addHistoryData('displayMode', this.displayMode);
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
  computed: {},
  watch: {}
};
</script>
