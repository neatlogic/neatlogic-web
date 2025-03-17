<template>
  <div :style="getTimeStyle">
    <div class="progress flex-start align-center">
      <div class="pr-xs">总进度</div>
      <div style="flex: 1; width: 80%;">
        <Progress
          :percent="45"
          :stroke-width="strokeWidth"
          status="active"
          text-inside
        /></div>
    </div>
    <div v-if="dataList && dataList.length>0" class="job-detail">
      <div
        v-for="(item,index) in dataList"
        :key="index"
        class="item-list border-color"
      >
        <div
          v-for="(litem,lindex) in item.children"
          :key="lindex"
          class="step-content"
        >
          <div class="step-node border-base radius-sm" :title="litem.name">
            <span>{{ litem.name }}</span>
          </div>
        </div>
        <span v-if="index < dataList.length-1" class="step_a tsfont-arrow-down text-success"></span>
      </div>
    </div>
    <div class="action-group no-line">
      <span class="block-item">
        <span class="color-tip bg-gray"></span>
        <span class="fz10">未开始</span></span>
      <span class="block-item">
        <span class="color-tip bg-info"></span>
        <span class="fz10">进行中</span>
      </span>
      <span class="block-item">
        <span class="color-tip bg-warning"></span>
        <span class="fz10">已禁用</span>
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
      strokeWidthMap: {
        13: 10,
        16: 14,
        20: 18
      },
      dataList: [
        {
          children: [
            {name: '步骤一', status: 'success'},
            {name: '步骤二', status: 'success'},
            {name: '步骤三', status: 'success'},
            {name: '步骤四', status: 'success'}
          ]
        },
        {
          children: [
            {name: '步骤一', status: 'success'},
            {name: '步骤二', status: 'success'},
            {name: '步骤三', status: 'success'},
            {name: '步骤四', status: 'success'}
          ]
        }
      ]
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
      return this.widget && this.widget.config && this.widget.config.fontsize ? this.strokeWidthMap[this.widget.config.fontsize] : 10; 
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.progress {
  margin-bottom: 30px;
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
      line-height: 69px;
      width: 100%;
      height: 69px;
      display: inline-block;
    }
  }
}
.step_a {
  position: absolute;
  left: 49%;
  transform: translateY(-49%);
  top: 85px;
}
</style>
