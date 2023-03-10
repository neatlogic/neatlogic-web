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
  <div class="subtask-detail">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-if="processTaskStepTaskList && processTaskStepTaskList.length" class="item-main">
      <div v-for="(item) in processTaskStepTaskList" :key="item.id" class="item-list border-color">
        <TsRow class="mb-xs">
          <Col span="8">
            <span class="text-title">{{ $t('term.process.policy') }}</span>
            <span class="text-default">{{ item.taskConfigPolicyName }}</span>
          </Col>
          <Col span="12" class="time">
            <span class="text-title">{{ $t('page.starttime') }}</span>
            <span class="text-default">{{ item.createTime | formatDate }}</span>
          </Col>
        </TsRow>
        <TsRow>
          <Col span="24">
            <div class="content-main">
              <span class="text-title">{{ $t('page.description') }}</span>
              <span class="text-default" v-html="item.content"></span>
            </div>
          </Col>
        </TsRow>
        <div class="mt-md">
          <TsTable    
            :tbodyList="item.tbodyList"
            :theadList="theadList"
            :height="'280'"
            keyName="id"
          >
            <template slot="userUuid" slot-scope="{ row }">
              <div class="task-user" :class="{'text-disabled':row.isDelete == 1}">
                <UserCard
                  :uuid="row.userUuid"
                  :initType="row.userVo.initType"
                ></UserCard>
                <template v-if="row.originalUserUuid">
                  （代<UserCard :uuid="row.originalUserUuid" hideAvatar></UserCard>）
                </template>
              </div>
            </template>
            <template slot="endTime" slot-scope="{ row }">
              <span :class="{'text-disabled':row.isDelete == 1}">{{ row.endTime | formatDate }}</span>
            </template>
            <template slot="content" slot-scope="{ row }">
              <div :class="{'text-disabled':row.isDelete == 1}">
                <span v-html="row.content"></span>
              </div>
            </template>
          </TsTable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'StrategyDetailReadonly',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard'], resolve)
  },
  filters: {
  },
  props: {
    processTaskId: [String, Number], //工单id
    processTaskStepId: [String, Number], //工单步骤id
    config: Object //策略数据
  },
  data() {
    return {
      loadingShow: true,
      stepConfig: null,
      processTaskStepTaskList: [],
      theadList: [
        {
          title: this.$t('term.process.dealwithuser'),
          key: 'userUuid',
          type: 'user',
          uuid: 'userUuid'
        },
        {
          title: this.$t('page.replytime'),
          key: 'endTime',
          type: 'time'
        }, {
          title: this.$t('page.reply'),
          key: 'content',
          type: 'html',
          maxLength: '50'
        }, {
          title: this.$t('page.accessory'),
          key: 'fileList',
          type: 'file'
        }
      ]
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
    initData(val) {
      this.stepConfig = this.$utils.deepClone(val);
      this.processTaskStepTaskList = this.stepConfig.processTaskStepTaskList || [];
      this.processTaskStepTaskList.forEach(item => {   
        this.$set(item, 'tbodyList', this.getTbodyList(item));
      });
      this.loadingShow = false;
    },
    getTbodyList(item) {
      if (item.stepTaskUserVoList) {
        let newArr = [];
        item.stepTaskUserVoList.forEach((r, i) => {
          newArr.push(
            {
              id: r.id, 
              userUuid: r.userUuid, 
              userVo: r.userVo,
              originalUserUuid: r.originalUserUuid || null, 
              endTime: r.endTime, 
              content: r.content, 
              isDelete: r.isDelete, 
              isDisabled: !!r.isDisabled || false, 
              fileList: r.fileList 
            }
          );
        });
        return newArr;
      } else {
        return [];
      }
    }
  },
  computed: {},
  watch: {
    config: {
      handler(val) {
        val && this.initData(val);
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.subtask-detail {
  .item-main {
    margin-top: 8px;
    .item-list{
      &:not(:last-child) {
        padding-bottom: 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid;
      }
      .text-title {
        margin-right: 10px;
      }
      .content-main {
        display: flex;
      }
    }
  }
  .task-user{
    display: flex;
    align-items: center;
  }
}
</style>
