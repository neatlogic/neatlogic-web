<template>
  <div :class="border === 'border' ? 'radius-lg bg-op padding mt-nm' : 'mt-nm'">
    <div class="flex-between mb-sm">
      <span>{{ title }}</span>
      <span
        class="cursor"
        :class="expanded ? 'tsfont-down' : 'tsfont-up'"
        @click="$emit('toggle', !expanded)"
      ></span>
    </div>
    <div v-show="expanded">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CollapseSection',
  props: {
    title: String,
    expanded: {
      type: Boolean,
      default: true
    },
    border: {
      type: String,
      default: 'border'
    }
  }
};
</script>
