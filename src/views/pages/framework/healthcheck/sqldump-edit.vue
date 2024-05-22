<template>
  <div>
    <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save()">
      <template v-slot>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {},
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.framework.settingsql'),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'radio',
          name: 'action',
          label: this.$t('page.action'),
          validateList: [{name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.action')})}],
          dataList: [
            { value: 'insert', text: this.$t('term.framework.addmonitor') },
            { value: 'remove', text: this.$t('term.framework.delmonitor') },
            { value: 'clear', text: this.$t('page.clearall') }
          ],
          desc: this.$t('message.framework.sqlactiondesc')
        },
        {
          type: 'text',
          name: 'id',
          label: 'sql id',
          validateList: ['required'],
          desc: this.$t('message.framework.sqliddesc')
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      const form = this.$refs['form'];
      if (form.valid()) {
        this.$api.framework.healthcheck.toggleSqlInterceptor(form.getFormValue()).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close();
          }
        });
      }
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
