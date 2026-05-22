<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('page.borderwidth') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.width"
            :min="1"
            :max="6"
            :step="1"
            @on-change="val => setConfigValue('width', val)"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.cornersize') }}</label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.cornersize"
            :min="12"
            :max="60"
            :step="1"
            @on-change="val => setConfigValue('cornersize', val)"
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.mainbordercolor') }}</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          alpha
          :value="config.color"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => setConfigValue('color', val)"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('page.backgroundcolor') }}</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          alpha
          :value="config.backgroundColor"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => setConfigValue('backgroundColor', val)"
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">发光颜色</label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          alpha
          :value="config.shadowColor"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => setConfigValue('shadowColor', val)"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  props: {
    config: { type: Object }
  },
  methods: {
    setConfigValue(attrName, attrValue) {
      this.$emit('setConfig', attrName, attrValue);
    }
  }
};
</script>
