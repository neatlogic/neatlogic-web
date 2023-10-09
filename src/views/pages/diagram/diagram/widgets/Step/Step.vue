<template>
  <div class="grid border-primary" style="line-height: 36px; border-width: 2px; height: 100%; width: 100%">
    <div class="bg-info text-op" style="text-align: center">{{ data.num }}</div>
    <div class="overflow pl-xs pr-xs" :class="{ 'bg-info-grey': !data.bgColor }" :style="{ background: data.bgColor }">
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
  grid-template-columns: 40px auto;
}
</style>
