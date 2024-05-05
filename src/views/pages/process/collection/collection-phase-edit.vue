<template>
  <div class="bg-op radius-md padding-md">
    <Divider orientation="left">
      <div v-if="!isEditPhaseName">
        <span v-if="phaseDataLocal.name" style="font-weight: bold; font-size: 15px" class="text-grey">{{ sort }}·{{ phaseDataLocal.name }}</span>
        <span v-else style="font-weight: bold; font-size: 15px" class="text-grey">阶段{{ sort }}</span>
        <span class="tsfont-edit cursor text-grey" @click="isEditPhaseName = true"></span>
      </div>
      <div v-else>
        <TsFormInput
          v-model="phaseDataLocal.name"
          border="border"
          :maxlength="30"
          :width="200"
          @on-enter="isEditPhaseName = false"
        ></TsFormInput>
      </div>
    </Divider>
    <div v-if="phaseDataLocal.taskList.length === 0" class="radius-sm border-color-base padding" style="border-style: dashed; border-width: 2px; text-align: center">
      <span class="tsfont-plus cursor" @click="createProcessTask()">工单任务</span>
    </div>
    <Tabs
      v-else
      v-model="currentTab"
      closable
      name="collection-phase"
      :animated="false"
    >
      <TabPane
        v-for="task in phaseDataLocal.taskList"
        :key="task.channelUuid"
        tab="collection-phase"
        :name="task.channelUuid"
        :label="renderLabel(task)"
      >
        <ProcesstaskEdit
          v-if="task.channelUuid"
          ref="processTask"
          :taskData="task"
          :channelUuid="task.channelUuid"
        ></ProcesstaskEdit>
      </TabPane>
      <Button slot="extra" type="info" @click="createProcessTask()"><span class="tsfont-plus">工单任务</span></Button>
    </Tabs>
    <WorkOrderDialog v-if="isShowWorkOrderDialog" mode="emit" @close="closeWorkOrderDialog"></WorkOrderDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    WorkOrderDialog: resolve => require(['@/views/pages/process/leftmenu/work-order-dialog.vue'], resolve),
    ProcesstaskEdit: resolve => require(['@/views/pages/process/collection/processtask-edit.vue'], resolve)
  },
  props: {
    sort: { type: Number },
    phaseData: { type: Object }
  },
  data() {
    return {
      isEditPhaseName: false,
      currentTab: null,
      isShowWorkOrderDialog: false,
      phaseDataLocal: { name: '', taskList: [] }
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
  methods: {
    renderLabel(task) {
      return h => {
        const renderList = [];
        renderList.push(h('span', task.channelName));
        renderList.push(
          h('span', {
            class: {
              'tsfont-close': true,
              fz10: true,
              'ml-xs': true,
              'text-grey': true
            },
            on: {
              click: () => {
                const index = this.phaseDataLocal.taskList.findIndex(d => d.channelUuid === task.channelUuid);
                if (index > -1) {
                  this.removeProcessTask(task.channelUuid);
                }
              }
            }
          })
        );
        return h('div', renderList);
      };
    },
    createProcessTask() {
      this.isShowWorkOrderDialog = true;
    },
    removeProcessTask(uuid) {
      const index = this.phaseDataLocal.taskList.findIndex(d => d.channelUuid === uuid);
      if (index > -1) {
        this.phaseDataLocal.taskList.splice(index, 1);
        if (this.phaseDataLocal.taskList.length > 0) {
          this.currentTab = this.phaseDataLocal.taskList[this.phaseDataLocal.taskList.length - 1].channelUuid;
        }
      }
    },
    closeWorkOrderDialog(channel) {
      this.isShowWorkOrderDialog = false;
      if (!this.phaseDataLocal.taskList.find(d => d.channelUuid === channel.uuid)) {
        this.phaseDataLocal.taskList.push({
          channelUuid: channel.uuid,
          channelName: channel.name
        });
      }
      this.currentTab = channel.uuid;
    },
    getData() {
      const processTask = this.$refs.processTask;
      const taskList = [];
      if (processTask && processTask.length > 0) {
        processTask.forEach(d => {
          taskList.push(d.getData());
        });
      }
      this.phaseDataLocal.taskList = taskList;
      return this.phaseDataLocal;
    }
  },
  filter: {},
  computed: {},
  watch: {
    phaseData: {
      handler: function(val) {
        if (val) {
          this.phaseDataLocal = this.$utils.deepClone(val);
        } else {
          this.phaseDataLocal = { name: '', taskList: [] };
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less"></style>
