<template>
  <div class="pb-nm">
    <TsFormItem :label="$t('term.report.axis.yaxisshow')" labelPosition="top">
      <TsFormSwitch
        :value="config.yAxis?true:false"
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
        :value="config.xAxis?true:false"
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
        @on-change="val => {
          setConfigValue('color', val);
        }"
      />
    </TsFormItem>
    <TsFormItem :label="$t('term.report.showdata')" labelPosition="top">
      <TsFormSwitch
        :value="config.label ? true : false"
        :true-value="true"
        :false-value="false"
        @change="
          val => {
            setConfigValue('label', val);
          }
        "
      ></TsFormSwitch>
    </TsFormItem>
    <TsFormItem v-if="config.label" :label="$t('term.report.statisticcolor')" labelPosition="top">
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
              setConfigValue('label.style.fill', val);
            } else{
              deleteConfigValue('label.style');
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
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
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
  computed: {

  },
  watch: {

  }
};
</script>
<style lang="less" scoped>
</style>
