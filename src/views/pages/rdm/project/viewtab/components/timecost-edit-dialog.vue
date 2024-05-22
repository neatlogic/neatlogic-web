<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close">
    <template v-slot>
      <div>
        <TsFormItem :label="$t('term.rdm.plantimecost')">
          {{ issueData.timecost || '-' }}
        </TsFormItem>
        <TsForm ref="form" v-model="issueCostData" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    id: { type: Number },
    issueData: { type: Object }
  },
  data() {
    return {
      issueCostData: { issueId: this.issueData.id },
      formConfig: [
        {
          type: 'date',
          name: 'costDate',
          label: this.$t('term.rdm.costdate'),
          transfer: true,
          validateList: ['required']
        },
        {
          type: 'number',
          name: 'timecost',
          label: this.$t('term.rdm.costtime'),
          validateList: ['required']
        },
        {
          type: 'textarea',
          name: 'description',
          label: this.$t('page.description')
        }
      ],
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('term.rdm.cost') }) : this.$t('dialog.title.addtarget', { target: this.$t('term.rdm.cost') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getIssueCost();
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
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.rdm.issuecost.saveIssueCost(this.issueCostData).then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
          }
        });
      }
    },
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    getIssueCost() {
      if (this.id) {
        this.$api.rdm.issuecost.getIssueCostById(this.id).then(res => {
          this.issueCostData = res.Return;
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
