<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot:header>
      <div>确认删除分支</div>
    </template>
    <template v-slot>
      <div>
        此动作会导致数据丢失。为防止有意外操作，所以要求额外的操作来确认你的实际意图。请输入分支名 <span class="text-danger">{{ branchName }}</span>
        继续操作或关闭本对话框取消操作。
        <Divider plain style="font-size:12px" />
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
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
    repositoryUuid: { type: String },
    branchName: { type: String }
  },
  data() {
    let _this = this;
    return {
      vaild: ['required'],
      setting: {
        title: '确认删除分支',
        maskClose: false
      },
      canSubmit: false,
      editData: {
        repositoryUuid: _this.repositoryUuid,
        branchName: ''
      },
      formConfig: [
        {
          type: 'text',
          label: '分支名',
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
          repositoryUuid: this.repositoryUuid
        });
        if (param.branchName != this.branchName) {
          this.$Message.error('分支名称不匹配');
          return;
        }
        let _this = this;
        this.canSubmit = true;
        _this.$api.codehub.repositorydetail.deleteBranch(param).then((res) => {
          this.canSubmit = false;
          if (res && res.Status == 'OK') {
            _this.$Message.success('删除成功');
            this.$emit('close', true);
          } else {
            _this.$Message.error(res.Message);
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
