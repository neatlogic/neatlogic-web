<template>
  <TsDialog
    :isShow="true"
    :title="$t('dialog.title.addtarget', {target: $t('term.knowledge.intellectualcircle')})"
    @on-ok="addCircle"
    @on-close="close"
  >
    <Tsform ref="form" :itemList="formItemConfig"></Tsform>
  </TsDialog>
</template>
<script>
export default {
  name: 'CircleAddDialog',
  components: {
    Tsform: () => import('@/resources/plugins/TsForm/TsForm.vue')
  },
  data() {
    return {
      formItemConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          width: '100%',
          maxlength: 50,
          validateList: [
            'required',
            'name-special',
            {
              name: 'searchUrl',
              url: 'api/rest/knowledge/circle/save'
            }
          ]
        }
      }
    };
  },
  methods: {
    addCircle() {
      if (!this.$refs.form.valid()) {
        return;
      }
      const formData = this.$refs.form.getFormValue();
      this.close();
      this.$router.push({
        name: 'circle-edit',
        query: {
          operation: 'add',
          ...formData
        }
      });
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>
