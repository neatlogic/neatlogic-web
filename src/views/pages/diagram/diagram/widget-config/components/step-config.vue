<template>
  <TsForm v-model="data" :item-list="form" labelPosition="top">
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
  </TsForm>
</template>
<script>
import { ConfigBase } from '@/views/pages/diagram/diagram/widget-config/config-base.js';
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
