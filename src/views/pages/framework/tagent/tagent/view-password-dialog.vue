<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="close"
    >
      <template v-slot>
        <TsFormInput v-model="passwordValue" :disabled="true">
        </TsFormInput>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '', // 查看密码
  components: {
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    accountId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      passwordValue: '',
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.viewtarget', {'target': this.$t('page.password')}),
        hasFooter: false
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getPasswordById();
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
    getPasswordById() {
      if (this.$utils.isEmpty(this.accountId)) {
        return false;
      }
      this.$api.framework.tagent.getAccountById({id: this.accountId})
        .then((res) => {
          if (res && res.Status == 'OK') {
            this.passwordValue = res.Return.passwordPlain;
          }
        });
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
<style lang="less">
</style>
