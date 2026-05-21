<template>
  <div>
    <TsFormItem :label="$t('page.layout')" labelPosition="top">
      <TsFormRadio
        v-model="config.layout"
        :dataList="layoutList"
        @on-change="val=>{
          setConfigValue('layout', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.yaxisshow') " labelPosition="top">
      <TsFormSwitch
        :value="config.yAxis ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            if (val) {
              setConfigValue('yAxis', {
                label: {
                  autoHide: true,
                  autoEllipsis: true
                },
                title: { text: '' }
              });
            } else {
              setConfigValue('yAxis', val);
            }
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="config.yAxis" :label="$t('term.report.axis.yaxistitle') " labelPosition="top">
      <TsFormInput
        :value="config.yAxis?.title?.text"
        border="border"
        @change="
          val => {
            setConfigValue('yAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.xaxisshow') " labelPosition="top">
      <TsFormSwitch
        :value="config.xAxis ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            if (val) {
              setConfigValue('xAxis', { title: { text: '' } });
            } else {
              setConfigValue('xAxis', val);
            }
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="config.xAxis" :label="$t('term.report.axis.xaxistitle') " labelPosition="top">
      <TsFormInput
        :value="config.xAxis?.title?.text"
        border="border"
        @change="
          val => {
            setConfigValue('xAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.customcolor') " labelPosition="top">
      <div class="pl-md pr-md">
        <div class="text-grey">{{ $t('page.background') }}</div>
        <ColorPicker
          :value="config.color?.range"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('color.range', val);
            }
          "
        />
        <div class="text-grey">{{ $t('term.dashboard.frontend') }}</div>
        <ColorPicker
          :value="config.color?.measure"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('color.measure', val);
            }
          "
        />
        <div class="text-grey">{{ $t('term.dashboard.target') }}</div>
        <ColorPicker
          :value="config.color?.target"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('color.target', val);
            }
          "
        />
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
      ],
      layoutList: [{value: 'horizontal', text: '水平'}, {value: 'vertical', text: '垂直'}]
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
