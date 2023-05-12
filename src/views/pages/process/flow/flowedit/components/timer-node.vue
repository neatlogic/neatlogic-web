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
  <div class="timerNode">
    <Loading :loading-show="loadingShow" type="fix"></Loading>
    <div class="permission-list require-label text-grey">
      {{ $t('term.process.circulationtime') }}
    </div>
    <div class="permission-list">
      <template>
        <TsFormSelect
          ref="timerAttributeUuid"
          v-model="timerConfig.attributeUuid"
          :dataList="formDataList"
          :validateList="validateList"
          border="border"
          textName="label"
          valueName="uuid"
          :firstSelect="false"
        ></TsFormSelect>
      </template>
      <div class="fz10 tsfont-info-o text-tip tip-time">{{ $t('term.process.circulationtimetip') }}</div>
    </div>
    <!-- 初步处理人 -->
    <div class="pt-md">
      <AssignSetting
        id="assignData"
        ref="assignData"
        :prevNodes="prevNodes"
        :formUuid="formUuid"
        :defaultWorkerPolicyConfig="workerPolicyConfig"
        :toSetting="toSetting"
      ></AssignSetting>
    </div>
  </div>
</template>
<script>
import AssignSetting from './nodesetting/assign-setting';
import nodemixin from './nodemixin.js';
import {store} from '../floweditState.js';

export default {
  name: 'Timer',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    AssignSetting
  },
  filters: {
  },
  mixins: [nodemixin],
  props: {
  },
  data() {
    let _this = this;
    return {
      loadingShow: true,
      formUuid: _this.formConfig && _this.formConfig.uuid ? _this.formConfig.uuid : '', //表单id
      timerConfig: {
        type: 'form', //选择类型（暂时只有表单类型）
        value: '', //自定义的默认值
        attributeUuid: '' //表单组件的uuid
      },
      validateList: ['required'],
      formDataList: [],
      workerPolicyConfig: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getNodeSetting();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getNodeSetting() {
      let defaultData = this.nodeConfig.stepConfig || {};
      if (!this.$utils.isEmptyObj(defaultData)) {
        Object.keys(defaultData).forEach(key => {
          this.timerConfig[key] = defaultData[key];
        });
        this.workerPolicyConfig = defaultData.workerPolicyConfig;
      }
      this.loadingShow = false;
    },
    saveNodeData() {
      let stepConfig = Object.assign({}, this.timerConfig);
      //分派处理人
      if (this.$refs.assignData) {
        stepConfig.workerPolicyConfig = this.$refs.assignData.saveAssignData();
      } 
      return stepConfig;
    },
    nodeValid(href) {
      let querySelect = href.substring(1);
      this.$nextTick(() => {
        if (querySelect != 'assignData') {
          this.$refs[`${querySelect}`].valid();
        } else {
          this.$refs.assignData && this.$refs.assignData.assignValid();
        }
      });
    },
    getFormTimeList() {
      if (this.allFormitemList && this.allFormitemList.length) {
        this.formDataList = this.allFormitemList.filter(item => item.handler == 'formdate' && item.config.isRequired);
        if (this.timerConfig.attributeUuid) {
          let attributeUuid = this.formDataList.find(f => f.uuid == this.timerConfig.attributeUuid);
          !attributeUuid && (this.timerConfig.attributeUuid = '');
        }
      } else {
        this.formDataList = [];
        this.timerConfig.attributeUuid = '';
      }
    }
  },
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    }
  },
  watch: {
    allFormitemList: {
      handler(val) {
        this.getFormTimeList();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.permission-list{
  .tip-time {
    padding-top: 8px;
  }
}
</style>
