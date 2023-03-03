<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">形状</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.shape"
          :dataList="[
            { value: 'circle', text: '圆形' },
            { value: 'diamond', text: '钻石形' },
            { value: 'triangle', text: '三角形' },
            { value: 'pin', text: '水滴形' },
            { value: 'rect', text: '正方形' }
          ]"
          @change="
            val => {
              setConfigValue('shape', val);
            }
          "
        ></TsFormSelect>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">颜色</label>
      <div class="ivu-form-item-content">
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
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">贴图样式</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.pattern.type"
          :dataList="[
            { value: '', text: '纯色' },
            { value: 'dot', text: '圆点' },
            { value: 'line', text: '斜纹' },
            { value: 'square', text: '方块' }
          ]"
          @change="
            val => {
              setConfigValue('pattern.type', val);
            }
          "
        ></TsFormSelect>
      </div>
    </div>

    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">边框宽度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.outline.border"
            :min="0"
            :max="10"
            :step="1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('outline.border', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">边框间距</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.outline.distance"
            :min="0"
            :max="10"
            :step="1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('outline.distance', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">边框颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.outline.style.stroke"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('outline.style.stroke', val);
            }
          "
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">水波长度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.wave.length"
            :min="50"
            :max="300"
            :step="1"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('wave.length', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">数据字号</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.statistic.content.style.fontSize"
            :min="12"
            :max="80"
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
      <label class="ivu-form-item-label overflow">数据颜色</label>
      <div class="ivu-form-item-content">
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
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
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
