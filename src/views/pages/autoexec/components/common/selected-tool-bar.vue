<template>
  <div v-if="toolList.length">
    <Tag
      v-for="item in toolList"
      :key="item.id"
      :title="item.name"
      closable
      @on-close="removeTool(item)"
    >
      <span class="tsfont-tool">{{ item.name }}</span>
    </Tag>
  </div>
</template>
<script>
export default {
  name: 'SelectedToolBar',
  props: {
    toolList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    removeTool(item) {
      this.$emit('remove', item);
    }
  }
};
</script>
