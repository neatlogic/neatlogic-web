<template>
  <ActionViewer :config="config || {}" :conditionList="conditionList || []"></ActionViewer>
</template>
<script>
// 旧详情入口复用新的只读组件，保持调用参数不变。
export default {
  components: { ActionViewer: () => import('../components/view/action-view.vue') },
  props: { config: { type: Object, default: null }, conditionList: { type: Array, default: () => [] } }
};
</script>
