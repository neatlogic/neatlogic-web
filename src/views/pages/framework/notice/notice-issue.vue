<template>
  <TsDialog
    className="notice-issue"
    :isShow="isShow"
    title="公告下发"
    @on-close="$emit('update:isShow', false)"
    @on-ok="issue"
  >
    <div class="mb-nm">
      <span>公告生效时间</span>
    </div>
    <div class="grid mb-xs">
      <div>
        <TsFormDatePicker v-model="issueConfig.startTime" class="time-select" v-bind="startTimeConfig" />
      </div>
      <div>
        <span>~</span>
      </div>
      <div>
        <TsFormDatePicker v-model="issueConfig.endTime" class="time-select" v-bind="endTimeConfig" />
      </div>
    </div>
    <div class="text-grey mb-nm">若不指定开始时间，则公告即刻下发；若不指定结束时间，公告需要手动停止。</div>
    <div class="mb-nm">
      <Checkbox v-model="issueConfig.popUp" trueValue="longshow" falseValue="close">弹窗提醒</Checkbox>
    </div>
    <div class="mb-xs">
      <Checkbox
        v-if="issueConfig.popUp === 'longshow'"
        v-model="issueConfig.ignoreRead"
        :trueValue="1"
        :falseValue="0"
        :style="{ 'margin-right': 0 }"
      >忽略已读</Checkbox>
    </div>
    <div class="text-grey">再次下发时，已查看过上次公告的用户将不再弹窗提醒。</div>
  </TsDialog>
</template>

<script>
export default {
  name: 'NoticeIssue',
  components: {
    TsFormDatePicker: resolve => require(['@/resources/plugins/TsForm/TsFormDatePicker'], resolve)
  },
  props: {
    isShow: { type: Boolean, default: false },
    notice: { type: Object, default: () => {} }
  },
  data() {
    return {
      today: new Date().setHours(0, 0, 0, 0),
      issueConfig: {
        id: null,
        startTime: null,
        endTime: null,
        popUp: 'close',
        ignoreRead: 1
      },
      startTimeConfig: {
        transfer: true,
        type: 'datetime',
        placeholder: '开始时间',
        border: 'border',
        options: {
          disabledDate: date => date < this.today || (this.issueConfig.endTime && date > this.issueConfig.endTime)
        }
      },
      endTimeConfig: {
        transfer: true,
        type: 'datetime',
        placeholder: '结束时间',
        border: 'border',
        options: {
          disabledDate: date => date < this.today || date + 1000 * 60 * 60 * 24 - 1 < this.issueConfig.startTime
        }
      }
    };
  },
  methods: {
    async issue() {
      if (!this.issueConfig.startTime || this.issueConfig.startTime < Date.now()) {
        this.issueConfig.startTime = Date.now();
      }
      await this.$api.framework.notice.issue(this.issueConfig);
      this.$Message.success('下发成功');
      this.$emit('on-issue');
      this.$emit('update:isShow', false);
    }
  },
  watch: {
    'issueConfig.popUp'(popUp) {
      if (popUp === 'longshow') {
        this.issueConfig.ignoreRead = 1;
      }
    },
    isShow(visible) {
      if (visible) {
        for (let i in this.issueConfig) {
          this.issueConfig[i] = this.notice[i] || this.issueConfig[i];
        }
        if (!this.issueConfig.startTime || this.issueConfig.startTime < Date.now()) {
          this.issueConfig.startTime = Date.now();
        }
      } else {
        this.$emit('update:notice', {});
        this.issueConfig = {
          id: null,
          startTime: null,
          endTime: null,
          popUp: 'close',
          ignoreRead: 1
        };
      }
    }
  }
};
</script>

<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: auto 20px auto;
  text-align: center;
}
</style>
