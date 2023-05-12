<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.innerradius') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.innerRadius"
            :min="0"
            :max="0.9"
            :step="0.1"
            show-tip="never"
            @on-change="val => {
              setConfigValue('innerRadius', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.showlegend') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.legend.visible"
          :true-value="true"
          :false-value="false"
          @change="val => {
            setConfigValue('legend.visible', val);
          }"
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.legend.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.legendlayout') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="config.legend.layout"
          :dataList="layoutList"
          @change="val => {
            setConfigValue('legend.layout', val);
          }"
        ></TsFormRadio>
      </div>
    </div>
    <div v-if="config.legend.visible" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.legendposition') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.legend.position"
          :transfer="true"
          :clearable="false"
          :dataList="positionList"
          @change="val => {
            setConfigValue('legend.position', val);
          }"
        ></TsFormSelect>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.datalayout') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="config.label.type"
          :dataList="labelTypeList"
          @change="val => {
            setConfigValue('label.type', val);
          }"
        ></TsFormRadio>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.statisticfontsize') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.statistic.content.style.fontSize"
            :min="12"
            :max="50"
            :step="1"
            show-tip="never"
            @on-change="val => {
              setConfigValue('statistic.content.style.fontSize', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.statisticcolor') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <ColorPicker
            :value="config.statistic.content.style.color"
            :transfer="true"
            alpha
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
            @on-change="
              val => {
                setConfigValue('statistic.content.style.color', val);
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
    //TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: { config: { type: Object } },
  data() {
    return {
      layoutList: [
        { value: 'horizontal', text: this.$t('term.report.horizontallayout') },
        { value: 'vertical', text: this.$t('term.report.verticallayout') }
      ],
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
        { value: 'inner', text: this.$t('term.report.positions.inner')},
        { value: 'outer', text: this.$t('term.report.positions.outer')},
        { value: 'spider', text: this.$t('term.report.positions.spider') }
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
    }
  },
  filter: {},
  computed: {},
  watch: {
  }
};
</script>
<style lang="less" scoped>
</style>
