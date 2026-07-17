<template>
  <NotifyPolicySetting targetType="app" :targetId="appData.id"></NotifyPolicySetting>
</template>
<script>
export default {
  name: 'RdmIterationEditor',
  components: {
    NotifyPolicySetting: () => import('@/views/pages/rdm/project/edittab/components/notify-policy-setting.vue')
  },
  props: {
    appData: { type: Object, required: true }
  }
};
</script>
<style scoped lang="less"></style>
