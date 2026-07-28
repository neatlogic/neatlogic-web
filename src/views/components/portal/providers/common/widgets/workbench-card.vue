<template>
  <WorkbenchCard
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :tone="tone"
    :dense="dense"
    :loading="loading"
    :error="error"
    :empty="empty"
    @retry="$emit('retry')"
  >
    <template v-if="$slots.action" v-slot:action><slot name="action"></slot></template>
    <slot></slot>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';

export default {
  name: 'CommonWorkbenchCard',
  components: { WorkbenchCard },
  props: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    tone: { type: String, default: '' },
    dense: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    empty: { type: Boolean, default: false }
  }
};
</script>
