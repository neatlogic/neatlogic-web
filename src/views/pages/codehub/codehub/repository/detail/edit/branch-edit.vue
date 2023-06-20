<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
        </TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: 'BranchEdit',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  props: {
    repositoryId: {type: Number}
  },
  data() {
    return {
      setting: {
        title: this.$t('term.codehub.addbranch'),
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
        }, 
        {
          type: 'select',
          label: this.$t('page.sourcebranch'),
          transfer: true,
          value: '',
          name: 'startBranchName',
          validateList: ['required'],
          clearable: false,
          multiple: false,
          textName: 'name',
          valueName: 'name',
          url: '/api/rest/codehub/repository/branch/search',
          rootName: 'list',
          params: {
            repositoryId: this.repositoryId
          }
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
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = {
          ...this.$refs.editform.getFormValue(),
          repositoryId: this.repositoryId
        };
        this.$api.codehub.repositorydetail.saveBranch(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
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
