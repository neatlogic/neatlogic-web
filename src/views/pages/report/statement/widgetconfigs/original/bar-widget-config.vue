<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">显示Y轴</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.yAxis?true:false"
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
      </div>
    </div>
    <div v-if="config.yAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">Y轴标题</label>
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
      <label class="ivu-form-item-label overflow">显示X轴</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.xAxis?true:false"
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
      </div>
    </div>
    <div v-if="config.xAxis" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">X轴标题</label>
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
      <label class="ivu-form-item-label overflow">柱子宽度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.barWidthRatio"
            :min="0.1"
            :max="0.9"
            :step="0.1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('barWidthRatio', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">自定义颜色</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
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
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: { config: { type: Object } },
  data() {
    return {
      positionList: [
        { value: 'top-left', text: '上居左' },
        { value: 'top', text: '上居中' },
        { value: 'top-right', text: '上居右' },
        { value: 'bottom-left', text: '下居左' },
        { value: 'bottom', text: '下居中' },
        { value: 'bottom-right', text: '下居右' },
        { value: 'left-top', text: '左上角' },
        { value: 'left', text: '左居中' },
        { value: 'left-bottom', text: '左下角' },
        { value: 'right-top', text: '右上角' },
        { value: 'right', text: '右居中' },
        { value: 'right-bottom', text: '右下角' }
      ],
      labelTypeList: [
        { value: 'inner', text: '内部' },
        { value: 'outer', text: '外部' }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
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
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
