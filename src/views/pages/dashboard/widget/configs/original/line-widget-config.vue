<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.axis.yaxisshow')" labelPosition="top">
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
    </TsFormItem>
    <TsFormItem v-if="config.yAxis" :label="$t('term.report.axis.yaxistitle')" labelPosition="top">
      <TsFormInput
        :value="config.yAxis.title && config.yAxis.title.text"
        border="border"
        @change="
          val => {
            setConfigValue('yAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.axis.xaxisshow')" labelPosition="top">
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
    </TsFormItem>
    <TsFormItem v-if="config.xAxis" :label="$t('term.report.axis.xaxistitle')" labelPosition="top">
      <TsFormInput
        :value="config.xAxis.title && config.xAxis.title.text"
        border="border"
        @change="
          val => {
            setConfigValue('xAxis.title.text', val);
          }
        "
      ></TsFormInput>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.smoothcurve')" labelPosition="top">
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
    </TsFormItem>
    <TsFormItem :label="$t('term.report.customcolor')" labelPosition="top">
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
    </TsFormItem>
    <TsFormItem :label="$t('term.report.statisticcolor')" labelPosition="top">
      <ColorPicker
        :value="config.label && config.label.style && config.label.style.fill"
        :transfer="true"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            if(val){
              setConfigValue('label', {
                visible: true,
                style: {
                  fill: val,
                },
              })
            }else{
              deleteConfigValue('label.style')
            }
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="辅助线" labelPosition="top">
      <TsFormSwitch
        :value="!config.yAxis?true:typeof config.yAxis === 'boolean' ? true : config.yAxis.grid?config.yAxis.grid.visible:true"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('yAxis.grid.visible', val);
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
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
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
<style lang="less" scoped></style>
