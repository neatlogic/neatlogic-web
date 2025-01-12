<template>
  <div
    class="current-step"
    :class="{ 'will-or-is-expired': ['will-be-expired', 'is-expired'].includes(rowData.expireStatus) }"
  >
    <component :is="getCurrentType(rowData)" :row="rowData" type="table"></component>
  </div>
</template>
<script>
import currentStepComponent from '@/views/pages/process/task/overview/workcenter/column/currentstep/index.js';
import mixin from '../column/mixin';
export default {
  components: {
    ...currentStepComponent
  },
  mixins: [mixin],
  computed: {
    getCurrentType() {
      return function(item) {
        let type = '';
        if (item && item.status && item.status.value) {
          if (Object.keys(currentStepComponent).indexOf(item.status.value) > -1) {
            type = item.status.value;
          } else {
            type = 'common';
          }
        } else {
          type = 'common';
        }
        return type;
      };
    }
  }
};
</script>
<style lang="less" scoped>
.current-step {
  position: relative;
  &.will-or-is-expired {
    .carouse-user-list {
      position: absolute;
      top: -60px;
      left: 0;
    }
  }
  .expired {
    padding-left: 20px;
    height: 47px;
    display: flex;
    align-items: center;
    &-status {
      font-size: 12px;
      margin-right: 5px;
    }
    &-duration {
      font-size: 30px;
      height: 42px;
      line-height: 42px;
    }
  }
}
</style>
