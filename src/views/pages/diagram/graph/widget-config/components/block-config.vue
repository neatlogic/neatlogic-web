<template>
  <TsForm v-model="data" :item-list="form" labelPosition="top">
    <template v-slot:borderWidth>
      <Slider v-model="data.borderWidth" :min="1" :max="20"></Slider>
    </template>
    <template v-slot:borderColor>
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
    </template>
    <template v-slot:bgColor>
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
    </template>
    <template v-slot:radius>
      <Slider v-model="data.radius" :min="0" :max="20"></Slider>
    </template>
  </TsForm>
</template>
<script>
import { ConfigBase } from '../config-base.js';
export default {
  name: '',
  components: {
  },
  extends: ConfigBase,
  props: {},
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
