<template>
  <TsForm v-model="data" :item-list="form" labelPosition="top">
    <template v-slot:fontSize>
      <Slider v-model="data.fontSize" :min="12" :max="50"></Slider>
    </template>
    <template v-slot:color>
      <ColorPicker
        :transfer="true"
        recommend
        :value="data.color"
        class="colorPicker"
        transfer-class-name="color-picker-transfer-class"
        @on-change="
          val => {
            $set(data, 'color', val);
          }
        "
      />
    </template>
  </TsForm>
</template>
<script>
import { ConfigBase } from '@/views/pages/diagram/graph/widget-config/config-base.js';
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
