<template>
  <div>
    <div v-if="handlers[phase.phase]">
      <component
        :is="phase.phase"
        v-if="phase && phase.phase"
        :phase="phase"
      ></component>
    </div>
  </div>
</template>
<script>
import * as handlers from './index.js';
export default {
  name: 'AttrViewer',
  components: {
    ...handlers
  },
  props: {
    phase: { type: Object}
  },
  data() {
    return {
      handlers: handlers
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
