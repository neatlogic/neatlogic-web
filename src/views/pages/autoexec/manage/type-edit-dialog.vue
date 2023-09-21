<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="close"
    >
      <template v-slot>
        <div class="type-main input-border">
          <Loading :loadingShow="loadingShow" type="fix"></Loading>
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formItemConfig"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: false,
      formValue: {
        name: '',
        description: '',
        authList: ['common#alluser'],
        reviewAuthList: ['common#alluser']
      },
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.id ? this.$t('dialog.title.edittarget', {target: this.$t('page.classify')}) : this.$t('page.classifytarget', {'target': this.$t('page.build')})
      },
      formItemConfig: {
        name: {
          type: 'text',
          name: 'name',
          maxlength: 50,
          width: '100%',
          label: this.$t('page.name'),
          validateList: [
            'required', 
            'name-special', 
            { name: 'searchUrl',
              url: 'api/rest/autoexec/type/save', 
              key: 'name',
              params: {
                id: this.id || ''
              },
              message: this.$t('message.targetisexists', {target: this.$t('page.name')})
            }
          ]
        },
        description: {
          type: 'textarea',
          name: 'description',
          width: '100%',
          maxlength: 500,
          label: this.$t('page.description')
        },
        authList: {
          label: this.$t('page.auth'),
          type: 'userselect',
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam')}], 
          multiple: true,
          transfer: true,
          groupList: ['user', 'team', 'role', 'common'],
          desc: this.$t('term.autoexec.hasauthinfo')
        },
        reviewAuthList: {
          label: this.$t('term.autoexec.auditauthorization'),
          type: 'userselect',
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam') }], 
          multiple: true,
          transfer: true,
          groupList: ['user', 'team', 'role', 'common'],
          desc: this.$t('term.autoexec.hasauthtip')
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getDataById();
    }
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
    getDataById() {
      this.loadingShow = true;
      this.$api.autoexec.action.getType({id: this.id}).then(res => {
        if (res.Status == 'OK') {
          let {name = '', description = '', authList = [], reviewAuthList = []} = res?.Return || {};
          this.formValue = {name, description, authList, reviewAuthList};
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    okDialog() {
      if (this.$refs?.form && !this.$refs.form.valid()) {
        return;
      }
      let data = {
        ...this.formValue,
        id: this.id
      };
      this.$api.autoexec.action.saveType(data).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', true);
        }
      });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
