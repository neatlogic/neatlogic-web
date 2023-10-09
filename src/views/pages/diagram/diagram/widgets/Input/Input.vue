<template>
  <div
    class="grid"
    :class="{ 'bg-info-grey': !data.bgColor }"
    style="height: 100%; width: 100%"
    :style="{ background: data.bgColor }"
  >
    <div style="border-width: 2px; height: 10px; border-bottom: 0px" class="border-primary"></div>
    <div style="border-width: 2px" class="overflow border-primary padding-xs">
      {{ data.name }}
    </div>
  </div>
</template>
<script>
import base from '@/views/pages/diagram/diagram/widgets/base.vue';
export default {
  name: '',
  components: {},
  extends: base,
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-rows: 5px auto;
}
</style>
