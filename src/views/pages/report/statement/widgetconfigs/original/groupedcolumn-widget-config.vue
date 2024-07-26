<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.showlegend') }}
      </label>
      <div class="ivu-form-item-content">
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
        {{ $t('term.report.axis.yaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.yAxis"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('yAxis', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.axis.xaxisshow') }}
      </label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.xAxis"
          :true-value="true"
          :false-value="false"
          @change="
            val => {
              setConfigValue('xAxis', val);
            }
          "
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.xAxis" class="ivu-form-item tsform-item ivu-form-label-top">
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
        {{ $t('term.report.axis.columnwidth') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
    //TsFormRadio:()=>import('@/resources/plugins/TsForm/TsFormRadio'),
    //TsFormInput:()=>import('@/resources/plugins/TsForm/TsFormInput')
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
<style lang="less"></style>
