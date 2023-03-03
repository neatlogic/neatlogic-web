<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">风格</label>
      <div class="ivu-form-item-content">
        <TsFormRadio
          :value="config.type"
          :dataList="[
            { value: '', text: '默认' },
            { value: 'meter', text: '码表' }
          ]"
          @change="
            val => {
              setConfigValue('type', val);
            }
          "
        ></TsFormRadio>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">环形厚度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="1 - config.innerRadius"
            :min="0.05"
            :max="0.5"
            :step="0.05"
            show-tip="never"
            @on-change="
              val => {
                setConfigValue('innerRadius', 1 - val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">表盘颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.range.color"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('range.color', val);
            }
          "
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">指针颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.indicator.pointer.style.stroke"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('indicator.pointer.style.stroke', val);
            }
          "
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">中心颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.indicator.pin.style.stroke"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('indicator.pin.style.stroke', val);
              setConfigValue('indicator.pin.style.fill', val);
            }
          "
        />
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
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve)
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
