<template>
  <WorkbenchTemplateEdit
    :workbenchType="workbenchType"
    manageRouteName="user-setting"
    :manageRouteQuery="{ paneName: 'workbench' }"
  ></WorkbenchTemplateEdit>
</template>

<script>
import WorkbenchTemplateEdit from './workbench-template-edit.vue';
import { WORKBENCH_TYPE_PERSONAL } from '@/views/components/portal/workbench-constants.js';

export default {
  name: 'PersonalWorkbenchEdit',
  components: { WorkbenchTemplateEdit },
  data() {
    return {
      workbenchType: WORKBENCH_TYPE_PERSONAL
    };
  }
};
</script>
