<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="saveDelete">
    <template v-slot>
      <div>
        <div 
          v-html="$t('term.codehub.confirmactiondatamessage', {target: branchName}) "
        >
        </div>
        <Divider plain style="font-size:12px" />
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'BranchDelete',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    repositoryId: { type: Number },
    branchName: { type: String }
  },
  data() {
    return {
      setting: {
        title: this.$t('term.codehub.confirmdeletebranch'),
        maskClose: false,
        isShow: true
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.branchname'),
          name: 'branchName',
          value: '',
          validateList: ['required'],
          maxlength: 50
        }
      ]
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
    close() {
      this.$emit('close');
    },
    saveDelete() {
      if (this.$refs.editform.valid()) {
        let param = {
          ...this.$refs.editform.getFormValue(),
          repositoryId: this.repositoryId
        };
        if (param.branchName != this.branchName) {
          this.$Message.error(this.$t('term.codehub.branchnotsame'));
          return;
        }
        this.$api.codehub.repositorydetail.deleteBranch(param).then((res) => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.$emit('close', true);
          } else {
            this.$Message.error(res.Message);
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
<style lang="less" scoped>
</style>
