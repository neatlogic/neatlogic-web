<template>
  <div
    class="grid"
    :class="{ 'bg-info-grey': !data.bgColor }"
    style="height: 100%; width: 100%"
    :style="{
      borderRadius: data.radius + 'px',
      borderWidth: (data.borderWidth || 1) + 'px',
      background: data.bgColor,
      borderColor: data.borderColor,
      borderStyle: data.borderStyle
    }"
  ></div>
</template>
<script>
import base from '@/views/pages/diagram/graph/widgets/base.vue';
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
<style lang="less" scoped></style>
