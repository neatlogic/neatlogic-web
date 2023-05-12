<template>
  <div>
    <TsFormItem :label="$t('page.name')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <TsFormInput v-model="config.name" border="border" :maxlength="50"></TsFormInput>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.bordercolor')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <ColorPicker
          v-model="config.stroke"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
        />
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.backgroundcolor')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <ColorPicker
          v-model="config.fill"
          :transfer="true"
          alpha
          recommend
          class="colorPicker"
          transfer-class-name="color-picker-transfer-class"
        />
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('page.borderwidth')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <Slider v-model="config.strokewidth" :min="0" :max="10"></Slider>
      </div>
    </TsFormItem>
    <TsFormItem :label="$t('term.cmdb.radius')" labelPosition="top">
      <div class="padding-sm radius-sm">
        <Slider
          :value="config.rx"
          :min="0"
          :max="50"
          @on-change="
            val => {
              setConfig('rx', val);
              setConfig('ry', val);
            }
          "
        ></Slider>
      </div>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  extends: base,
  props: {},

  data() {
    return {
      isIconDialogShow: false,
      configLocal: this.config
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
