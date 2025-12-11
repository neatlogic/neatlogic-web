<template>
  <div>
    <Tooltip 
      placement="top"
      :transfer="true"
      theme="light"
      max-width="300"
    >
      <span class="tsfont-table-merge-cell" @click="handleClick"></span>
      <div slot="content">
        <div v-for="(item, index) in tipContentList" :key="index">{{ item }}</div>
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
  props: {},
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
      this.$emit('executeEditorCommand', {
        commandName: this.command,
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
