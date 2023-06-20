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
    repositoryId: {type: Number},
    isEdit: { // 是否是编辑标签
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vaild: ['required'],
      setting: {
        title: this.isEdit ? this.$t('term.codehub.edittag') : this.$t('term.codehub.addtag'),
        maskClose: false,
        isShow: true
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('term.codehub.tagname'),
          name: 'tagName',
          value: '',
          validateList: [
            'required',
            { name: 'searchUrl',
              url: '/api/rest/codehub/repository/tag/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('term.codehub.tagname')}),
              params: { repositoryId: this.repositoryId}
            }],
          maxlength: 50
        }, {
          type: 'select',
          label: this.$t('page.branch'),
          transfer: true,
          value: '',
          name: 'branchName',
          validateList: ['required'],
          clearable: false,
          multiple: false,
          textName: 'name',
          valueName: 'name',
          rootName: 'list',
          url: '/api/rest/codehub/repository/branch/search',
          params: {
            repositoryId: this.repositoryId,
            hasCommit: 1
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
        let param = Object.assign(this.$refs.editform.getFormValue(), {
          repositoryId: this.repositoryId
        });
        if (!param.description) {
          this.$delete(param, 'description');
        }
        this.$api.codehub.repositorydetail.saveTag(param).then(res => {
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
