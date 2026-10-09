<template>
  <div class="pb-md">
    <div class="text-title pb-xs">{{ action.notifyHandlerName || action.notifyHandler }}</div>
    <div class="pb-xs">
      <span class="text-grey pr-sm">{{ $t('page.template') }}</span>
      <span>{{ action.templateName || action.templateId || '-' }}</span>
    </div>
    <div>
      <span class="text-grey pr-sm">{{ $t('page.recipient') }}</span>
      <template v-if="action.receiverObjList && action.receiverObjList.length">
        <UserCard
          v-for="(receiver, index) in action.receiverObjList"
          :key="receiver.uuid || receiver.value || index"
          v-bind="receiver"
          class="pr-xs pb-xs"
        ></UserCard>
      </template>
      <UserSelect
        v-else
        :value="action.receiverList || []"
        :groupList="authorityConfig.groupList"
        :includeList="authorityConfig.includeList"
        :excludeList="authorityConfig.excludeList"
        readonly
      ></UserSelect>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotifyChannelViewBase',
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect')
  },
  props: {
    action: {type: Object, default: () => ({})},
    authorityConfig: {type: Object, default: () => ({})}
  }
};
</script>
