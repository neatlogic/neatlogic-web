<template>
  <TsDialog v-bind="dialogConfig" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="form" v-model="data" :item-list="formConfig"></TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">取消</Button>
      <Button type="primary" @click="save()">确定</Button>
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
        title: '新建分类',
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'small'
      },
      formConfig: {
        name: {
          type: 'text',
          label: '名称',
          maxlength: 50,
          validateList: [{ name: 'required', message: '请输入名称' }]
        },
        catalogName: {
          type: 'text',
          label: '菜单分类',
          maxlength: 50,
          desc: '作为左侧菜单显示时的分类名称，不设置则归类到默认分类：工单中心'
        },
        type: {
          type: 'radio',
          label: '类型',
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
          label: '授权', 
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
