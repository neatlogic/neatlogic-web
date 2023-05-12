<template>
  <div>
    <TsDialog
      :title="$t('term.inspect.sendanemail')"
      type="modal"
      :isShow.sync="isShowDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <TsForm
          ref="form"
          v-model="formValue"
          :item-list="formConfig"
        ></TsForm>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 发送邮件
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      isShowDialog: true,
      formValue: {
        receiverList: [],
        title: this.$t('term.inspect.latestproblemofinspectiontarget', {target: this.$utils.getCurrenttime('yyyyMMddHHmmss')})
      },
      formConfig: {
        receiverList: {
          label: this.$t('page.recipient'),
          type: 'userselect',
          transfer: true,
          multiple: true,
          groupList: ['user', 'role', 'team'],
          validateList: ['required'],
          desc: this.$t('term.inspect.sendmaillimitdesc')
        },
        title: {
          label: this.$t('page.emailtitle'),
          type: 'textarea',
          maxlength: 256,
          validateList: ['required']
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
    okDialog() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      let params = {
        ...this.formValue,
        ...this.params
      };
      this.$api.inspect.assetsInspect.sendEmail(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.closeDialog();
        }
      });
    },
    closeDialog() {
      this.formValue = {};
      this.$emit('closeSendEmailDialog');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
