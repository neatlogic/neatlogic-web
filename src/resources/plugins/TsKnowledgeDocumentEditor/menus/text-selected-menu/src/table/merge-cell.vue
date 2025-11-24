<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <img
        style="width: 16px;height: 16px;"
        src="@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/table/merge-cell.svg"
        alt=""
        @click="handleClick"
      />
      <div slot="content">
        {{ title }}
      </div>
    </Tooltip>
  </div>
</template>
<script>
import mixin from '@/resources/plugins/TsKnowledgeDocumentEditor/menus/text-selected-menu/src/mixin.js';
export default {
  name: '',
  components: {
  },
  mixins: [mixin],
  props: {
    title: {
      type: String,
      default: ''
    },
    command: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      linkUrl: ''
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
  methods: {
    handleClick() {
      this.$emit('execCommand', {
        command: this.command,
        value: {}
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
