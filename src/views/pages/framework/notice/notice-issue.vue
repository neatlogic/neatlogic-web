<template>
  <TsDialog
    className="notice-issue"
    :isShow="isShow"
    :title="$t('page.noticeissued')"
    @on-close="$emit('update:isShow', false)"
    @on-ok="issue"
  >
    <div class="mb-nm">
      <span>{{ $t('term.framework.noticeeffectivetime') }}</span>
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
    <div class="text-grey mb-nm">{{ $t('term.framework.nostarttimedesc') }}</div>
    <div class="mb-nm">
      <Checkbox v-model="issueConfig.popUp" trueValue="longshow" falseValue="close">{{ $t('page.popreminder') }}</Checkbox>
    </div>
    <div class="mb-xs">
      <Checkbox
        v-if="issueConfig.popUp === 'longshow'"
        v-model="issueConfig.ignoreRead"
        :trueValue="1"
        :falseValue="0"
        :style="{ 'margin-right': 0 }"
      >{{ $t('page.ignoreread') }}</Checkbox>
    </div>
    <div class="text-grey">{{ $t('term.framework.nopopupdesc') }}</div>
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
        placeholder: this.$t('page.starttime'),
        border: 'border',
        options: {
          disabledDate: date => date < this.today || (this.issueConfig.endTime && date > this.issueConfig.endTime)
        }
      },
      endTimeConfig: {
        transfer: true,
        type: 'datetime',
        placeholder: this.$t('page.endtime'),
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
      this.$Message.success(this.$t('message.refreshsuccess'));
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
