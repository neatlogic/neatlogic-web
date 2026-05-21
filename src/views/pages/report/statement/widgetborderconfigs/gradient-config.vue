<template>
  <div>
    <TsFormItem label="标题" labelPosition="top">
      <TsFormInput
        :value="config.title"
        @on-change="
          val => {
            setConfigValue('title', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="标题颜色" labelPosition="top">
      <div>
        <ColorPicker
          :transfer="true"
          :value="config.titlecolor"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('titlecolor', val);
            }
          "
        />
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.fontsize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="config.titlefontsize"
          :min="12"
          :max="50"
          :step="1"
          @on-change="
            val => {
              setConfigValue('titlefontsize', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.mainbordercolor')" labelPosition="top">
      <div>
        <ColorPicker
          :transfer="true"
          :value="config.color"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('color', val);
            }
          "
        />
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.report.subbordercolor')" labelPosition="top">
      <div>
        <ColorPicker
          :transfer="true"
          alpha
          :value="config.cocolor"
          recommend
          transfer-class-name="color-picker-transfer-class"
          @on-change="
            val => {
              setConfigValue('cocolor', val);
            }
          "
        />
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
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
