<template>
  <div class="autoexec-widget" :style="getTimeStyle">
    <div class="progress flex-start align-center" :style="{'margin-top': widget.border === 'gradient' ? '24px' : '0px'}">
      <div class="pr-xs">总进度</div>
      <div style="flex: 1; width: 80%;">
        <Progress
          v-if="isReady"
          :percent="percentData"
          :stroke-width="strokeWidth"
          status="active"
          text-inside
        /></div>
    </div>
    <div v-if="dataList && dataList.length>0" class="job-detail">
      <div class="item-list border-color">
        <div class="step-content">
          <div class="animate-spin step-node border-base radius-sm success border-color-success text-success">
            <span>开始</span>
          </div>
        </div>
        <span class="step_a tsfont-arrow-down text-success"></span>
      </div>
      <div
        v-for="(item,index) in dataList"
        :key="index"
        class="item-list border-color"
      >
        <div
          v-for="(litem,lindex) in item"
          :id="'step_' + litem.jobGroupSort + '_' + litem.jobPhaseName"
          :key="lindex"
          class="step-content"
        >
          <div class="step-node border-base radius-sm" :class="getStatusClassName(litem.jobPhaseStatus)" :title="litem.jobPhaseName">
            <span>{{ litem.jobPhaseName }}</span>
          </div>
        </div>
        <span class="step_a tsfont-arrow-down text-success"></span>
      </div>
      <div class="item-list border-color">
        <div class="step-content">
          <div class="step-node border-base radius-sm" :class="percentData == 100? 'success border-color-success text-success':'pending border-color'">
            <span>结束</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else><no-data></no-data></div>
    <div class="action-group no-line">
      <span class="block-item">
        <span class="color-tip bg-pending"></span>
        <span class="fz10">未开始</span>
      </span>
      <span class="block-item">
        <span class="color-tip bg-info"></span>
        <span class="fz10"> 进行中</span>
      </span>
      <span class="block-item">
        <span class="color-tip bg-warning"></span>
        <span class="fz10">已终止</span>
      </span>
      <span class="block-item">
        <span class="color-tip bg-error"></span>
        <span class="fz10">失败</span>
      </span>
      <span class="block-item">
        <span class="color-tip bg-success"></span>
        <span class="fz10">成功</span>
      </span>
    </div>
  </div>
</template>
<script>
import { WidgetBase } from '../widget-base.js';
import * as themes from '../../widgetthemes/index.js';
export default {
  name: '',
  components: {},
  extends: WidgetBase,
  props: {
  },
  data() {
    return {
      isFirst: true,
      isReady: true,
      statusMapClass: {
        pending: 'pending',
        completed: 'success border-color-success text-success', //成功
        running: 'running border-color-info text-info', //运行中
        failed: 'failed border-color-error text-error', //失败
        aborted: 'aborted border-color-warning text-warning' //中止
      },
      dataList: [],
      stepList: [
        {jobPhaseName: '步骤一', jobGroupSort: 0, jobPhaseStatus: 'completed'},
        {jobPhaseName: '步骤二', jobGroupSort: 0, jobPhaseStatus: 'completed'},
        {jobPhaseName: '步骤三', jobGroupSort: 0, jobPhaseStatus: 'completed'},
        {jobPhaseName: '步骤四', jobGroupSort: 0, jobPhaseStatus: 'completed'},     
        {jobPhaseName: '步骤一', jobGroupSort: 0, jobPhaseStatus: 'completed'},
        {jobPhaseName: '步骤二', jobGroupSort: 1, jobPhaseStatus: 'failed'},
        {jobPhaseName: '步骤三', jobGroupSort: 1, jobPhaseStatus: 'running'}
      ],
      percentData: 0
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
  beforeDestroy() {

  },
  destroyed() {},
  methods: {
    createRandomData() {
      this.isReady = false;
      this.dataList = this.getStepList(this.stepList); 
      this.getPercentData(this.stepList);
      this.$nextTick(() => {
        this.stepScrollIntoView(this.stepList);
        this.isReady = true;
      });
    },
    changeData() {
      this.isFirst = false;
      if (this.data && this.data.length > 0) {
        this.isReady = false;
        this.dataList = this.getStepList(this.data); 
        this.getPercentData(this.data);
        this.$nextTick(() => {
          this.stepScrollIntoView(this.data);
          this.isReady = true;
        });
      }
    },
    getStepList(stepList) {
      let list = [];
      if (stepList.length) {
        let groupSortList = stepList.filter(l => !this.$utils.isEmpty(l.jobGroupSort));
        if (groupSortList && groupSortList.length) {
          for (let sort = 0, index = 0; index < groupSortList.length;) {
            let arr = [];
            groupSortList.filter(l => {
              if (l.jobGroupSort == sort) {
                arr.push(l);
                index++;
                return true;
              }
            });
            sort++;
            arr.length && list.push(arr);
          }
        }
      }
      return list;
    },
    stepScrollIntoView(dataList) {
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].jobPhaseStatus === 'running' && this.$refs['#step_' + dataList[i].jobGroupSort + '_' + dataList[i].jobPhaseName]) {
          document.querySelector('#step_' + dataList[i].id).scrollIntoView({
            behavior: 'smooth', // 平滑过渡
            block: 'start' // start 上边框 center 中间 end 底部边框 与视窗顶部平齐
          });
          break;
        } 
      }
    },
    getPercentData(list) {
      //作业进度
      this.percentData = 0;
      if (list && list.length) {
        let i = 0;
        list.forEach(item => {
          if (['checked', 'success', 'completed'].includes(item.jobPhaseStatus)) {
            i += 1;
          }
        });
        if (i === list.length) {
          this.percentData = 100;
        } else {
          let num = i / list.length;
          this.percentData = num.toFixed(2) * 100;
        }
      }
    }
  },
  filter: {},
  computed: {
    getTimeStyle() {
      return {
        fontSize: this.widget && this.widget.config && this.widget.config.fontsize ? `${this.widget.config.fontsize}px` : '13px',
        color: this.canvas.config.theme && themes[this.canvas.config.theme] && themes[this.canvas.config.theme].labels && themes[this.canvas.config.theme].labels.fillColorDark
      };
    },
    strokeWidth() {
      return this.widget && this.widget.config && this.widget.config.fontsize ? this.widget.config.fontsize - 3 : 10; 
    },
    getStatusClassName() {
      return (jobPhaseStatus) => {
        let className = this.statusMapClass[jobPhaseStatus] || '';
        if (jobPhaseStatus && !className) {
          if (['pausing', 'paused', 'aborting', 'waitInput'].includes(jobPhaseStatus)) {
            className = this.statusMapClass['aborted'];
          } else if (['checked', 'success'].includes(jobPhaseStatus)) {
            className = this.statusMapClass['completed']; 
          }
        }
        return className;
      };
    }
  },
  watch: {
    data: {
      handler() {
        if (this.isFirst) {
          this.changeData();
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.autoexec-widget{
  position: relative;
  padding-bottom: 10px;
  .progress {
    width: 100%;
    padding-bottom: 30px;
  }
  .color-tip {
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-right: 4px;
  }
  .job-detail{
    width: 100%;
    margin: 0 auto;
  }
  .item-list {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
    .step-content {
      position: relative;
      display: inline-block;
      width: 20%;
      padding: 0 10px;
      .step-node {
        text-align: center;
        line-height: 50px;
        width: 100%;
        height: 50px;
        display: inline-block;
      }
    }
  }
  .step_a {
    position: absolute;
    left: 49%;
    transform: translateY(-49%);
    top: 64px;
  }
}
.pending{
  background-color: rgba(232, 232, 232, .1);
}
.success {
  background-color: rgba(37, 184, 100, .1);
}
.running{
  background-color: rgba(22, 112, 240, .1);
}
.aborted{
  background-color: rgba(255, 186, 90, .1);
}
.failed {
  background-color: rgba(243, 59, 59, .1);
}
</style>
