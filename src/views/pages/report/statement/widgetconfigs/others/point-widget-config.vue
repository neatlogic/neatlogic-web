<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">背景颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :value="config.background.color.value"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('background.color.value', val);
          }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">粒子运动</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.particles.move.enable"
          :showStatus="true"
          :true-value="true"
          :false-value="false"
          @change="val => {
            setConfigValue('particles.move.enable', val);
          }"
        ></TsFormSwitch>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">粒子颜色</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.particles.isRandomColor"
          :showStatus="true"
          trueText="自定义颜色"
          falseText="随机颜色"
          :true-value="false"
          :false-value="true"
          @change="val => {
            setConfigValue('particles.isRandomColor', val);
          }"
        ></TsFormSwitch>
        <ColorPicker
          v-if="!config.particles.isRandomColor"
          :value="config.particles.color.value"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('particles.color.value', val);
          }"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">粒子透明度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.opacity.value"
            :min="0.1"
            :max="1"
            :step="0.1"
            @on-change="val => {
              setConfigValue('particles.opacity.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">粒子数量</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.number.value"
            :min="1"
            :max="200"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.number.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">粒子大小</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.size.value"
            :min="1"
            :max="100"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.size.value', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">自动连线</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.particles.links.enable"
          :true-value="true"
          :false-value="false"
          @change="val => {
            setConfigValue('particles.links.enable', val);
          }"
        ></TsFormSwitch>
      </div>
    </div>
    <div v-if="config.particles.links.enable" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">连线距离</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.links.distance"
            :min="10"
            :max="500"
            :step="10"
            @on-change="val => {
              setConfigValue('particles.links.distance', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div v-if="config.particles.links.enable" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">连线颜色</label>
      <div class="ivu-form-item-content">
        <TsFormSwitch
          :value="config.particles.links.isRandomColor"
          :showStatus="true"
          trueText="自定义颜色"
          falseText="随机颜色"
          :true-value="false"
          :false-value="true"
          @change="val => {
            setConfigValue('particles.links.isRandomColor', val);
          }"
        ></TsFormSwitch>
        <ColorPicker
          v-if="!config.particles.links.isRandomColor"
          :value="config.particles.links.color.value"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('particles.links.color.value', val);
          }"
        />
      </div>
    </div>
    <div v-if="config.particles.links.enable" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">连线透明度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.links.opacity"
            :min="0.1"
            :max="1"
            :step="0.1"
            @on-change="val => {
              setConfigValue('particles.links.opacity', val);
            }"
          ></Slider>
        </div>
      </div>
    </div>
    <div v-if="config.particles.links.enable" class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">连线宽度</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.particles.links.width"
            :min="1"
            :max="5"
            :step="1"
            @on-change="val => {
              setConfigValue('particles.links.width', val);
            }"
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
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  props: {
    config: { type: Object }
  },
  data() {
    return {
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
<style lang="less">
</style>
