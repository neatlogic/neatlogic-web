<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('page.borderwidth') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.width"
            :min="1"
            :max="10"
            :step="1"
            @on-change="
              val => {
                setConfigValue('width', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.cornersize') }}
      
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.cornersize"
            :min="0"
            :max="50"
            :step="1"
            @on-change="
              val => {
                setConfigValue('cornersize', val);
              }
            "
          ></Slider>
        </div>
      </div>
      <div class="ivu-form-item tsform-item ivu-form-label-top">
        <label class="ivu-form-item-label overflow">
          {{ $t('term.report.mainbordercolor') }}
        </label>
        <div class="ivu-form-item-content">
          <ColorPicker
            :transfer="true"
            :value="config.color"
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
        <label class="ivu-form-item-label overflow">
          {{ $t('term.report.subbordercolor') }}
        </label>
        <div class="ivu-form-item-content">
          <ColorPicker
            :transfer="true"
            alpha
            :value="config.cocolor"
            transfer-class-name="color-picker-transfer-class"
            @on-change="
              val => {
                setConfigValue('cocolor', val);
              }
            "
          />
        </div>
      </div>
    </div>
  </div></template>
<script>
export default {
  name: '',
  components: {},
  props: {
    config: { type: Object }
  },
  data() {
    return {
      myConfig: {
        borderwidth: 1
      }
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
  watch: {}
};
</script>
<style lang="less">
</style>
