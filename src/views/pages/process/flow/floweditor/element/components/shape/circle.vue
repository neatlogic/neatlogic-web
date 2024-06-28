<template>
  <div>
    <div class="container shadow" :class="type">
      <div class="core"></div>
    </div>
    <div v-if="name" style="text-align: center">{{ name }}</div>
  </div>
</template>
<script>
import base from '@/views/pages/process/flow/floweditor/element/components/base.vue';

export default {
  name: 'VueCircle',
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
  computed: {
    type() {
      return this.node.getProp('type');
    },
    size() {
      return this.node.size().width + 'px';
    },
    name() {
      return this.node.getProp('name');
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 40px;
}
.core {
  width: 18px;
  height: 18px;
  border-radius: 18px;
}
.start {
  background-color: rgba(129, 213, 83, 0.1);
  .core {
    background-color: rgba(129, 213, 83, 1);
  }
}
.end {
  background-color: rgba(255, 98, 90, 0.1);
  .core {
    background-color: rgba(255, 98, 90, 1);
  }
}
</style>
