<template>
  <div v-if="projectData">
    <div v-if="$AuthUtils.hasRole('PROJECT_TEMPLATE_MANAGE')">
      <Button type="primary" @click="isTemplateShow = true">{{ $t('term.rdm.saveastemplate') }}</Button>
      <div class="text-grey mt-md">{{ $t('term.rdm.saveprojectastemplate') }}</div>
      <Divider></Divider>
    </div>
    <div v-if="!projectData.isClose && (projectData.isOwner || projectData.isLeader)">
      <Button type="warning" @click="closeProject">{{ $t('term.rdm.endproject') }}</Button>
      <div class="text-grey mt-md">{{ $t('term.rdm.closeprojectdesc') }}</div>
      <Divider></Divider>
    </div>
    <div v-if="projectData.isClose && $AuthUtils.hasRole('PROJECT_MANAGE')">
      <Button type="warning" ghost @click="openProject">{{ $t('term.rdm.openproject') }}</Button>
      <Divider></Divider>
    </div>
    <div v-if="projectData.isOwner || $AuthUtils.hasRole('PROJECT_MANAGE')">
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
      templateName: '',
      projectData: null
    };
  },
  beforeCreate() {},
  created() {
    this.getProjectById();
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
    getProjectById() {
      if (this.projectId) {
        this.$api.rdm.project.getProjectById(this.projectId).then(res => {
          this.projectData = res.Return;
        });
      }
    },
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
    closeProject() {
      if (this.projectId) {
        this.$createDialog({
          title: this.$t('dialog.title.closecomfirm'),
          content: this.$t('dialog.content.closecomfirm', { target: this.$t('term.rdm.project') }),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.rdm.project.closeProjectById(this.projectId).then(res => {
              if (res.Status === 'OK') {
                // 刷新左侧菜单
                this.$store.commit('leftMenu/setRdmProjectCount', 'minus');
                vnode.isShow = false;
                this.$router.push({ path: '/' });
              }
            });
          }
        });
      }
    },
    openProject() {
      if (this.projectId) {
        this.$createDialog({
          title: this.$t('dialog.title.openconfirm'),
          content: this.$t('dialog.content.opencomfirm', { target: this.$t('term.rdm.project') }),
          btnType: 'error',
          'on-ok': vnode => {
            this.$api.rdm.project.openProjectById(this.projectId).then(res => {
              if (res.Status === 'OK') {
                // 刷新左侧菜单
                this.$store.commit('leftMenu/setRdmProjectCount', 'minus');
                vnode.isShow = false;
                this.$router.push({ path: '/' });
              }
            });
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
                this.$router.push({ path: '/' });
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
