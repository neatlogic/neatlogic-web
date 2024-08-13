<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.percentmode')" labelPosition="top">
      <TsFormSwitch
        :value="config.isPercent ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('isPercent', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.showlegend')" labelPosition="top">
      <TsFormSwitch
        :value="config.legend.visible"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('legend.visible', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.legendposition')" labelPosition="top">
      <TsFormSelect
        :value="config.legend.position"
        :transfer="true"
        :clearable="false"
        :dataList="positionList"
        border="border"
        @change="
          val => {
            setConfigValue('legend.position', val);
          }
        "
      ></TsFormSelect>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.showdata')" labelPosition="top">
      <TsFormSwitch
        :value="config.label ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            if (val) {
              setConfigValue('label', {
                position: 'middle',
                content: item => {
                  return item.xField && Math.floor(item.xField * 100) / 100;
                }
              });
            } else {
              deleteConfigValue('label');
            }
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.columnwidth')" labelPosition="top">
      <Slider
        :value="config.columnWidthRatio"
        :min="0.1"
        :max="0.9"
        :step="0.1"
        show-tip="never"
        @on-change="
          val => {
            setConfigValue('columnWidthRatio', val);
          }
        "
      ></Slider>
    </TsFormItem>
    <TsFormItem label="辅助线" labelPosition="top">
      <TsFormSwitch
        :value="!config.xAxis?true:typeof config.xAxis === 'boolean' ? true : config.xAxis.grid?config.xAxis.grid.visible:true"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('xAxis.grid.visible', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: { config: { type: Object } },
  data() {
    return {
      positionList: [
        { value: 'top-left', text: this.$t('term.report.positions.topleft') },
        { value: 'top', text: this.$t('term.report.positions.top') },
        { value: 'top-right', text: this.$t('term.report.positions.topright') },
        { value: 'bottom-left', text: this.$t('term.report.positions.bottomleft') },
        { value: 'bottom', text: this.$t('term.report.positions.bottom') },
        { value: 'bottom-right', text: this.$t('term.report.positions.bottomright') },
        { value: 'left-top', text: this.$t('term.report.positions.lefttop') },
        { value: 'left', text: this.$t('term.report.positions.left') },
        { value: 'left-bottom', text: this.$t('term.report.positions.leftbottom') },
        { value: 'right-top', text: this.$t('term.report.positions.righttop') },
        { value: 'right', text: this.$t('term.report.positions.right') },
        { value: 'right-bottom', text: this.$t('term.report.positions.rightbottom') }
      ],
      labelTypeList: [
        { value: 'inner', text: this.$t('term.report.positions.inner') },
        { value: 'outer', text: this.$t('term.report.positions.outer') }
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
    setConfigValue(attrName, attrValue) {
      if (attrName) {
        this.$emit('setConfig', attrName, attrValue);
      }
    },
    deleteConfigValue(attrName) {
      if (attrName) {
        this.$emit('setConfig', attrName);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
