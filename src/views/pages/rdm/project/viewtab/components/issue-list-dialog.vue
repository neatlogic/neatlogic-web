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
    IssueList: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-list.vue'], resolve)
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
      this.$api.rdm.issue.getRelIssueList(this.id, this.reltype, this.direction).then(res => {
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
      if (this.targetIssueList.length > 0) {
        const param = {
          direction: this.direction,
          relType: this.reltype,
          appId: this.app.id,
          id: this.id,
          idList: this.targetIssueList.map(d => d.id)
        };
        this.$api.rdm.issue.saveIssueRel(param).then(res => {
          if (res.Status == 'OK') {
            this.close(true);
          }
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
