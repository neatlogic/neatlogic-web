<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()" @on-ok="save()">
    <template v-slot>
      <div>
        <TsForm ref="form" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  props: {
    mode: { type: String, default: 'save' }, //保存模式，save马上保存，emit把数据通过@save往外送
    projectId: { type: Number }
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
          },
          onChange: (val, opt) => {
            this.projectUserData.userType = opt.value;
            this.projectUserData.userTypeName = opt.text;
          }
        },
        {
          type: 'userselect',
          name: 'userIdList',
          validateList: ['required'],
          groupList: ['user'],
          multiple: true,
          transfer: true,
          label: this.$t('page.user'),
          onChange: val => {
            this.projectUserData.userIdList = val;
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
    close(needRefresh) {
      this.$emit('close', needRefresh);
    },
    save() {
      const form = this.$refs['form'];
      if (form && form.valid()) {
        this.projectUserData.projectId = this.projectId;
        if (this.mode === 'save') {
          this.$api.rdm.project.saveProjectUser(this.projectUserData).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
              this.close(true);
            }
          });
        } else {
          this.$emit('save', this.projectUserData.userType, this.projectUserData.userTypeName, this.projectUserData.userIdList);
          this.$emit('close');
        }
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
