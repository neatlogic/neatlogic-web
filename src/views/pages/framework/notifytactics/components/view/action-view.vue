<template>
  <div>
    <Divider orientation="start">{{ $t('page.condition') }}</Divider>
    <ConditionViewer :config="config.conditionConfig || {}" :conditionList="conditionList"></ConditionViewer>
    <Divider orientation="start">{{ $t('page.actions') }}</Divider>
    <component
      :is="channelViewers[action.notifyHandler] || genericChannel"
      v-for="(action, index) in config.actionList"
      :key="index"
      class="mb-md"
      :action="action"
    ></component>
  </div>
</template>
<script>
import channelViewers from './index.js';
import GenericChannel from './channel-base.vue';

export default {
  components: {
    ConditionViewer: () => import('./condition-view.vue'),
    GenericChannel,
    ...channelViewers
  },
  props: {
    config: { type: Object, required: true },
    conditionList: { type: Array, default: () => [] }
  },
  data() {
    return { channelViewers, genericChannel: GenericChannel };
  }
};
</script>
