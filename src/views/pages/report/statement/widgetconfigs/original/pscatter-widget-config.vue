<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
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
      </div>
    </div>
    <div v-if="config.yAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yaxistitle') }}
      </label>
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
      <div class="mt-md">
        <label class="ivu-form-item-label overflow">
          {{ $t('term.report.axis.yaxisfontcolor') }}
        </label>
        <div class="ivu-form-item-content">
          <div class="pl-md pr-md">
            <ColorPicker
              :value="config.yAxis && config.yAxis.label && config.yAxis.label.style && config.yAxis.label.style.fill"
              :transfer="true"
              alpha
              recommend
              class="colorPicker"
              transfer-class-name="color-picker-transfer-class"
              @on-change="
                val => {
                  if(val) {
                    setConfigValue('yAxis', {
                      label: {
                        style: {
                          fill: val
                        }
                      }
                    });
                  } else {
                    setConfigValue('yAxis', val);
                  }
                }
              "
            />
          </div>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
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
      </div>
    </div>
    <div v-if="config.xAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xaxistitle') }}
      </label>
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
      <div class="mt-md">
        <label class="ivu-form-item-label overflow">
          {{ $t('term.report.axis.axisfontcolor') }}
        </label>
        <div class="ivu-form-item-content">
          <div class="pl-md pr-md">
            <ColorPicker
              :value="config.xAxis && config.xAxis.label && config.xAxis.label.style && config.xAxis.label.style.fill"
              :transfer="true"
              alpha
              recommend
              class="colorPicker"
              transfer-class-name="color-picker-transfer-class"
              @on-change="
                val => {
                  if(val) {
                    setConfigValue('xAxis', {
                      label: {
                        style: {
                          fill: val
                        }
                      }
                    });
                  } else {
                    setConfigValue('xAxis', val);
                  }
                }
              "
            />
          </div>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.bubbleshape') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :dataList="[{value:'circle',text:$t('term.report.circle')},{value:'square',text:$t('term.report.rect')}]"
          :value="config.shape"
          @change="
            val => {
              setConfigValue('shape', val);
            }
          "
        ></TsFormRadio>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.bubblesize') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.size"
            :min="1"
            :max="50"
            :step="1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('size', val);
              }
            "
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
        {{ $t('term.report.axis.legendposition') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.legend.position"
          :transfer="true"
          :clearable="false"
          :dataList="positionList"
          @change="
            val => {
              setConfigValue('legend.position', val);
            }
          "
        ></TsFormSelect>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.yfieldalias') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.meta.yField.alias"
          @change="val => {
            setConfigValue('meta.yField.alias', val);
          }"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xfieldalias') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.meta.xField.alias"
          @change="val => {
            setConfigValue('meta.xField.alias', val);
          }"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.colorfieldalias') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.meta.colorField.alias"
          @change="val => {
            setConfigValue('meta.colorField.alias', val);
          }"
        ></TsFormInput>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio')
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
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initAlias();
  },
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
    initAlias() {
      let meta = this.config.meta;
      let keys = Object.keys(meta);
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
