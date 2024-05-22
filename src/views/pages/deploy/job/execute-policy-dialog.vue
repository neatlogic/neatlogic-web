<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <TsForm v-model="policyData" v-bind="formConfig"></TsForm>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="confirm()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: {type: Number},
    action: {type: String, default: 'job'}
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.deploy.executivestrategy'),
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
            label: this.$t('term.deploy.automaticallyexecutesubsequentgroups'),
            vertical: true,
            isHidden: this.action != 'group',
            desc: this.$t('term.deploy.automaticalexecutegroupdesc'),
            value: 1,
            dataList: [
              { value: 1, text: this.$t('page.yes') },
              { value: 0, text: this.$t('page.no') }
            ]
          },
          batchJobAction: {
            type: 'radio',
            label: this.$t('term.deploy.batchjobexecutestrategy'),
            vertical: true,
            value: 'refireAll',
            dataList: [
              { value: 'refireAll', text: this.$t('term.deploy.skipallfinishedchildjob') },
              { value: 'refireResetAll', text: this.$t('term.deploy.executeallchildjob') }
            ]
          },
          jobAction: {
            type: 'radio',
            label: this.$t('term.deploy.childjobexecutestrategy'),
            vertical: true,
            value: 'refireAll',
            dataList: [
              { value: 'refireAll', text: this.$t('term.deploy.skipfinishedignorenode') },
              { value: 'refireResetAll', text: this.$t('term.deploy.executeallnode') }
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
            this.$Message.success(this.$t('message.executesuccess'));
            this.close(true);
          }
        });
      } else if (this.action === 'group') {
        this.$api.deploy.job.executeBatchDeployGroup(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.close(true);
          }
        });
      } else if (this.action === 'resumegroup') {
        this.$api.deploy.job.resumeGroup(this.policyData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
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
