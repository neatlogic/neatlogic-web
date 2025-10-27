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
            v-model="formData"
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
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {},
  data() {
    return {
      formData: {
        name: '',
        url: ''
      },
      dialogSetting: {
        isShow: true,
        title: '设置超链接',
        type: 'modal',
        width: 'small'
      },
      formConfig: {
        name: {
          type: 'text',
          label: '文本'
        },
        url: {
          type: 'text',
          label: '链接',
          validateList: ['url', 'required']
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
      if (!this.valid()) {
        return false;
      }
      this.$emit('close', {menuName: 'link', hrefName: this.formData.name || this.formData.url, hrefUrl: this.formData.url});
    },
    closeDialog() {
      this.$emit('close');
    },
    valid() {
      let form = this.$refs.form;
      if (form && !form.valid()) {
        return false;
      }
      return true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
