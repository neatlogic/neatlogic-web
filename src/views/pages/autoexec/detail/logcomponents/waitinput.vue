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
  <div class="mt-sm">
    <Divider orientation="left">{{ interactData.message }}</Divider>
    <template v-if="interactData.opType == 'button'">
      <div v-if="interactData.options && interactData.options.length > 0" class="action-group">
        <span v-for="btn in interactData.options" :key="btn" class="action-item">
          <Button size="small" :type="parmaryBtn.includes(btn) ? 'error' : 'info'" @click="doAction(btn)">{{ btn }}</Button>
        </span>
      </div>
    </template>
    <template v-if="interactData.opType == 'input'">
      <div class="controller-group">
        <div>
          <TsFormInput
            ref="controller"
            v-model="value"
            type="text"
            class="value-item"
            :validateList="validateList"
          ></TsFormInput>
        </div>
        <div style="text-align:left">
          <Button type="primary" @click="doAction()">{{ $t('page.continueexecute') }}</Button>
        </div>
      </div>
    </template>
    <template v-if="interactData.opType == 'select' || interactData.opType == 'mselect'">
      <div class="controller-group">
        <div>
          <TsFormSelect
            ref="controller"
            v-model="value"
            :validateList="validateList"
            :isEqualValue="true"
            :multiple="interactData.opType == 'mselect' ? true : false"
            :dataList="getDataList"
          ></TsFormSelect>
        </div>
        <div style="text-align:left">
          <Button type="primary" @click="doAction()">{{ $t('page.continueexecute') }}</Button>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {},
  props: {
    nodeData: { type: Object },
    interactData: { type: Object },
    jobData: { type: Object },
    phaseData: { type: Object }
  },
  data() {
    return {
      value: null,
      parmaryBtn: ['commit'],
      validateList: ['required']
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
    doAction(action) {
      const controller = this.$refs['controller'];
      let isValid = true;
      if (controller && controller.valid) {
        isValid = controller.valid();
      }
      if (isValid) {
        const param = {
          option: action || this.value,
          jobId: this.jobData.id,
          jobPhaseId: this.phaseData.id,
          nodeId: this.nodeData.id,
          resourceId: this.nodeData.resourceId || null,
          sqlName: this.nodeData.sqlFile || null
        };
        this.$api.autoexec.job.exectWaitInput(param).then(res => {
          if (res.Status == 'OK') {
            this.$emit('action');
          }
        });
      }
    }
  },
  computed: {
    getDataList() {
      let ary = [];
      if (this.interactData.opType == 'select' || this.interactData.opType == 'mselect') {
        this.interactData.options.forEach(item => {
          if (typeof item == 'object') {
            ary.push(item);
          } else {
            ary.push({ text: item, value: item });
          }
        });
      }
      return ary;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
