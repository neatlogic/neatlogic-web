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
  <div class="step-group padding">
    <div class="group-title pb-sm">
      <div class="pr-xs">{{ $t('term.autoexec.stagegroup') }}</div>
      <div class="group-sort border-color">{{ currentGroupConfig.sort + 1 }}</div>
    </div>
    <TsFormItem :label="$t('term.deploy.executivestrategy')" labelWidth="80" :required="true">
      <TsFormSelect
        v-model="groupPolicy"
        :dataList="dataList"
        :clearable="false"
        :disabled="!canEdit"
        :validateList="['required']"
        @on-change="changePolicy"
      ></TsFormSelect>
    </TsFormItem>
    <div v-if="groupPolicy == 'grayScale'" class="grayscale-detail">
      <div class="item-list">
        <div class="item-label text-title">{{ $t('term.deploy.presettarget') }}</div>
        <div class="item-text">
          <template v-if="canEdit && !$utils.isEmpty(groupConfig.config)">
            <div class="tsfont-edit text-action" @click="editTarget()"></div>
          </template>
          <Button
            v-else-if="canEdit"
            type="primary"
            ghost
            @click="addTarget()"
          ><span class="tsfont-plus btn-icon">{{ $t('term.autoexec.executetarget') }}</span>
          </Button>
          <span v-else>-</span>
        </div>
      </div>
      <template v-if="groupConfig.config.executeConfig && !$utils.isEmpty(groupConfig.config.executeConfig)">
        <TsFormItem :label="$t('term.autoexec.executetarget')" labelWidth="80" class="">
          <template v-if="!$utils.isEmpty(groupConfig.config.executeConfig.executeNodeConfig)">
            <template v-if="groupConfig.config.executeConfig.executeNodeConfig.filter">
              <Filters
                ref="filterMain"
                :defaultValue="groupConfig.config.executeConfig.executeNodeConfig.filter"
                :readonly="true"
                :showSearchNumber="2"
                class="nopadding"
              ></Filters>
              <div class="text-right text-tip-active" @click="moreVisible=true">{{ $t('page.viewdetails') }}</div>
            </template>
            <template v-else-if="groupConfig.config.executeConfig.executeNodeConfig.selectNodeList">
              <NodeView :list="groupConfig.config.executeConfig.executeNodeConfig.selectNodeList"></NodeView>
            </template>
            <template v-else-if="groupConfig.config.executeConfig.executeNodeConfig.inputNodeList">
              <NodeView :list="groupConfig.config.executeConfig.executeNodeConfig.inputNodeList"></NodeView>
            </template>
            <template v-else-if="groupConfig.config.executeConfig.executeNodeConfig.paramList">
              <span class="text-tip nopadding">{{ $t('page.referenceinputparameter') }}</span>
              <div class="param-view">
                <TsRow :gutter="8">
                  <Col
                    v-for="(p,pindex) in groupConfig.config.executeConfig.executeNodeConfig.paramList"
                    :key="pindex"
                    span="12"
                  >
                    <div class="param-item border-color overflow" :title="getParamText(p)">{{ getParamText(p) }}</div>
                  </Col>
                </TsRow>
              </div>
            </template>
          </template>
          <template v-else>-</template>
        </TsFormItem>
        <TsFormItem :label="$t('page.whitelist')" labelWidth="80">
          <template v-if="!$utils.isEmpty(groupConfig.config.executeConfig.whitelist)">
            <NodeView :list="groupConfig.config.executeConfig.whitelist"></NodeView>
          </template>
          <template v-else>-</template>
        </TsFormItem>
        <TsFormItem :label="$t('page.blacklist')" labelWidth="80">
          <template v-if="!$utils.isEmpty(groupConfig.config.executeConfig.blacklist)">
            <NodeView :list="groupConfig.config.executeConfig.blacklist"></NodeView>
          </template>
          <template v-else>-</template>
        </TsFormItem>
        <TsFormItem :label="$t('page.protocol')" labelWidth="80">
          <template v-if="!$utils.isEmpty(groupConfig.config.executeConfig.protocolId)">
            <TsFormSelect 
              v-bind="executeForm.itemList.protocolId" 
              :readonly="true" 
              :value="groupConfig.config.executeConfig.protocolId"
            ></TsFormSelect>
          </template>
          <template v-else>-</template>
        </TsFormItem>
        <TsFormItem :label="$t('page.executeuser')" labelWidth="80">
          <div v-if="!$utils.isEmpty(groupConfig.config.executeConfig.executeUser)">
            <ExecuteuserSetting
              :config="groupConfig.config.executeConfig.executeUser"
              :readonly="true"
              :runtimeParamList="runtimeParamList"
            ></ExecuteuserSetting>
          </div>
          <div v-else>-</div>
        </TsFormItem>
        <TsFormItem :label="$t('term.autoexec.batchquantity')" labelWidth="80">
          <div v-if="!$utils.isEmpty(groupConfig.config.executeConfig.roundCount)">
            {{ getRoundCountText(groupConfig.config.executeConfig.roundCount) }}
          </div>
          <div v-else>-</div>
        </TsFormItem>
      </template>
    </div>
    <TsDialog
      v-if="isShowDialog"
      :isShow="isShowDialog"
      :title="$t('term.autoexec.executetarget')"
      type="slider"
      width="large"
      @on-close="close()"
    >
      <template v-slot>
        <div class="pl-nm pr-nm">
          <Divider orientation="start">
            <span>{{ $t('term.autoexec.executetarget') }}</span>
            <i class="text-tip-active pr-sm" :class="isShowExecute? 'tsfont-up' : 'tsfont-down'" @click="isShowExecute=!isShowExecute"></i>
          </Divider>
          <div v-show="isShowExecute">
            <div class="pb-nm">
              <TsForm
                ref="settingForm"
                v-model="executeConfig"
                v-bind="executeForm"
              >
                <template v-slot:executeUser>
                  <ExecuteuserSetting
                    ref="executeUser"
                    :config="executeConfig.executeUser"
                    :disabled="!canEdit"
                    :runtimeParamList="runtimeParamList"
                  ></ExecuteuserSetting>
                </template>
              </TsForm>
            </div>
            <div>
              <TargetDetail
                :id="id"
                ref="targetDetail"
                :canEdit="canEdit"
                :config="executeConfig.executeNodeConfig"
                :isAddParam="true"
              ></TargetDetail>
            </div>
          </div>
       
          <div>
            <Divider orientation="start">
              <span>{{ $t('page.whitelist') }}</span>
              <i class="text-tip-active pr-sm" :class="isShowWhitelist? 'tsfont-up' : 'tsfont-down'" @click="isShowWhitelist=!isShowWhitelist"></i>
            </Divider>
            <NodeList
              v-show="isShowWhitelist"
              ref="whitelist"
              :defaultValue="executeConfig.whitelist"
              :canEdit="canEdit"
            ></NodeList>
          </div>
          <div>
            <Divider orientation="start">
              <span>{{ $t('page.blacklist') }}</span>
              <i class="text-tip-active pr-sm" :class="isShowBlacklist? 'tsfont-up' : 'tsfont-down'" @click="isShowBlacklist=!isShowBlacklist"></i>
            </Divider>
            <NodeList
              v-show="isShowBlacklist"
              ref="blacklist"
              :defaultValue="executeConfig.blacklist"
              :canEdit="canEdit"
            ></NodeList>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          type="primary"
          ghost
          @click="validSetting()"
        >{{ $t('page.validate') }}</Button>
        <Button type="primary" @click="save()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <TsDialog
      v-if="moreVisible"
      type="slider"
      :isShow="moreVisible"
      width="medium"
      :title="$t('page.detail')"
      :hasFooter="false"
      :maskClose="true"
      @on-close="moreVisible = false"
    >
      <TargetView :config="groupConfig.config.executeConfig.executeNodeConfig"></TargetView>
    </TsDialog>
    <TargetValid
      v-if="isValid"
      :visible="isValid"
      :resultList="resultList"
      @save="saveValid()"
      @close="closeValid()"
    ></TargetValid>
  </div>
</template>
<script>
import {store, mutations} from './actionState.js';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TargetDetail: resolve => require(['@/views/pages/autoexec/components/common/addTarget/target-detail'], resolve),
    NodeList: resolve => require(['./node-list.vue'], resolve),
    NodeView: resolve => require(['./group/node-view'], resolve),
    Filters: resolve => require(['@/views/pages/autoexec/components/common/executionMode/filters.vue'], resolve),
    TargetView: resolve => require(['@/views/pages/autoexec/components/common/targetView/target.vue'], resolve),
    TargetValid: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-valid.vue'], resolve),
    ExecuteuserSetting: resolve => require(['./executeuser-setting.vue'], resolve)
  },
  filters: {
  },
  props: {
    id: [Number, String],
    canEdit: Boolean,
    currentGroupConfig: Object,
    runtimeParamList: Array //运行参数
  },
  data() {
    let _this = this;
    return {
      groupPolicy: 'oneShot',
      dataList: [],
      executeForm: {
        labelPosition: 'left',
        labelWidth: 80,
        itemList: {
          protocolId: {
            type: 'select',
            label: this.$t('page.protocol'),
            dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
            multiple: false,
            rootName: 'tbodyList',
            search: true,
            clearable: true,
            transfer: true,
            // disabled: !_this.canEdit,
            dealDataByUrl: _this.dealDataByUrl || null

          },
          executeUser: {
            type: 'slot',
            label: this.$t('page.executeuser')
          },
          roundCount: {
            type: 'select',
            value: null,
            transfer: true,
            label: this.$t('term.autoexec.batchquantity'),
            desc: this.$t('term.deploy.executetargetdesc'),
            dataList: this.$utils.getRoundCountList()
          }
        }
      },
      executeConfig: null,
      isShowDialog: false,
      groupConfig: {},
      findIndex: -1,
      moreVisible: false, //查看执行目标详情
      isValid: false, //校验
      resultList: [],
      isShowExecute: true,
      isShowWhitelist: false,
      isShowBlacklist: false
    };
  },
  beforeCreate() {},
  created() {
    this.getJobGroupPolicy();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];           
      nodeList.forEach(v => {
        columlist.push(
          {text: v.name, value: v.id}
        );
      });
      return columlist;
    },
    getJobGroupPolicy() {
      let data = {
        enumClass: 'neatlogic.framework.autoexec.constvalue.AutoexecJobGroupPolicy'
      };
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          this.dataList = res.Return || [];
        }
      });
    },
    getInitExecuteConfig() {
      return {
        protocolId: null,
        executeUser: {},
        roundCount: null,
        executeNodeConfig: {},
        whitelist: [],
        blacklist: []
      };
    },
    addTarget() {
      this.executeConfig = this.getInitExecuteConfig();
      this.isShowDialog = true;
    },
    editTarget() {
      if (this.groupConfig.config && this.groupConfig.config.executeConfig && !this.$utils.isEmpty(this.groupConfig.config.executeConfig)) {
        this.executeConfig = this.getInitExecuteConfig();
        let config = this.$utils.deepClone(this.groupConfig.config.executeConfig);
        Object.keys(config).forEach(key => {
          if (this.executeConfig.hasOwnProperty(key)) {
            this.executeConfig[key] = config[key];
          }
        });
      }
      if (this.executeConfig.whitelist.length) {
        this.isShowWhitelist = true;
      }
      if (this.executeConfig.blacklist.length) {
        this.isShowBlacklist = true;
      }
      this.isShowDialog = true;
    },
    close() {
      this.isShowExecute = true;
      this.isShowWhitelist = false;
      this.isShowBlacklist = false;
      this.isShowDialog = false;
    },
    validSetting(type) { //true不需要提示校验信息
      let executeNodeConfig = this.$refs.targetDetail.save();
      let whitelist = this.$refs.whitelist.save() || [];
      this.$set(executeNodeConfig, 'whitelist', whitelist);
      if (!this.$refs.targetDetail.valid()) {
        return;
      }
      this.isValid = false;
      let data = {
        protocolId: this.executeConfig.protocolId,
        executeUser: null,
        filter: executeNodeConfig.filter || this.defaultSearchValue || {},
        selectNodeList: executeNodeConfig.selectNodeList || [],
        inputNodeList: executeNodeConfig.inputNodeList || [],
        paramList: executeNodeConfig.paramList || [],
        whitelist: whitelist
      };
      if (this.$refs.executeUser) {
        this.$set(this.executeConfig, 'executeUser', this.$refs.executeUser.save());
      }
      if (this.executeConfig.executeUser && this.executeConfig.executeUser.value) {
        if (this.executeConfig.executeUser.mappingMode === 'constant') {
          this.$set(data, 'executeUser', this.executeConfig.executeUser.value);
        } else if (this.executeConfig.executeUser.mappingMode === 'runtimeparam' && !this.$utils.isEmpty(this.runtimeParamList)) {
          let findItem = this.runtimeParamList.find(i => i.key === this.executeConfig.executeUser.value);
          if (findItem) {
            this.$set(data, 'executeUser', findItem.defaultValue);
          }
        }
      }
      let _this = this;
      return this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          _this.resultList = res.Return.list || [];
          _this.resultList.length && (_this.isValid = true);
          if (!_this.isValid) {
            if (!type) {
              this.$Message.success(this.$t('message.validatesuccess'));
            }
          }
        }
      });
    },
    changePolicy(val) {
      this.groupConfig.policy = this.groupPolicy;
      this.groupConfig.config = {};
      if (this.findIndex > -1) {
        this.combopGroupList[this.findIndex].policy = this.groupPolicy;
        this.combopGroupList[this.findIndex].config = {};
        mutations.setCombopGroupList(this.combopGroupList);
      }
      this.$emit('save', this.groupConfig);
    },
    confirmEdit() {
      if (this.$refs.executeUser) {
        this.$set(this.executeConfig, 'executeUser', this.$refs.executeUser.save());
      }
      this.executeConfig.executeNodeConfig = this.$refs.targetDetail.save(true);
      this.executeConfig.whitelist = this.$refs.whitelist.save();
      this.executeConfig.blacklist = this.$refs.blacklist.save();
      this.groupConfig.policy = this.groupPolicy;
      let isEmpty = true;
      Object.keys(this.executeConfig).forEach(key => {
        if (!this.$utils.isEmpty(this.executeConfig[key])) {
          isEmpty = false;
        }
      });
      if (isEmpty) {
        this.groupConfig.config = {};
      } else {
        this.$set(this.groupConfig.config, 'executeConfig', this.executeConfig);
      }
      this.findIndex > -1 && this.combopGroupList.splice(this.findIndex, 1, this.groupConfig);
      mutations.setCombopGroupList(this.combopGroupList);
      this.$emit('save', this.groupConfig);
    },
    async save() {
      this.isValid = false;
      await this.validSetting(true);
      if (this.isValid) {
        return;
      } else {
        this.confirmEdit();
      }
      this.close();
    },
    saveValid() { //校验完成，保存
      this.confirmEdit();
      this.isValid = false;
      this.close();
    },
    closeValid() { //关闭校验弹框
      this.isValid = false;
    }
  },
  computed: {
    combopGroupList() { //组设置列表
      return store.combopGroupList;//使用Vue.observable()进行状态管理
    },
    getParamText() {
      let _this = this;
      return val => {
        if (_this.runtimeParamList && _this.runtimeParamList.length) {
          let find = _this.runtimeParamList.find(item => item.key == val) || {};
          return find.name || '';
        }
        return '-';
      };
    },
    getRoundCountText() {
      return (val) => {
        let text = val;
        if (val === 0) {
          text = this.$t('page.fulllist');
        } else if (val === 1) {
          text = this.$t('page.allparallel');
        }
        return text;
      };
    }
  },
  watch: {
    currentGroupConfig: {
      handler(val) {
        if (val) {
          this.groupConfig = this.$utils.deepClone(val);
          this.groupConfig.policy && (this.groupPolicy = this.groupConfig.policy);
          this.findIndex = this.combopGroupList.findIndex(item => item.uuid == this.groupConfig.uuid);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.grayscale-detail{
  .item-list{
    width: 100%;
    .item-label{
      width: 80px;
      box-sizing: border-box;
      text-align: right;
      vertical-align: middle;
      float: left;
      line-height: 32px;
      padding: 0px 16px 0px 0;
    }
    .item-text{
      position: relative;
      line-height: 32px;
      font-size: 13px;
      margin-left: 80px;
    }
  }
}
.nopadding {
  padding: 0 !important;
  /deep/ .search {
    width: 100%;
  }
}
/deep/ .tag-item-text{
  display: block !important;
  &:not(:last-of-type){
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
}
.param-item {
  border: 1px solid;
  border-radius: 4px;
  text-align: center;
}
.group-title {
  display: flex;
  align-items: center;
  .group-sort {
    width: 20px;
    height: 20px;
    line-height: 18px;
    border: 1px solid;
    border-radius: 50%;
    font-style: normal;
    text-align: center;
  }
}
</style>
