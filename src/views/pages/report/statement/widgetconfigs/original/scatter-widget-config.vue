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
      <label class="ivu-form-item-label overflow">气泡形状</label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :dataList="[{value:'circle',text:'圆形'},{value:'square',text:'方形'}]"
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
      <label class="ivu-form-item-label overflow">气泡大小</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.size"
            :min="1"
            :max="50"
            :step="1"
            range
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
      <label class="ivu-form-item-label overflow">显示图例</label>
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
      <label class="ivu-form-item-label overflow">图例位置</label>
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
      <label class="ivu-form-item-label overflow">Y轴字段别名</label>
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
      <label class="ivu-form-item-label overflow">X轴字段别名</label>
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
      <label class="ivu-form-item-label overflow">颜色字段别名</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.meta.colorField.alias"
          @change="val => {
            setConfigValue('meta.colorField.alias', val);
          }"
        ></TsFormInput>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">大小字段别名</label>
      <div class="ivu-form-item-content">
        <TsFormInput
          :value="config.meta.sizeField.alias"
          @change="val => {
            setConfigValue('meta.sizeField.alias', val);
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
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
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
  computed: {
    
  },
  watch: {
  
  }
};
</script>
<style lang="less" scoped>
</style>
