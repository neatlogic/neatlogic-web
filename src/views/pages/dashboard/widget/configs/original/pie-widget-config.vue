<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">内圆半径</label>
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
      <label class="ivu-form-item-label overflow">图例位置</label>
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
      <label class="ivu-form-item-label overflow">数据布局</label>
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
      <label class="ivu-form-item-label overflow">统计数据字号</label>
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
      <label class="ivu-form-item-label overflow">统计数据颜色</label>
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
        { value: 'horizontal', text: '横向布局' },
        { value: 'vertical', text: '纵向布局' }
      ],
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
        { value: 'outer', text: '外部' },
        { value: 'spider', text: '蜘蛛布局' }
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
