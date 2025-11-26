<template>
  <div>
    <Tooltip content="有序列表" placement="top" :transfer="true">
      <span class="tsfont-orderlist cursor-pointer" @click.stop="insertMenuContent({commandName: 'orderedList'})"></span>
    </Tooltip>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {},
  mixins: [toolBarMixin],
  props: {},
  data() {
    return {
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
<style lang="less">
</style>
