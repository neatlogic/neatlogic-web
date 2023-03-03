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
  <div v-if="handlerStepInfo" class="job-detail" @click="gotoJopDetail()">
    <div v-if="dataList && dataList.length>0" class="step-List border-color">
      <div
        v-for="(item,index) in dataList"
        :key="index"
        class="item-list border-color"
        :class="index > 0?'left-margin':'no-margin'"
      >
        <div
          v-for="(litem,lindex) in item"
          :key="lindex"
          class="step-content border-color"
          :class="lindex===0?'left-connector':''"
        >
          <div class="curve border-color"></div>
          <div class="step-node overflow border-base bg-op radius-sm com-status" :title="litem.name">
            <i v-if="litem.statusVo" class="tsfont-check-o" :class="getIconClass(litem.statusVo.name)"></i>
            <span>{{ litem.name }}</span>
          </div>
        </div>
      </div>
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
    handlerStepInfo: Object
  },
  data() {
    return {
      dataList: [],
      statusIcon: {
        pausing: 'tsfont-minus-o', //暂停中
        paused: 'tsfont-minus-o', //已暂停
        aborting: 'tsfont-minus-o', //中止中
        aborted: 'tsfont-minus-o', //已中止
        pending: 'tsfont-timer', //待运行
        ready: 'tsfont-timer', //已就绪
        completed: 'tsfont-check-o', //已完成
        failed: 'tsfont-close-o', //已失败
        waitInput: 'tsfont-zichanshuruzujian', //待输入
        running: 'tsfont-refresh' //运行中
      }
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
    gotoJopDetail() { //查看作业
      window.open(HOME + '/autoexec.html#/job-detail?id=' + this.handlerStepInfo.id, '_blank');
    }
  },
  computed: {
    getIconClass() {
      return (status) => {
        let iconClass = 'text-' + status;
        iconClass += this.statusIcon[status] ? ' ' + this.statusIcon[status] : ' tsfont-refresh';
        return iconClass;
      };
    }
  },
  watch: {
    handlerStepInfo: {
      handler(val) {
        if (val) {
          let list = [];
          let phaseList = val.phaseList || [];
          if (phaseList.length) {
            for (let sort = 0, index = 0; index < phaseList.length;) {
              let arr = [];
              phaseList.filter(l => {
                if (l.jobGroupVo.sort == sort) {
                  arr.push(l);
                  index++;
                  return true;
                }
              });
              sort++;
              list.push(arr);
            }
          }
          this.dataList = list;
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/components/Status/status.less';
.job-detail{
  width: 100%;
  height: 100%;
  overflow-x: auto;
  cursor: pointer;
  .step-List{
    word-break: keep-all;
    white-space: nowrap;
    display: flex;
    .item-list{
      .step-content{
        position: relative;
        width: 130px;
        margin-bottom: 10px;
        white-space: normal;
      }
      .step-node {
        height: 48px;
        line-height: 48px;
        padding: 0 10px;
        > i {
          font-size: 16px;
          padding-right: 6px;
        }
      }
    }
  }
}
// 曲线
.item-list {
  display: inline-block;
  vertical-align: top;
  &:not(:last-child) {
    margin-right: 40px;
  }
  &.left-margin:not(:first-child) {
    margin-left: 40px;
    .left-connector {
      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: -40px;
        width: 40px;
        height: 1px;
        border-top: 1px solid;
        border-color: inherit;
      }
    }
  }
  &:last-child .step-content:first-child::after {
    border: 0;
  }
  &:last-child .step-content:not(:first-child)::after {
    border: 0;
  } 
  .step-content {
    &:first-child::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -48px;
      border-top: 1px solid;
      width: 48px;
      height: 1px;
      border-color: inherit;
    }
    &:not(:first-child)::before,
    &:not(:first-child)::after {
      content: '';
      top: -49px;
      position: absolute;
      border-bottom: 1px solid;
      border-color: inherit;
      width: 22px;
      height: 69px;
    }
    &:not(:first-child)::before {
      left: -21px;
      border-left: 1px solid;
      border-radius: 0 0 0 15px;
      border-color: inherit;
    }
    &:not(:first-child)::after {
      right: -21px;
      border-right: 1px solid;
      border-radius: 0 0 15px;
      border-color: inherit;
    }
    &:nth-child(2)::after, 
    &:nth-child(2)::before {
      height: 29px;
      top: -9px;
    }
    &:nth-child(2) .curve {
      display: block;
    }
  }
  .curve {
    display: none;
    &:before,
    &:after {
      content: '';
      width: 20px;
      height: 25px;
      position: absolute;
      top: -34px;
      border-top: 1px solid;
      border-color: inherit;
    }
    &:before {
      right: -40px;
      border-left: 1px solid;
      border-color: inherit;
      border-radius: 20px 0 0;
    }
    &:after {
      left: -40px;
      border-right: 1px solid;
      border-color: inherit;
      border-radius: 0 20px;
    }
  }
  &:last-child .step-content .curve::before {
    display: none
  }
  &:first-child .step-content .curve::after {
    display: none
  }
}
</style>
