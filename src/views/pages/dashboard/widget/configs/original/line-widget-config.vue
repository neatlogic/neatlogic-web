<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.axis.yaxisshow') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.yAxis ? true : false"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              if (val) {
                setConfigValue('yAxis', { title: { text: '' } });
              } else {
                setConfigValue('yAxis', val);
              }
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.yAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.axis.yaxistitle') }}</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.yAxis.title && config.yAxis.title.text"
          border="border"
          @change="
            val => {
              setConfigValue('yAxis.title.text', val);
            }
          "
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.axis.xaxisshow') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.xAxis ? true : false"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              if (val) {
                setConfigValue('xAxis', {
                  label: {
                    autoHide: true,
                    autoEllipsis: true
                  },
                  title: { text: '' }
                });
              } else {
                setConfigValue('xAxis', val);
              }
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.xAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.axis.xaxistitle') }}</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.xAxis.title && config.xAxis.title.text"
          border="border"
          @change="
            val => {
              setConfigValue('xAxis.title.text', val);
            }
          "
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.smoothcurve') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.smooth"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('smooth', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.customcolor') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <ColorPicker
            :value="config.color"
            :transfer="true"
            alpha
            recommend
            class="colorPicker"
            transfer-class-name="color-picker-transfer-class"
            @on-change="
              val => {
                setConfigValue('color', val);
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: { config: { type: Object } },
  data() {
    return {};
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
