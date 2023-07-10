<template>
  <div>
    <div v-if="$AuthUtils.hasRole('PROJECT_TEMPLATE_MANAGE')">
      <Button type="primary" @click="isTemplateShow = true">{{ $t('term.rdm.saveastemplate') }}</Button>
      <div class="text-grey mt-md">{{ $t('term.rdm.saveprojectastemplate') }}</div>
      <Divider></Divider>
    </div>
    <div>
      <Button type="error" @click="deleteProject">{{ $t('dialog.title.deletetarget', { target: $t('term.rdm.project') }) }}</Button>
      <div class="text-grey mt-md">{{ $t('term.rdm.deleteprojectdesc') }}</div>
    </div>
    <TsDialog
      v-if="isTemplateShow"
      v-bind="templateDialogConfig"
      @on-ok="saveTemplate()"
      @on-close="isTemplateShow = false"
    >
      <template v-slot>
        <div>
          <TsFormItem :label="$t('page.templatename')" :required="true">
            <TsFormInput
              ref="formTemplateName"
              v-model="templateName"
              :validateList="['required']"
              border="border"
              :maxlength="50"
            ></TsFormInput>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: { projectId: { type: Number } },
  data() {
    return {
      templateDialogConfig: {
        title: this.$t('term.rdm.templatesetting'),
        isShow: true,
        width: 'small'
      },
      isTemplateShow: false,
      templateName: ''
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
    saveTemplate() {
      const formTemplateName = this.$refs['formTemplateName'];
      if (formTemplateName.valid()) {
        this.$api.rdm.projecttemplate
          .saveTemplateFromProject({
            projectId: this.projectId,
            templateName: this.templateName
          })
          .then(res => {
            if (res.Status === 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.isTemplateShow = false;
            }
          });
      }
    },
    deleteProject() {
      if (this.projectId) {
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('term.rdm.deletecurrentprojectdesc'),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.rdm.project.deleteProjectById(this.projectId).then(res => {
              if (res.Status === 'OK') {
                // 刷新左侧菜单
                this.$store.commit('leftMenu/setRdmProjectCount', 'minus');
                vnode.isShow = false;
                this.$emit('close');
              }
            });
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
<style lang="less"></style>
