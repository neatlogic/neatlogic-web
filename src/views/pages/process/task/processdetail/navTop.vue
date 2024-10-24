<template>
  <div>
    <!-- 返回功能的公共组件
    功能如下：
    1、任务列表 的显示和隐藏功能
    2、优先级
    3、工单中心标题 -->
    <div v-if="processTaskConfig">
      <span class="text-action tsfont-bar mr-md" @click="isTslayout"></span>
      <span v-if="processTaskConfig.priority && isActivePriority" class="channel-type fz10" :style="typeTip(processTaskConfig.priority.color)">{{ processTaskConfig.priority.name }}</span>
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
            <span v-if="sla.slaTimeDisplayMode == 'workTime'" :class="getClassName(sla.timeLeft)">
              {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
            <span v-else-if="sla.slaTimeDisplayMode == 'naturalTime'" :class="getClassName((sla.expireTime - baseTime))">
              {{ (sla.expireTime - baseTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
            <span v-else class="text-danger">
              {{ (baseTime - sla.expireTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
          </span>
          <span v-else-if="sla.status == 'pause'">
            <!-- 暂停 -->
            <span v-if="sla.timeLeft >= 0" class="text-success">{{ $t('page.remainingtime') }}</span>
            <span v-else class="text-danger">{{ $t('page.overtime') }}</span>
            <span v-if="sla.slaTimeDisplayMode == 'workTime'" :class="getClassName(sla.timeLeft)">
              {{ sla.timeLeft | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
            </span>
            <span v-else-if="sla.slaTimeDisplayMode == 'naturalTime'" :class="getClassName((sla.expireTime - baseTime))">
              {{ (sla.expireTime - baseTime) | formatTimeCost({unitNumber: 3, language: 'zh', separator: ' ', unit: 'minute' }) }}
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
      boxMaxWidth: 200,
      processTaskId: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getElementWidth();
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
      this.$nextTick(() => {
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
      });
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
    UpdateSlaTimeDoing(isRefresh = false) {
      // 更新sla
      if (this.slaUpdateTimer) {
        clearTimeout(this.slaUpdateTimer);
        this.slaUpdateTimer = null;
      }
      if (!isRefresh) {
        return;
      }
      this.slaTimeList = [];
      let tempSlaTimeList = [];
      let data = {
        processTaskId: this.processTaskId
      };
      this.$api.process.processtask.getStepStatusList(data).then(res => {
        if (res.Status === 'OK') {
          this.baseTime = Date.now();
          let slaTimeList = [];
          let stepList = res.Return || [];
          let hasDoingStatus = false;
          stepList && stepList.forEach((item) => {
            if (item.isInTheCurrentStepTab === 1) {
              if (!this.$utils.isEmpty(item.slaTimeList)) { // 当前步骤关联多个SLA时，仅仅显示最紧迫的一个(默认第一个，后端已排序)
                tempSlaTimeList.push(item.slaTimeList[0]);
              }
              slaTimeList = [...slaTimeList, ...(item.slaTimeList || [])];
              item.slaTimeList.forEach(v => {
                if (v.status === 'doing') {
                  hasDoingStatus = true;
                }
              });
            }
          });
          this.$store.commit('setTaskSlaTimeList', slaTimeList); // 设置工单时效
          this.getElementWidth();
          this.slaUpdateTimer = setTimeout(() => {
            this.UpdateSlaTimeDoing(hasDoingStatus);
          }, 60 * 1000);
          if (!this.$utils.isEmpty(tempSlaTimeList)) {
            if (tempSlaTimeList.length === 1) {
              this.slaTimeList = tempSlaTimeList;
            } else if (tempSlaTimeList.length > 1) {
              this.slaTimeList = [tempSlaTimeList[0]];
            } else {
              this.slaTimeList = [];
            }
          }
        }
      });
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
    isActivePriority() {
      return this.processTaskConfig.hasOwnProperty('isActivePriority') ? this.processTaskConfig.isActivePriority : 1;
    },
    getClassName() {
      return (remainTime) => (remainTime) >= 0 ? 'text-success' : 'text-danger';
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
      handler(newVal) {
        let {id = ''} = newVal || {};
        if (!this.$utils.isEmpty(id)) {
          if (!this.$utils.isSame(this.processTaskId, id)) { 
            this.processTaskId = this.$utils.deepClone(id);
            this.UpdateSlaTimeDoing(true);
          }
        } else {
          this.$store.commit('setTaskSlaTimeList', []); // 清空工单时效
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
