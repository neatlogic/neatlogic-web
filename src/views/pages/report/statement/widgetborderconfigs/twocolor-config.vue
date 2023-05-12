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
            :min="10"
            :max="50"
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
        {{ $t('term.report.motionoffset') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.offset"
            :min="10"
            :max="40"
            :step="1"
            @on-change="
              val => {
                setConfigValue('offset', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.motiondelay') }}
      </label>
      <div class="ivu-form-item-content">
        <div class="pl-md pr-md">
          <Slider
            :value="config.delay"
            :min="1"
            :max="20"
            :step="1"
            @on-change="
              val => {
                setConfigValue('delay', val);
              }
            "
          ></Slider>
        </div>
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.coloralpha') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          :value="config.coloralpha"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('coloralpha', val);
            }
          "
        />
      </div>
    </div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">
        {{ $t('term.report.colorbeta') }}
      </label>
      <div class="ivu-form-item-content">
        <ColorPicker
          :transfer="true"
          :value="config.colorbeta"
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('colorbeta', val);
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
