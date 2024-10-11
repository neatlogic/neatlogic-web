<template>
  <div>
    <TsFormItem label="边框" labelPosition="top">
      <div class="pl-md"><Slider v-model="data.borderWidth" :min="0" :max="10"></Slider></div>
    </TsFormItem>
    <TsFormItem label="边框颜色" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.borderColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'borderColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="图标颜色" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.iconColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'iconColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="背景颜色" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.bgColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'bgColor', val);
          }
        "
      />
    </TsFormItem>
    <TsFormItem label="文本颜色" labelPosition="top">
      <ColorPicker
        :transfer="true"
        :value="data.fontColor"
        alpha
        recommend
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'fontColor', val);
          }
        "
      />
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  extends: base,
  props: {},
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
