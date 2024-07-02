<template>
  <div class="nav-top-box">
    <!-- 返回功能的公共组件
    功能如下：
    1、任务列表 的显示和隐藏功能
    2、优先级
    3、工单中心标题 -->
    <div v-if="processTaskConfig">
      <span class="text-action tsfont-bar mr-md" @click="isTslayout"></span>
      <span v-if="processTaskConfig.priority && isNeedPriority" class="channel-type fz10" :style="typeTip(processTaskConfig.priority.color)">{{ processTaskConfig.priority.name }}</span>
      <div ref="leftInstanceBox" class="inline-block">
        <span v-if="!isEdit">
          <span
            class="task-title overflow inline-block"
            :title="title"
            :style="{maxWidth: `${boxMaxWidth}`}"
          >{{ title }}</span>
          <i v-if="actionConfig && actionConfig.update" class="tsfont-edit text-action" @click="editTitle(title)"></i>
        </span>
        <span v-if="isEdit" class="edit-title">
          <TsFormInput
            ref="titleInput"
            v-model="title"
            maxlength="200"
            border="bottom"
            :width="boxMaxWidth"
            @on-blur="changeTitle(title)"
          ></TsFormInput>
        </span>
      </div>
    
      <!-- SLA倒计时 -->
      <div v-if="!$utils.isEmpty(slaTimeList)" ref="slatimeBox" class="inline-block">
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
      </div>
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
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
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
      baseTime: Date.now(),
      slaUpdateTimer: null,
      slaTimeList: [],
      boxMaxWidth: 200
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.getElementWidth();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {
    if (this.slaUpdateTimer) {
      clearTimeout(this.slaUpdateTimer);
      this.slaUpdateTimer = null;
    }
  },
  methods: {
    getElementWidth() {  
      let toolbarRightElement = document.querySelector('.toolbar-right');
      let leftInstanceBox = this.$refs?.leftInstanceBox || 0;
      let slatimeWidth = this.$refs?.slatimeBox?.offsetWidth || 0;
      let totalLeftWidth = 0; // 到左边菜单栏的宽度
      let rightWidth = 0;
      if (toolbarRightElement) {
        rightWidth = toolbarRightElement.offsetWidth;
      }
      let navTopElement = leftInstanceBox;
      while (navTopElement) {
        if (navTopElement.offsetLeft !== undefined) { // 确保offsetLeft存在  
          totalLeftWidth += navTopElement.offsetLeft;  
        }
        navTopElement = navTopElement.offsetParent;  
      }
      this.boxMaxWidth = `calc(100vw - ${totalLeftWidth}px - ${rightWidth}px - ${slatimeWidth}px - 40px)`;
    },
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
        this.getElementWidth();
      });
    },
    isTslayout() {
      this.$emit('isTslayout');
    },
    UpdateSlaTimeDoing(slaIdList) {
      // 更新sla
      this.slaTimeList = [];
      let tempSlaTimeList = [];
      if (this.slaUpdateTimer) {
        clearTimeout(this.slaUpdateTimer);
        this.slaUpdateTimer = null;
      }
      if (this.$utils.isEmpty(slaIdList)) {
        return;
      }
      this.$api.process.processtask.slaTimeList({slaIdList: slaIdList}).then(res => {
        if (res.Status === 'OK') {
          this.baseTime = Date.now();
          let tbodyList = res.Return.tbodyList || [];
          let doingSlaIdList = [];
          tbodyList && tbodyList.forEach((item, index) => {
            if (item.status === 'doing') {
              doingSlaIdList.push(item.slaId);
            }
            if (index == 0) { // 当前步骤关联多个SLA时，仅仅显示最紧迫的一个(默认第一个，后端已排序)
              tempSlaTimeList.push(item);
            }
          });
          this.$store.commit('setTaskSlaTimeList', tbodyList); // 设置工单时效
          this.slaUpdateTimer = setTimeout(() => {
            this.UpdateSlaTimeDoing(doingSlaIdList);
          }, 60 * 1000);
        }
      });
      this.slaTimeList = tempSlaTimeList;
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
    },
    processTaskConfig: {
      handler(taskConfig) {
        let slaIdList = [];
        if (!this.$utils.isEmpty(taskConfig.currentProcessTaskStep) && !this.$utils.isEmpty(taskConfig.currentProcessTaskStep.slaTimeList)) {
          taskConfig.currentProcessTaskStep.slaTimeList.forEach(item => {
            if (item.status === 'doing') {
              slaIdList.push(item.slaId);
            }
          });
          if (!this.$utils.isEmpty(slaIdList)) {
            this.UpdateSlaTimeDoing(slaIdList);
          }
        }
      },
      immediate: true,
      deep: true
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
.inline-block {
  display: inline-block;
}
</style>
