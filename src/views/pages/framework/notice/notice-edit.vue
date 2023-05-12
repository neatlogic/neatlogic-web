<template>
  <TsDialog 
    className="notice-edit"
    type="modal"
    :isShow="isShow"
    width="medium"
    :title="notice.id ? $t('dialog.title.edittarget',{'target':$t('page.announcement')}) : $t('dialog.title.addtarget',{'target':$t('page.announcement')})"
    :okBtnDisable="isSaving"
    @on-close="$emit('update:isShow', false)"
    @on-ok="save"
  >
    <div>
      <TsForm ref="form" :itemList="formConfig" />
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: 'NoticeEdit',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    isShow: { type: Boolean, default: false },
    notice: {type: Object, default: () => {}}
  },
  data() {
    return {
      isSaving: false,
      formConfig: {
        title: {
          type: 'text',
          label: this.$t('page.title'),
          value: '',
          maxlength: 50,
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/systemnotice/save', 
              key: 'title',
              params: () => ({id: this.notice.id || null})
            }
          ]
        },
        content: {
          type: 'ckeditor',
          label: this.$t('page.content'),
          value: '',
          validateList: ['required']
        },
        recipientList: {
          type: 'userselect',
          label: this.$t('page.notifyobj'),
          value: [],
          groupList: ['user', 'team', 'role'],
          validateList: ['required'],
          transfer: true
        }
      }
    };
  },
  methods: {
    async save() {
      const formRef = this.$refs.form;
      if (!formRef.valid()) return;
      const formValue = formRef.getFormValue();
      const params = {...formValue, id: this.notice.id};
      this.isSaving = true;
      try {
        await this.$api.framework.notice.save(params);
        this.$Message.success(this.$t('message.savesuccess'));
        this.$emit('on-save');
        this.$emit('update:isShow', false);
      } finally {
        this.isSaving = false;
      }
    }
  },
  watch: {
    async isShow(visible) {
      if (visible) {
        for (let formItem in this.formConfig) {
          this.formConfig[formItem].value = this.notice[formItem];
        }
        if (!this.notice.id) return;
        const res = await this.$api.framework.notice.get(this.notice.id);
        for (let formItem in this.formConfig) {
          this.formConfig[formItem].value = res.Return[formItem];
        }
      } else {
        this.$refs.form && this.$refs.form.resetForm();
        this.$emit('update:notice', {});
      }
    }
  }
};
</script>
<style lang="less">
</style>
