<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()" @on-ok="save()">
    <template v-slot>
      <div>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: { issueData: { type: Object } },
  data() {
    return {
      issueDataLocal: this.$utils.deepClone(this.issueData),
      formConfig: [
        {
          type: 'daterange',
          name: 'daterange',
          label: this.$t('page.plantime'),
          format: 'yyyy-MM-dd',
          validateList: ['required'],
          transfer: true,
          onChange: val => {
            this.$set(this.issueDataLocal, 'startDate', val[0]);
            this.$set(this.issueDataLocal, 'endDate', val[1]);
          }
        },
        {
          type: 'number',
          name: 'timecost',
          min: 0,
          step: 1,
          label: this.$t('term.rdm.plantimecost'),
          validateList: ['required'],
          onChange: val => {
            this.$set(this.issueDataLocal, 'timecost', val);
          }
        }
      ],
      dialogConfig: {
        type: 'modal',
        title: this.$t('term.rdm.editstartenddate'),
        width: 'small',
        maskClose: false,
        isShow: true
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
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.$api.rdm.issue.saveIssue(this.issueDataLocal).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
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
<style lang="less" scoped></style>
