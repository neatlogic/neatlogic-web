<template>
  <div>
    <Tooltip content="引用" placement="top" :transfer="true">
      <img
        src="./quote.svg"
        style="width: 16px;height: 16px;cursor:pointer;"
        alt="引用"
        @click.stop="emitValue({menuName: 'blockQuote'})"
      />
    </Tooltip>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsTiptap/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {},
  mixins: [toolBarMixin],
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
<style lang="less">
</style>
