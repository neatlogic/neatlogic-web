<template>
  <TsDialog v-bind="dialogConfig" @close="close">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="projectUserData" :item-list="formConfig"></TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.cancel') }}</Button>
      <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    projectId: {type: Number}
  },
  data() {
    return {
      projectUserData: {},
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', { target: this.$t('term.rdm.projectmember') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: [
        {
          type: 'radio',
          name: 'userType',
          validateList: ['required'],
          label: this.$t('page.role'),
          url: '/api/rest/universal/enum/get',
          params: {
            enumClass: 'ProjectUserType'
          }
        },
        {
          type: 'userselect',
          name: 'userIdList',
          validateList: ['required'],
          groupList: ['user'],
          multiple: true,
          transfer: true,
          label: this.$t('page.user')
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.projectUserData.projectId = this.projectId;
        this.$api.rdm.project.saveProjectUser(this.projectUserData).then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
            this.close(true);
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
<style lang="less" scoped></style>
