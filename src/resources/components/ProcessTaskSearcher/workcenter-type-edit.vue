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
          desc: '作为左侧菜单显示时的分类名称，不设置则归类到默认分类：工单中心'
        },
        type: {
          type: 'radio',
          label: this.$t('page.type'),
          dataList: [
            {
              text: '个人分类',
              value: 'custom'
            },
            {
              text: '系统分类',
              value: 'system'
            }
          ],
          validateList: [{ name: 'required', message: '请选择类型' }],
          onChange: (val) => {
            if (val == 'system') {
              this.formConfig.authList.isHidden = false;
            } else {
              this.formConfig.authList.isHidden = true;
            }
          }
        },
        support: {
          type: 'select',
          label: '使用范围',
          transfer: true,
          defaultValueIsFirst: true,
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'neatlogic.framework.common.constvalue.DeviceType' }
        },       
        authList: { 
          type: 'userselect',
          isMultiple: true,
          isHidden: true,
          label: this.$t('page.auth'),
          transfer: true,
          validateList: [{ name: 'required', message: '请授权给用户、分组或角色' }], 
          groupList: ['user', 'role', 'common']
        },
        isShowTotal: {
          type: 'switch',
          label: '显示总数',
          trueValue: 1,
          falseValue: 0,
          desc: '左侧工单分类是否显示总数,默认为否,显示待办数'
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
