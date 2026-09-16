<template>
  <div v-if="examples.length">
    <Tabs v-model="activeScene" :animated="false">
      <TabPane
        v-for="(item, index) in examples"
        :key="index"
        :label="item.title"
        :name="String(index)"
      ></TabPane>
    </Tabs>
    <div v-if="currentExample.description" class="mb-md example-description">{{ currentExample.description }}</div>
    <JsonViewer boxed copyable :value="currentExample.example"></JsonViewer>
  </div>
</template>

<script>
export default {
  name: 'ApiExampleTabs',
  components: {
    JsonViewer: () => import('vue-json-viewer')
  },
  props: {
    examples: { type: Array, default: () => [] },
    interfaceKey: { type: String, default: '' }
  },
  data() {
    return { activeScene: '0' };
  },
  computed: {
    currentExample() {
      return this.examples[Number(this.activeScene)] || {};
    }
  },
  watch: {
    // 场景选择只影响展示，不回写调试参数，也不触发接口调用。
    interfaceKey() {
      this.activeScene = '0';
    },
    examples() {
      this.activeScene = '0';
    }
  }
};
</script>

<style lang="less" scoped>
.example-description {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
