<template>
  <WorkbenchTemplateEdit
    :workbenchType="workbenchType"
    manageRouteName="global-workbench-manage"
  ></WorkbenchTemplateEdit>
</template>

<script>
import WorkbenchTemplateEdit from './workbench-template-edit.vue';
import { WORKBENCH_TYPE_GLOBAL } from '@/views/components/portal/workbench-constants.js';

export default {
  name: 'GlobalWorkbenchEdit',
  components: { WorkbenchTemplateEdit },
  data() {
    return {
      workbenchType: WORKBENCH_TYPE_GLOBAL
    };
  }
};
</script>
