<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close()">
      <template v-slot>
        <div>
          <IssueList
            :canSelect="true"
            :canAction="false"
            :canAppend="false"
            :canSearch="true"
            :needSearch="true"
            :fixedHeader="false"
            :checkedIdList="relIssueIdList"
            :projectId="projectId"
            :app="app"
            :isCopy="app && app.type === 'testcase' ? 0 : null"
            @selected="selectIssue"
          ></IssueList>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    IssueList: () => import('@/views/pages/rdm/project/viewtab/components/issue-list.vue')
  },
  props: {
    id: { type: Number },
    projectId: { type: Number },
    app: { type: Object },
    direction: {
      type: String,
      validator: function(value) {
        return ['from', 'to'].includes(value);
      }
    },
    reltype: {
      type: String,
      validator: function(value) {
        return ['extend', 'relative', 'repeat'].includes(value);
      }
    }
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('dialog.title.linktarget', { target: this.app.name }),
        width: 'large',
        type: 'modal',
        maskClose: false,
        isShow: true
      },
      targetIssueList: [],
      relIssueIdList: []
    };
  },
  beforeCreate() {},
  created() {
    this.getRelIssueIdList();
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
    getRelIssueIdList() {
      this.$api.rdm.issue.getRelIssueList(this.id, this.reltype, this.direction, this.app && this.app.id).then(res => {
        this.relIssueIdList = res.Return;
      });
    },
    selectIssue(issueList) {
      this.targetIssueList = issueList;
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    confirm() {
      const relIssueIdSet = new Set((this.relIssueIdList || []).map(id => id && id.toString()));
      const targetIssueList = (this.targetIssueList || []).filter(item => item && item.id && !relIssueIdSet.has(item.id.toString()));
      if (targetIssueList.length > 0) {
        const param = {
          direction: this.direction,
          relType: this.reltype,
          appId: this.app.id,
          id: this.id,
          idList: targetIssueList.map(d => d.id)
        };
        this.$api.rdm.issue.saveIssueRel(param).then(res => {
          if (res.Status == 'OK') {
            this.close(true);
          }
        });
      } else {
        this.close();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
