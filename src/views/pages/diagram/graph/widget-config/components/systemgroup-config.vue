<template>
  <TsForm v-model="data" :item-list="form" labelPosition="top">
    <template v-slot:titleBgColor>
      <ColorPicker
        :transfer="true"
        recommend
        :value="data.titleBgColor"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'titleBgColor', val);
          }
        "
      />
    </template>
    <template v-slot:bgColor>
      <ColorPicker
        :transfer="true"
        recommend
        :value="data.bgColor"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'bgColor', val);
          }
        "
      />
    </template>
    <template v-slot:width>
      <Slider v-model="data.width" :max="1000" :min="50"></Slider>
    </template>
    <template v-slot:height>
      <Slider v-model="data.height" :max="1000" :min="50"></Slider>
    </template>
  </TsForm>
</template>
<script>
import { ConfigBase } from '@/views/pages/diagram/graph/widget-config/config-base.js';
export default {
  name: '',
  components: {},
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
    addItem(type) {
      this.data[type].push('');
    },
    removeItem(type, index) {
      this.data[type].splice(index, 1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>
