<template>
  <TsDialog
    v-bind="dialogConfig"
    @on-ok="okDialog"
    @on-close="closeDialog"
  >
    <template v-slot>
      <TsForm
        v-model="formStyleData"
        :item-list="formConfig"
      ></TsForm>
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
    formWidth: Object
  },
  data() {
    return {
      dialogConfig: {
        title: this.$t('term.framework.formwidth'),
        type: 'modal',
        isShow: true
      },
      formConfig: {
        type: {
          label: this.$t('term.framework.layoutmethod'),
          type: 'select',
          dataList: [
            { text: this.$t('term.framework.fixedratio'), value: '%' },
            { text: this.$t('term.framework.fixedpixels'), value: 'px' },
            {text: this.$t('term.framework.canvaswidth'), value: 'inherit'}
          ],
          validateList: ['required'],
          clearable: false,
          transfer: true,
          onChange: (val) => {
            this.changeType(val);
          }
        },
        width: {
          label: this.$t('page.width') + '(%)',
          type: 'number',
          validateList: ['required']
        },
        cellSpacing: {
          label: this.$t('page.cellspacing'),
          type: 'number',
          max: 50
        }
      },
      formStyleData: {
        type: '%',
        width: 100,
        cellSpacing: 0
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
        this.formStyleData = this.$utils.deepClone(this.formWidth);
      }
      if (this.formStyleData.type === '%') {
        this.formConfig.width.label = this.$t('page.width') + '(%)';
        this.formConfig.width.max = 100;
      } else if (this.formStyleData.type === 'px') {
        this.formConfig.width.label = this.$t('page.width') + '(px)';
        this.formConfig.width.max = Infinity;
      } else if (this.formStyleData.type === 'inherit') {
        this.formConfig.width.isHidden = true;
      }
      if (!this.formStyleData.hasOwnProperty('cellSpacing')) {
        this.formStyleData.cellSpacing = 0;
      }
    },
    okDialog() {
      this.$emit('close', this.formStyleData);
    },
    closeDialog() {
      this.$emit('close');
    },
    changeType(val) {
      this.formStyleData.type = val;
      if (val === '%') {
        this.formConfig.width.label = this.$t('page.width') + '(%)';
        this.formConfig.width.max = 100;
        this.formStyleData.width = 100;
        this.formConfig.width.isHidden = false;
      } else if (val === 'px') {
        this.formConfig.width.label = this.$t('page.width') + '(px)';
        this.formConfig.width.max = Infinity;
        this.formStyleData.width = 1000;
        this.formConfig.width.isHidden = false;
      } else if (val === 'inherit') {
        this.formConfig.width.isHidden = true;
        this.formStyleData.width = '';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
