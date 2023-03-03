<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm v-model="policyData" v-bind="formConfig"></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="confirm()">确定</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {type: Number},
    action: {type: String, default: 'job'}
  },
  data() {
    return {
      dialogConfig: {
        title: '执行策略',
        width: 'small',
        type: 'modal',
        maskClose: false,
        isShow: true
      },
      policyData: {
        id: this.id,
        isGoon: 1,
        batchJobAction: 'refireAll',
        jobAction: 'refireAll'
      },
      formConfig: {
        itemList: {
          isGoon: {
            type: 'radio',
            label: '自动执行后续组',
            vertical: true,
            isHidden: this.action != 'group',
            desc: '当前组下的所有作业执行完毕后，是否自动执行后续组',
            value: 1,
            dataList: [
              { value: 1, text: '是' },
              { value: 0, text: '否' }
            ]
          },
          batchJobAction: {
            type: 'radio',
            label: '批量作业执行策略',
            vertical: true,
            value: 'refireAll',
            dataList: [
              { value: 'refireAll', text: '跳过所有已完成的子作业' },
              { value: 'refireResetAll', text: '执行所有子作业' }
            ]
          },
          jobAction: {
            type: 'radio',
            label: '子作业执行策略',
            vertical: true,
            value: 'refireAll',
            dataList: [
              { value: 'refireAll', text: '跳过所有已完成、已忽略的节点' },
              { value: 'refireResetAll', text: '执行所有节点' }
            ]
          }
        }
      }
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
    confirm() {
      if (this.action === 'job') {
        this.$api.deploy.job.executeBatchDeployJob(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success('执行成功');
            this.close(true);
          }
        });
      } else if (this.action === 'group') {
        this.$api.deploy.job.executeBatchDeployGroup(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success('执行成功');
            this.close(true);
          }
        });
      } else if (this.action === 'resumegroup') {
        this.$api.deploy.job.resumeGroup(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success('执行成功');
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
