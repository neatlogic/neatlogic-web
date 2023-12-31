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
  <div class="runner-group-add-wrap">
    <TsDialog
      v-bind="addTsDialog"
      :isShow="isShow"
      @on-close="close"
    >
      <template v-slot>
        <div>
          <div class="step">
            <Steps :current="current" :status="stepStatus">
              <Step
                v-for="(litem,lindex) in stepList"
                :key="lindex"
                :title="litem"
                @click.native="next(lindex)"
              >
              </Step>
            </Steps>
          </div>
          <div v-show="current == 0">
            <TsForm ref="form" :item-list="formConfig"></TsForm>
            <TsTable
              ref="editFormTable"
              :theadList="theadList"
              :tbodyList="netWorkList"
              class="netWork"
            >
              <template v-slot:networkIp="{ row }">
                <TsFormInput
                  ref="formInput"
                  v-model="row.networkIp"
                  clearable
                  class="groupwork"
                  :validateList="validConfig.validIp"
                />
              </template>
              <template v-slot:mask="{ row }">
                <TsFormInput
                  ref="formInput"
                  v-model="row.mask"
                  class="groupwork"
                  clearable
                  :validateList="validConfig.validMask"
                />
              </template>
              <template v-slot:act="{ index }">
                <div class="actions flex-start groupwork">
                  <span v-if="netWorkList.length>1" class="tsfont-close-o text-action" @click="operationRow('del', index)"></span>
                  <span class="tsfont-plus-o text-action" @click="operationRow('add', index)"></span>
                </div>
              </template>
            </TsTable>
            <div class="flex-end">
              <Button type="primary" ghost @click="next(current+1)">下一步</Button>
            </div>
          </div>
          <div v-show="current == 1">
            <RelateRunnerList v-model="runnerList" class="runner-manage-group-wrap"></RelateRunnerList>
            <div class="flex-end mt-md">
              <Button
                type="primary"
                class="mr-md"
                ghost
                @click="next(current -= 1)"
              >上一步</Button>
              <Button type="primary" @click="saveRunnerGroup()">{{ $t('button.save') }}</Button>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import RelateRunnerList from './components/relate-runner-list.vue'; // 关联runner列表
import {runnerGroupMixin} from './src/runner-group-mixin.js';
export default {
  name: 'RunnerGroupAdd', // 添加分组
  components: {
    RelateRunnerList,
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  filters: {},
  mixins: [runnerGroupMixin],
  props: {
    isShow: {
      // 是否显示dialog 弹窗
      type: Boolean,
      default: false
    },
    runnerGroupData: {
      type: Object
    }
  },
  data() {
    return {
      stepStatus: 'process', // 当前步骤状态 process 表示进行 error 表示错误
      stepList: ['基本信息', '关联Runner'],
      current: 0, // 默认显示第一个
      runnerList: [],
      addTsDialog: {
        // 弹框配置信息
        type: 'modal',
        hasFooter: false,
        title: this.$t('page.addtarget', {target: this.$t('page.group')})
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
    next(current) {
      if (!this.$refs.form.valid()) {
        this.stepStatus = 'error';
        return;
      }
      if (!this.validNetwork()) {
        return; 
      }
      this.current = current; // 步骤
      this.stepStatus = 'process';
    },
    saveRunnerGroup() {
      // 点击模态框确定按钮操作
      let form = this.$refs.form;
      if (!form.valid()) {
        return;
      }
      if (!this.validNetwork()) {
        return; 
      }
      let params = {
        ...form.getFormValue(),
        groupNetworkList: this.filterEmptyNetworkList(),
        runnerList: this.runnerList ? this.runnerList : []
      };
      this.$api.framework.runner.saveRunnerGroup(params).then(res => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.content.savesuccess'));
          this.close();
          this.$emit('refreshList'); // 刷新列表
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>

<style lang="less" scoped>
@import './src/runner-group.less';
@import './src/common.less';
/deep/ .ivu-steps .ivu-steps-title {
  font-weight: normal;
}
</style>
