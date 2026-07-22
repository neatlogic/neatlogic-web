<template>
  <div>
    <Tabs v-model="currentTab">
      <TabPane :label="$t('term.rdm.attributesetting')" name="attr" class="pl-md">
        <AttrEdit v-if="currentTab === 'attr'" :appId="appData.id" :projectId="appData.projectId"></AttrEdit>
      </TabPane>
      <TabPane :label="$t('term.rdm.statussets')" name="objectstatus" class="pl-md">
        <AppStatus v-if="currentTab === 'objectstatus'" :appId="appData.id" :projectId="appData.projectId"></AppStatus>
      </TabPane>
      <TabPane :label="$t('term.rdm.relationsetting')" name="relstrategy" class="pl-md">
        <RelStrategyEdit
          v-if="currentTab === 'relstrategy'"
          :appData="appData"
          toAppType="testcase"
          relType="extend"
          :label="$t('term.rdm.testplanreltestcase')"
        ></RelStrategyEdit>
      </TabPane>
      <TabPane :label="$t('page.noticesetting')" name="notify" class="pl-md">
        <NotifyPolicySetting v-if="currentTab === 'notify'" targetType="app" :targetId="appData.id"></NotifyPolicySetting>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    AttrEdit: () => import('@/views/pages/rdm/project/edittab/components/attr-edit.vue'),
    AppStatus: () => import('@/views/pages/rdm/project/edittab/components/app-status-edit.vue'),
    RelStrategyEdit: () => import('@/views/pages/rdm/project/edittab/components/rel-strategy-edit.vue'),
    NotifyPolicySetting: () => import('@/views/pages/rdm/project/edittab/components/notify-policy-setting.vue')
  },
  props: {
    appData: { type: Object }
  },
  data() {
    return {
      currentTab: 'attr'
    };
  }
};
</script>
<style lang="less"></style>
