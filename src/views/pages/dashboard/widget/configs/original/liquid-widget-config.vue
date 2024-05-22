<template>
  <div>
    <div class="ivu-form-item tsform-item ivu-form-label-top">
      <label class="ivu-form-item-label overflow">{{ $t('term.report.shape') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.shape"
          :dataList="[
            { value: 'circle', text: $t('term.report.circle')},
            { value: 'diamond', text: $t('term.report.diamond') },
            { value: 'triangle', text: $t('term.report.triangle') },
            { value: 'pin', text: $t('term.report.pin') },
            { value: 'rect', text: $t('term.report.rect') }
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
      <label class="ivu-form-item-label overflow">{{ $t('page.color') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('term.report.texturestyle') }}</label>
      <div class="ivu-form-item-content">
        <TsFormSelect
          :value="config.pattern.type"
          :dataList="[
            { value: '', text: $t('term.report.purecolor') },
            { value: 'dot', text: $t('term.report.dot') },
            { value: 'line', text: $t('term.report.line') },
            { value: 'square', text: $t('page.square') }
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
      <label class="ivu-form-item-label overflow">{{ $t('page.borderwidth') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('term.report.borderspacing') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('page.bordercolor') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('term.report.wavelength') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('term.report.datafontsize') }}</label>
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
      <label class="ivu-form-item-label overflow">{{ $t('term.report.datacolor') }}</label>
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
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
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
