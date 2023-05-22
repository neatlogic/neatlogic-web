<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-close="close"
    @on-ok="save"
  >
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="data" :item-list="formConfig"></TsForm>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {},
  data() {
    return {
      data: {},
      dialogConfig: {
        title: this.$t('dialog.title.addtarget', {target: this.$t('page.classify')}),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.name') }]
        },
        catalogName: {
          type: 'text',
          label: this.$t('page.classifytarget', {target: this.$t('page.menu')}),
          maxlength: 50,
          desc: this.$t('term.process.workordercentertypedes')
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          dataList: [
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.personal')}),
              value: 'custom'
            },
            {
              text: this.$t('page.classifytarget', {target: this.$t('page.system')}),
              value: 'system'
            }
          ],
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.type')}) }],
          onChange: (val) => {
            if (val == 'system') {
              this.formConfig.support.isHidden = false; // 个人分类时，隐藏使用范围
              this.formConfig.authList.isHidden = false;
            } else {
              this.formConfig.support.isHidden = true;
              this.formConfig.authList.isHidden = true;
            }
          }
        },
        support: {
          type: 'select',
          label: this.$t('page.limituser'),
          transfer: true,
          defaultValueIsFirst: true,
          isHidden: true,
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.common.constvalue.DeviceType' }
        },       
        authList: { 
          type: 'userselect',
          isMultiple: true,
          isHidden: true,
          label: this.$t('page.auth'),
          transfer: true,
          validateList: [{ name: 'required', message: this.$t('page.authuserroleteam') }], 
          groupList: ['user', 'role', 'common']
        },
        isShowTotal: {
          type: 'switch',
          label: this.$t('page.showtotal'),
          trueValue: 1,
          falseValue: 0,
          desc: this.$t('term.process.workordertypenumdes')
        }
      }
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
    save() {
      if (this.$refs['form'].valid()) {
        this.$emit('save', this.data);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
