<template>
  <div>
    <!-- 返回功能的公共组件
    功能如下：
    1、任务列表 的显示和隐藏功能
    2、优先级
    3、工单中心标题 -->
    <div v-if="processTaskConfig">
      <span class="text-action tsfont-bar mr-md" @click="isTslayout"></span>
      <span v-if="processTaskConfig.priority && isNeedPriority" class="channel-type fz10" :style="typeTip(processTaskConfig.priority.color)">{{ processTaskConfig.priority.name }}</span>
      <span v-if="!isEdit">
        <span class="task-title overflow" :title="title" style="max-width:200px;">{{ title }}</span>
        <i v-if="actionConfig && actionConfig.update" class="tsfont-edit text-action" @click="editTitle(title)"></i>
      </span>
      <span v-if="isEdit" class="edit-title">
        <TsFormInput
          ref="titleInput"
          v-model="title"
          maxlength="50"
          border="bottom"
          @on-blur="changeTitle(title)"
        ></TsFormInput>
      </span>
      <!-- SLA倒计时 -->
      <template v-if="!$utils.isEmpty(slaTimeList)">
        <span v-for="(sla, slaIndex) in slaTimeList" :key="slaIndex" class="pl-sm">
          <span v-if="sla.status == 'doing'">
            <span v-if="sla.timeLeft >= 0" class="text-success">{{ $t('page.remainingtime') }}</span>
            <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
            <span v-if="sla.timeLeft >= 0 || sla.displayModeAfterTimeout == 'workTime'" class="text-success">
              {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
            <span v-else class="text-danger">
              {{ (baseTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
          </span>
          <span v-else-if="sla.status == 'pause'">
            <!-- 暂停 -->
            <span v-if="sla.timeLeft >= 0" class="text-success">{{ $t('page.remainingtime') }}</span>
            <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
            <span v-if="sla.timeLeft >= 0 || sla.displayModeAfterTimeout == 'workTime'" class="text-success">
              {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
            <span v-else class="text-danger">
              {{ (baseTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
          </span>
          <span v-else-if="sla.status == 'done'">
            <!-- 完成 -->
            <span class="text-warning">{{ $t('page.timecost') }}</span>
            <span>
              {{ (sla.timeSum - sla.timeLeft) | formatTimeCost({unitNumber: 3, separator: ' ', unit: 'minute' }) }}
            </span>
          </span>
        </span>
      </template>
      <!-- SLA倒计时 -->
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  provide() {
    return {
    };
  },
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    taskTitle: String,
    prevPath: Object,
    actionConfig: Object,
    isEditTitle: Boolean,
    processTaskConfig: Object
  },
  data() {
    return {
      title: '',
      isEdit: false,
      baseTime: Date.now()
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changeTitle(title) {
      if (title) {
        this.isEdit = false;
        this.$emit('changeTitle', title);
      } else {
        this.$Notice.error({
          title: this.$t('form.validate.required', {target: this.$t('page.title')})
        });
        this.$nextTick(() => {
          this.$refs.titleInput.focus();
        });
      }
    },
    editTitle(title) {
      this.$emit('editTitle', title);
      this.title = title;
      this.isEdit = true;
      this.$nextTick(() => {
        this.$refs.titleInput && this.$refs.titleInput.focus();
      });
    },
    toPrevpath() {
      let uuid = sessionStorage.getItem('processTaskUuid');
      let url = '';
      if (uuid) {
        url = '/task-overview-' + uuid; 
      } else {
        let allClassifyData = this.$store.state.leftMenu.workcenterList;
        if (allClassifyData && allClassifyData.length) {
          url = '/task-overview-' + allClassifyData[0].uuid;
        }
      }
      this.$backTo(url);
    },
    isTslayout() {
      this.$emit('isTslayout');
    }
  },
  filter: {},
  computed: {
    typeTip() {
      return function(color) {
        return {
          'background-color': color + '23',
          color: color,
          'border-color': color
        };
      };
    },
    isNeedPriority() {
      return this.processTaskConfig.hasOwnProperty('isNeedPriority') ? this.processTaskConfig.isNeedPriority : 1;
    },
    slaTimeList() {
      let list = [];
      if (!this.$utils.isEmpty(this.processTaskConfig.currentProcessTaskStep) && !this.$utils.isEmpty(this.processTaskConfig.currentProcessTaskStep.slaTimeList)) {
        this.processTaskConfig.currentProcessTaskStep.slaTimeList.forEach((item, index) => {
          if (index == 0) { // 当前步骤关联多个SLA时，仅仅显示最紧迫的一个
            list.push(item);
          }
        });
      }
      return list;
    }
  },
  watch: {
    taskTitle: {
      handler(val) {
        this.title = val;
      },
      immediate: true 
    },
    isEditTitle: {
      handler(val) {
        this.isEdit = !!val;
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.channel-type{
  margin-right: 6px;
  border-radius: 16px;
  padding: 0 6px;
  line-height: 16px;
}
</style>
