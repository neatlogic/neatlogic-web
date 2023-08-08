<template>
  <div>
    <TsContain :enableCollapse="true">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item">
            <TsFormSwitch
              :value="isShowGantt"
              :showStatus="true"
              :trueValue="true"
              :falseValue="false"
              :trueText="$t('term.rdm.gantt')"
              :falseText="$t('term.rdm.gantt')"
              @on-change="
                val => {
                  isReady = false;
                  isShowGantt = val;
                  $addHistoryData('isShowGantt', isShowGantt);
                  $nextTick(() => {
                    isReady = true;
                  });
                }
              "
            ></TsFormSwitch>
          </span>
          <span class="action-item tsfont-os" @click="editDisplayAttr()">
            {{ $t('term.rdm.attrsetting') }}
          </span>
          <span class="action-item" @click="addIssue()">
            <Button type="success">
              <span class="tsfont-plus">{{ $t('page.task') }}</span>
            </Button>
          </span>
        </div>
      </template>
      <template v-slot:content>
        <IssueList
          v-if="isReady && appData"
          ref="issueList"
          :projectId="projectId"
          :app="appData"
          :isShowGantt="isShowGantt"
          :canSearch="true"
          :canAction="true"
          :isShowEmptyTable="true"
        ></IssueList>
      </template>
    </TsContain>
    <EditIssue
      v-if="isEditIssueShow"
      :id="currentIssueId"
      :app="appData"
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
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIssue: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-issue-dialog.vue'], resolve),
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve),
    AttrSettingDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/attr-setting-dialog.vue'], resolve)
  },
  mixins: [mixins],
  props: {
  
  },
  data() {
    return {
      pageName: this.$t('term.rdm.taskmanage'),
      currentIssueId: null,
      isEditIssueShow: false,
      isAttrSettingShow: false,
      isReady: true, //刷新issue-list组件
      isShowGantt: false
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
      this.$router.push({path: '/request-detail/' + this.projectId + '/' + this.appId + '/' + id});
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
    reloadIssueList() {
      this.isReady = false;
      this.$nextTick(() => {
        this.isReady = true;
      });
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
