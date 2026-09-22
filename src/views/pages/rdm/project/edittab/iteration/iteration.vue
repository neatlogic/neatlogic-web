<template>
  <Tabs v-model="currentTab">
    <TabPane :label="$t('page.noticesetting')" name="notify" class="pl-md">
      <NotifyPolicySetting v-if="currentTab === 'notify'" targetType="app" :targetId="appData.id"></NotifyPolicySetting>
    </TabPane>
    <TabPane
      v-if="eventSettingComponent"
      :label="$t('term.rdm.eventsetting')"
      name="event"
      class="pl-md"
    >
      <component
        :is="eventSettingComponent"
        v-if="currentTab === 'event'"
        :key="appData.id"
        :appId="appData.id"
        :projectId="appData.projectId"
      ></component>
    </TabPane>
  </Tabs>
</template>
<script>
import { SettingBase } from '../base-setting.js';
export default {
  name: 'RdmIterationEditor',
  defaultSettingTab: 'notify',
  components: {
    NotifyPolicySetting: () => import('@/views/pages/rdm/project/edittab/components/notify-policy-setting.vue')
  },
  extends: SettingBase,
  data() { return { currentTab: 'notify' }; }

};
</script>
