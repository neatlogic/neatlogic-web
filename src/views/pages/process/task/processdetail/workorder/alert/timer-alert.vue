/*
 * Copyright(c) 2023 NeatLogic Co., Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
<template>
  <div class="task-alert bg-op radius-sm align-center">
    <div class="tsfont-danger-o icon-tip text-primary"></div>
    <div v-if="triggerTime" class="alert-main">
      {{ $t('term.process.currentnodewillflowtime',{time: $utils.getDateByFormat(triggerTime)}) }}
      {{ $t('term.process.distanceflow') }}
      <span v-if="newDataTime(triggerTime)" class="text-primary">{{ newDataTime(triggerTime)|formatTimeCost({maxUnit:'hour',language:'zh'}) }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    
  },
  filters: {
  },
  props: {
    processTaskStepConfig: Object
  },
  data() {
    return {
      triggerTime: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {},
  computed: {
    newDataTime() {
      return function(val) {
        let nowDate = this.$store.state.now;
        let now = val - nowDate;
        if (now <= 0) { this.$emit('updateTask'); return false; }
        return now;
      };
    }
  },
  watch: {
    processTaskStepConfig: {
      handler(val) {
        if (val && val.handlerStepInfo && val.handlerStepInfo.triggerTime) {
          this.triggerTime = val.handlerStepInfo.triggerTime;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.task-alert{
  display: flex;
  margin-bottom: 16px;
  max-height: 134px;
  overflow-y: auto;
  padding: 12px 16px;
  .icon-tip{
    padding-left: 10px;
    width: 64px;
    font-size: 27px;
    flex-shrink: 0;
    line-height: 1;
  }
  .alert-main{
    flex: 1;
  }
}
</style>
