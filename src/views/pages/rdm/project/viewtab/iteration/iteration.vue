<template>
  <div>
    <TsContain :enableCollapse="false">
      <template v-slot:topLeft>
        <AppTab v-if="appId && projectId" :appId="appId" :projectId="projectId"></AppTab>
      </template>
      <template v-slot:topRight>
        <div class="action-group">
          <span class="action-item tsfont-plus" @click="addIteration()">{{ $t('term.rdm.iteration') }}</span>
        </div>
      </template>
      <template v-slot:content>
      </template>
    </TsContain>
    <EditIteration
      v-if="isEditIterationShow"
      :id="currentIterationId"
      :app="appData"
      @close="closeEditIteration"
    ></EditIteration>
  </div>
</template>
<script>
import mixins from '@/views/pages/rdm/project/viewtab/issue-mixin.js';
export default {
  name: '',
  components: {
    AppTab: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-tab.vue'], resolve),
    EditIteration: resolve => require(['@/views/pages/rdm/project/viewtab/components/edit-iteration-dialog.vue'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      pageName: this.$t('term.rdm.iterationmanage'),
      currentCatalog: null,
      currentIterationId: null,
      isEditIterationShow: false,
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
    closeAttrSetting(needRefresh) {
      this.isAttrSettingShow = false;
      if (needRefresh) {
        this.reloadIssueList();
      }
    },
    addIteration() {
      this.isEditIterationShow = true;
      this.currentIterationId = null;
    },
    closeEditIteration(needRefresh) {
      this.isEditIterationShow = false;
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
      this.isEditIterationShow = true;
      this.currentIssueId = issue.id;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
