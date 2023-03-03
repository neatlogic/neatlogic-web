<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="okDialog"
    @on-close="closeDialog"
  >
    <template v-slot>
      <TsForm
        v-model="formWidthData"
        :item-list="formConfig"
      ></TsForm>
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
    formWidth: Object
  },
  data() {
    return {
      dialogConfig: {
        title: '表单宽度',
        type: 'modal',
        isShow: true
      },
      formConfig: {
        type: {
          label: '布局方式',
          type: 'select',
          dataList: [
            { text: '固定比例', value: '%' },
            { text: '固定像素', value: 'px' },
            {text: '使用画布宽度', value: 'inherit'}
          ],
          validateList: ['required'],
          clearable: false,
          transfer: true,
          onChange: (val) => {
            this.changeType(val);
          }
        },
        width: {
          label: '宽度(%)',
          type: 'number',
          validateList: ['required']
        }
      },
      formWidthData: {
        type: '%',
        width: 100
      }
    };
  },
  beforeCreate() {},
  created() {
    this.init(); 
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
    init() {
      if (!this.$utils.isEmpty(this.formWidth)) {
        this.formWidthData = this.$utils.deepClone(this.formWidth);
      }
      if (this.formWidthData.type === '%') {
        this.formConfig.width.label = '宽度(%)';
        this.formConfig.width.max = 100;
      } else if (this.formWidthData.type === 'px') {
        this.formConfig.width.label = '宽度(px)';
        this.formConfig.width.max = Infinity;
      } else if (this.formWidthData.type === 'inherit') {
        this.formConfig.width.isHidden = true;
      }
    },
    okDialog() {
      this.$emit('close', this.formWidthData);
    },
    closeDialog() {
      this.$emit('close');
    },
    changeType(val) {
      this.formWidthData.type = val;
      if (val === '%') {
        this.formConfig.width.label = '宽度(%)';
        this.formConfig.width.max = 100;
        this.formWidthData.width = 100;
        this.formConfig.width.isHidden = false;
      } else if (val === 'px') {
        this.formConfig.width.label = '宽度(px)';
        this.formConfig.width.max = Infinity;
        this.formWidthData.width = 1000;
        this.formConfig.width.isHidden = false;
      } else if (val === 'inherit') {
        this.formConfig.width.isHidden = true;
        this.formWidthData.width = '';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less">
</style>
