<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot:header>
      <div>{{ $t('term.codehub.confirmdelebranch') }}</div>
    </template>
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
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="error" :disabled="canSubmit" @click="saveDelete">{{ $t('page.confirm') }}</Button>
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
    isShow: {
      type: Boolean,
      default: false
    },
    uuid: { type: [String, Boolean] },
    repositoryId: { type: Number },
    branchName: { type: String }
  },
  data() {
    return {
      vaild: ['required'],
      setting: {
        title: this.$t('term.codehub.confirmdeletebranch'),
        maskClose: false
      },
      canSubmit: false,
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.branchname'),
          name: 'branchName',
          value: '',
          validateList: ['required']
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
        let param = Object.assign(this.$refs.editform.getFormValue(), {
          repositoryId: this.repositoryId
        });
        if (param.branchName != this.branchName) {
          this.$Message.error(this.$t('term.codehub.branchnotsame'));
          return;
        }
        this.canSubmit = true;
        this.$api.codehub.repositorydetail.deleteBranch(param).then((res) => {
          this.canSubmit = false;
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.deletesuccess'));
            this.$emit('close', true);
          } else {
            this.$Message.error(res.Message);
          }
        }).catch(error => {
          this.canSubmit = false;
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
