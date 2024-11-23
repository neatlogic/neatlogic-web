<template>
  <TsDialog v-bind="dialogConfig" @on-ok="save()" @on-close="close()">
    <template v-slot>
      <TsForm v-model="alertTypeData" :item-list="formConfig"></TsForm>
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
    id: { type: Number }
  },
  data() {
    return {
      dialogConfig: {
        title: this.id ? this.$t('dialog.title.edittarget', { target: this.$t('term.alert.alerttype') }) : this.$t('dialog.title.addtarget', { target: this.$t('term.alert.alerttype') }),
        type: 'modal',
        maskClose: false,
        isShow: true,
        width: 'medium'
      },
      alertTypeData: { isActive: 1 },
      formConfig: {
        name: {
          label: '唯一标识',
          type: 'text',
          maxlength: 50,
          validateList: ['required']
        },
        label: {
          label: '名称',
          type: 'text',
          maxlength: 50,
          validateList: ['required']
        },
        isActive: {
          label: '是否激活',
          type: 'switch',
          trueValue: 1,
          falseValue: 0
        },
        content: {
          label: '转换代码',
          type: 'codemirror',
          codeMode: 'java',
          desc: '编写java代码，转换告警数据为指定格式',
          placeholder: 'public String convert(String input){\nreturn "converted:" + input;\n}'
        }
      }
    };
  },
  beforeCreate() {},
  created() {
    this.getAlertTypeById();
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
    getAlertTypeById() {
      if (this.id) {
        this.$api.alert.alerttype.getAlertTypeById(this.id).then(res => {
          this.alertTypeData = res.Return;
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
