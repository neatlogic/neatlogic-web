<template>
  <div>
    <TsFormItem :label="$t('page.fontsize')" labelPosition="top">
      <div class="pl-sm pr-sm">
        <Slider
          :value="config.fontsize"
          :min="12"
          :max="50"
          :step="1"
          @on-change="
            val => {
              setConfigValue('fontsize', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.fontcolor')" labelPosition="top">
      <div>
        <ColorPicker
          :value="config.fontcolor"
          :transfer="true"
          recommend
          format="hex"
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
          @on-change="val => {
            setConfigValue('fontcolor', val);
          }"
        />
      </div>
    </TsFormItem>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
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
