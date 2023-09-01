<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      formValue: {},
      dialogSetting: {
        title: this.$t('dialog.title.addtarget', {'target': this.$t('page.user')}),
        type: 'modal',
        isShow: true
      },
      formConfig: {
        id: {
          type: 'text',
          label: '输入框组件',
          isHidden: true,
          maxlength: 50,
          validateList: ['required']
        },
        userIdList: {
          type: 'select',
          label: '用户',
          transfer: true,
          multiple: true,
          dynamicUrl: '/api/rest/user/search',
          validateList: ['required'],
          rootName: 'tbodyList',
          valueName: 'id',
          textName: 'name'
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
      console.log('拿到的值', this.formValue);
      if (!this.$refs.form?.valid()) {
        return false;
      }
      // this.$api.dr.organizationalStructure.saveUserInfo(this.formValue).then(res => {
      //   if (res.Status == 'OK') {
      //    this.$emit('close', true);
      //   }
      // });
    },
    closeDialog() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
