<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close">
      <template v-slot>
        <div>
          <NodeDetail
            :jobData="jobData"
            :phaseData="phaseData"
            :nodeData="nodeData"
            mode="dialog"
          ></NodeDetail>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    NodeDetail: resolve => require(['./phase/node/node-detail.vue'], resolve)
  },
  filters: {},
  directives: {},
  props: {
    jobData: {type: Object}, //作业信息
    phaseData: {type: Object}, //阶段信息
    nodeData: {type: Object, default: () => {}}, //节点信息
    runnerData: {type: Object, default: () => {}}, //执行器信息
    nodeTitle: {
      type: String,
      default() {
        return this.$t('term.autoexec.nodedetail');
      }
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'slider',
        isShow: true,
        width: 'large',
        title: this.nodeTitle,
        hasFooter: false,
        maskClose: true
      },
      redoType: 'refireAll', //重跑类型：refireResetAll、refireAll
      dataList: [
        {
          text: this.$t('term.autoexec.skipallsuccessignorenode'),
          value: 'refireAll'
        },
        {
          text: this.$t('term.autoexec.rerunallnode'),
          value: 'refireResetAll'
        }
      ]
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      this.$api.autoexec.job
        .reFireJob({
          jobId: this.id,
          type: this.redoType
        })
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.close(true);
          }
        })
        .finally(() => {
          this.dialogConfig.loading = false;
        });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
