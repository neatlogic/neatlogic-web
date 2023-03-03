<template>
  <div>
    <TsDialog
      title="发送邮件"
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
    let _this = this;
    return {
      isShowDialog: true,
      formValue: {
        receiverList: [],
        title: `巡检最新问题${_this.$utils.getCurrenttime('yyyyMMddHHmmss')}`
      },
      formConfig: {
        receiverList: {
          label: '收件人',
          type: 'userselect',
          transfer: true,
          multiple: true,
          groupList: ['user', 'role', 'team'],
          validateList: ['required'],
          desc: '单次最多给100人发送邮件，超出100的部分不发送邮件'
        },
        title: {
          label: '邮件标题',
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
          this.$Message.success('发送邮件成功');
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
