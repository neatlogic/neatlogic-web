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
  <div v-if="isShow" class="information-box">
    <div class="bg-op padding radius-lg">
      <div class="h4 pb-nm">{{ $t('term.process.currentstep') }}</div>
      <Carousel
        v-if="isShow"
        v-model="value"
        trigger="hover"
        arrow="never"
        :dots="stepList && stepList.length < 2 ? 'none' : 'inside'"
        class="Carousel"
      >
        <template v-if="isShow">
          <CarouselItem v-for="(object,sindex) in stepList" :key="sindex">
            <div v-for="(item, index) in getStepInformationList(object)" :key="'step'+index" class="information-list">
              <template v-if="item.value == 'majorUser'">
                <div class="infor-left text-grey overflow">{{ item.title }}</div>
                <div class="infor-right">
                  <UserCard v-bind="item.textConfig.userVo" :iconSize="16"></UserCard>
                  <span v-if="object.originalUserVo">
                    <span style="vertical-align: bottom;">（{{ $t('term.process.act') }}</span>
                    <UserCard v-bind="object.originalUserVo" :iconSize="16"></UserCard>
                    <span style="vertical-align: bottom;">）</span>
                  </span>
                </div>
              </template>
              <template v-else-if="item.value == 'workerList' && item.textConfig.length > 0">
                <div v-if="item.textConfig.length > 0" class="infor-left text-grey overflow">{{ item.title }}</div>
                <div class="infor-right">
                  <span class="minoruser-list">
                    <span><UserCard
                      v-for="(user, uindex) in item.textConfig"
                      :key="uindex"
                      v-bind="user.worker"
                      :iconSize="16"
                      class="minoruser-item"
                    ></UserCard></span>
                  </span>
                </div>
              </template>
              <template v-else-if="item.value == 'statusVo'">
                <div class="infor-left text-grey overflow">{{ item.title }}</div>
                <div class="infor-right">
                  {{ item.textConfig.text }}
                </div>
              </template>
              <template v-else-if="timeShow(item.value)">
                <div class="infor-left text-grey overflow">{{ item.title }}</div>
                <div class="infor-right">{{ item.textConfig | formatDate }}</div>
              </template>
              <template v-else>
                <div class="infor-left text-grey overflow">{{ item.title }}</div>
                <div class="infor-right">{{ item.textConfig }}</div>
              </template>
            </div>
          </CarouselItem>
        </template>
      </Carousel>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  filters: {
  },
  props: {
  },
  data() {
    return {
      value: 0,
      stepList: [],
      processTaskId: null,
      defaultProcessTaskStep: [
        //步骤信息
        {
          title: this.$t('term.process.stepname'),
          value: 'name',
          textConfig: null
        },
        {
          title: this.$t('term.process.dealwithuser'),
          value: 'majorUser',
          textConfig: null
        },
        {
          title: this.$t('term.process.pendinguser'),
          value: 'workerList',
          textConfig: null
        },
        {
          title: this.$t('term.process.stepstatus'),
          value: 'statusVo',
          textConfig: null
        },
        {
          title: this.$t('term.process.changestatus'),
          value: 'changeStatusVo',
          textConfig: null
        },
        {
          title: this.$t('page.activationtime'),
          value: 'activeTime',
          textConfig: null
        },
        {
          title: this.$t('page.starttime'),
          value: 'startTime',
          textConfig: null
        },
        {
          title: this.$t('page.endtime'),
          value: 'endTime',
          textConfig: null
        },
        {
          title: this.$t('page.timeout'),
          value: 'expireTime',
          textConfig: null
        }
      ],
      processTaskStepId: null,
      isShow: false
    };
  },
  beforeCreate() {},
  created() {
    this.processTaskId = parseInt(this.$route.query.processTaskId);
    this.$route.query.processTaskStepId && (this.processTaskStepId = parseInt(this.$route.query.processTaskStepId));
  },
  beforeMount() {},
  mounted() {
    this.getStepStatusList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getStepStatusList() {
      //步骤
      this.isShow = false;
      let data = {
        processTaskId: this.processTaskId
      };
      let _this = this;
      this.$api.process.processtask.getStepStatusList(data).then(res => {
        if (res.Status == 'OK') {
          let list = res.Return || [];
          let stepDataList = list.filter(i => {
            return i.isActive == 1 && (i.status == 'pending' || i.status == 'running');
          });
          if (stepDataList.length > 0) {
            let findIndex = -1;
            _this.stepList = _this.$utils.deepClone(stepDataList);
            _this.processTaskStepId && (findIndex = _this.stepList.findIndex(f => f.id == _this.processTaskStepId));
            findIndex > -1 && (this.value = findIndex);
            _this.isShow = true;
          }
        }
      });
    }
  },
  computed: {
    getStepInformationList() {
      return data => {
        let config = this.$utils.deepClone(data);
        let stepInfoList = this.$utils.deepClone(this.defaultProcessTaskStep);
        let list = [];
        stepInfoList.forEach(item => {
          if (config[item.value]) {
            item.textConfig = config[item.value];
            if (!Array.isArray(config[item.value])) {
              list.push(item);
            } else if (Array.isArray(config[item.value]) && config[item.value].length > 0) {
              list.push(item);
            }
          }
          if (item.value == 'changeStatusVo' && config.handlerStepInfo && config.handlerStepInfo.statusVo) {
            //变更状态
            item.textConfig = config.handlerStepInfo.statusVo.text;
            list.push(item);
          }
        });
        return list;
      };
    },
    timeShow() {
      //时间类型展示
      return function(value) {
        let timeList = ['startTime', 'endTime', 'expireTime', 'activeTime'];
        let exp = timeList.find(item => value.includes(item));
        if (typeof exp == 'undefined') {
          return false;
        } else {
          return true;
        }
      };
    }
  },
  watch: {
  }
};
</script>
<style lang="less" scoped>
.pb-16{
  padding-bottom: 16px;
}
.Carousel {
  width: 248px;
  height: auto;
  /deep/.ivu-carousel-item {
    padding: 0 1px;
  }
  /deep/.ivu-carousel-dots {
    bottom: 0px;
    position: relative;
    li {
      margin: 0 6px;
      padding: 0px;

      button {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
    }
  }
}
.information-box{
  padding-bottom: 16px;
  .information-title{
    padding-bottom: 16px;
    font-size: 12px;
  }
}
.information-list {
  display: flex;
  align-items: flex-start;
  padding-bottom: 16px;
  &:last-child{
    padding-bottom: 10px;
  }
  .infor-left {
    font-size: 12px;
    line-height: 18px;
    width: 72px;
    text-align: right;
    flex-shrink: 0;
  }

  .infor-right {
    flex-grow:1;
    flex-shrink: 1;
    padding-left: 16px;
    word-break:break-all;
    .task-id {
      position: relative;
      display: inline-block;
      vertical-align: unset;
      cursor: copy;
      padding-right: 20px;
      .tsfont-copy {
        position: absolute;
        right: -4px;
        top: 0;
      }
    }
    &.flew-box{
      display: flex;
    }
  }
  .knowledge-style{
    padding-left: 4px;
  }
  .add-assist {
    border: 1px solid;
    padding: 0px 4px 0px 8px;
    border-radius: 2px;
  }
  .minoruser-list {
    padding-right: 4px;
    .minoruser-item {
      position: relative;
      display: inline-block;
      padding-right: 16px;
    }
  }
}
</style>
