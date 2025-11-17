<template>
  <div>
    <Tooltip content="居中对齐" placement="top" :transfer="true">
      <span class="tsfont-horizontal-center cursor-pointer" @click.stop="emitValue({menuName: 'alignCenter'})"></span>
    </Tooltip>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsKnowledgeDocumentEditor/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {
  },
  mixins: [toolBarMixin],
  props: {},
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
  },
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
<style lang="less">
</style>
