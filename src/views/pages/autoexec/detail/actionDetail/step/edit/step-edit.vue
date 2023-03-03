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
  <div>
    <TsDialog
      v-if="isShow"
      v-bind="setting"
      :isShow="isShow"
      :hasFooter="canEdit"
      :maskClose="!canEdit"
      @on-close="close()"
      @on-ok="confirmEdit()"
    >
      <template v-slot:header>
        <div v-if="config && config.name">
          <span v-html="canEdit?'编辑':'查看'"></span><span>阶段:{{ config.name }}</span>
        </div>
        <div v-else>
          添加阶段
        </div>
      </template>
      <template v-slot>
        <div class="pl-nm pr-nm">
          <TsForm
            ref="form"
            v-model="editConfig"
            :itemList="formItem"
            labelPosition="left"
            :labelWidth="115"
          >
            <template v-slot:execMode>
              <PoptipSelect
                v-model="editConfig.execMode"
                v-bind="formItem[1]"
                @change="toggleExecuteForm"
              ></PoptipSelect>
            </template>
          </TsForm>
          <div class="mt-lg">
            <TsFormItem
              v-if="(groupConfig && groupConfig.policy=='grayScale') && (editConfig.execMode && (editConfig.execMode == 'runner' || editConfig.execMode == 'sqlfile'))"
              label="执行策略"
              labelPosition="left"
              :labelWidth="115"
              :required="true"
            >
              <TsFormSelect
                v-model="editConfig.policy"
                :clearable="false"
                :disabled="!canEdit"
                :dataList=" executePolicyList"
                :validateList="validateList"
                border="border"
              ></TsFormSelect>
            </TsFormItem>
          </div>
          <div v-if="editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')" class="mt-lg">
            <TsFormItem
              label="预设执行目标"
              labelPosition="left"
              :labelWidth="115"
              :tooltip="executeTooltip"
            >
              <TsFormSwitch v-model="executeConfig.isPresetExecuteConfig" :disabled="!canEdit"></TsFormSwitch>
            </TsFormItem>
            <template v-if="(!groupConfig || groupConfig.policy!='grayScale') && executeConfig.isPresetExecuteConfig">
              <TsForm
                ref="executeForm"
                v-model="executeConfig"
                :itemList="executeForm"
                labelPosition="left"
                tipPlacement="right"
                :labelWidth="115"
              >
              </TsForm>
              <div class="pt-nm">
                <TargetDetail
                  :id="id"
                  ref="targetDetail"
                  :versionId="versionId"
                  :canEdit="canEdit"
                  :config="executeConfig.executeNodeConfig"
                  :isAddParam="true"
                  :labelWidth="115"
                  :isAddPrenode="prevStepList.length > 0 ? true : false"
                  :prevStepList="prevStepList"
                ></TargetDetail>
              </div>
            </template>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
        <Button
          v-if="editConfig.execMode !='runner'"
          type="primary"
          ghost
          @click="validSetting()"
        >校验</Button>
        <Button type="primary" @click="ok()">确定</Button>
      </template>
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
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: '',
  components: {
    TsForm,
    TargetDetail: resolve => require(['@/views/pages/autoexec/components/common/addTarget/target-detail'], resolve),
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect'], resolve),
    TargetValid: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-valid.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve)
  },
  filters: {},
  props: {
    id: [Number, String],
    versionId: Number,
    isShow: {
      type: Boolean,
      default: false
    },
    canEdit: Boolean,
    config: {
      type: [Boolean, Object]
    },
    scriptLength: {
      type: Number
    },
    stepList: {
      type: [Array],
      default() {
        return [];
      }
    },
    execModeList: {
      type: Array
    },
    groupConfig: Object,
    prevStepList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    let _this = this;
    return {
      setting: {
        type: 'slider',
        width: '1000px',
        maskClose: false
      },
      editConfig: {
        //uk: '',
        name: '',
        execMode: 'target',
        policy: 'first'
      },
      formItem: [
        {
          type: 'text',
          name: 'name',
          maxlength: 50,
          label: this.$i18n.t('page.name'),
          validateList: ['required', 'name-special'],
          errorMessage: '',
          onChange: function(val) {
            _this.checkExist('name', val);
          }
        },
        {
          type: 'slot',
          name: 'execMode',
          // label: this.$i18n.t('autoexec.execMode'),
          label: '执行方式',
          validateList: ['required'],
          disabled: this.scriptLength > 0,
          list: _this.execModeList,
          vertical: true,
          popLable: 120
          // onChange: function(val) {
          //   _this.toggleExecuteForm(val);
          // }
        }
      ],
      executeForm: [
        {
          type: 'select',
          name: 'protocolId',
          label: this.$t('page.protocol'), //添加阶段
          value: '',
          multiple: false,
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getProtocolDataList,
          placeholder: this.$i18n.t('common.select1'),
          transfer: true,
          disabled: !_this.canEdit
        },
        {
          type: 'text',
          name: 'executeUser',
          // label: _this.$i18n.t('autoexec.execUser'),
          label: this.$t('term.autoexec.job.executeuser'),
          value: '',
          transfer: true,
          // width: '75%',
          disabled: !_this.canEdit,
          tooltip: '若此处不填用户，当前阶段默认继承组合工具执行用户，若此处填写用户，当前阶段将采用此处填写的执行用户；执行时，不可修改执行用户'
        },
        {
          type: 'select',
          name: 'roundCount',
          value: null,
          transfer: true,
          label: '分批数量',
          desc: '将执行目标按数量等分为N个批次，先后执行，阶段设置的分批数量优先级高于组合工具或作业中设置的分批数',
          dataList: this.$utils.getRoundCountList(),
          filterName: 'text',
          disabled: !_this.canEdit
        }
      ],
      executeConfig: {
        protocolId: '',
        executeUser: '',
        roundCount: null,
        isPresetExecuteConfig: 0,
        executeNodeConfig: {}
      },
      isValid: false, // 校验执行目标
      resultList: [], //校验结果
      validateList: ['required'],
      executePolicyList: [],
      executeTooltip: '若此处不填写执行目标，当前阶段默认继承组合工具执行目标，若此处填写执行目标，当前阶段将采用此处填写的执行目标；执行时，不可修改阶段的执行目标'
    };
  },
  beforeCreate() {},
  created() {
    this.getExecutePolicy();
  },
  beforeMount() {},
  mounted() {
    if (!this.$utils.isEmpty(this.config)) {
      this.editConfig = Object.assign(this.editConfig, this.config);
      if (!this.$utils.isEmpty(this.config.config) && !this.$utils.isEmpty(this.config.config.executeConfig)) {
        Object.keys(this.config.config.executeConfig).forEach(key => {
          if (this.executeConfig.hasOwnProperty(key)) {
            this.executeConfig[key] = this.config.config.executeConfig[key];
          }
        });
      }
    }
    for (let key in this.formItem) {
      !this.canEdit && (this.formItem[key].disabled = true);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    confirmEdit() {
      //校验是否重复
      //this.checkExist('uk');
      this.checkExist('name');
      if (this.$refs.targetDetail) {
        let executeNodeConfig = this.$refs.targetDetail.save();
        this.executeConfig.executeNodeConfig = executeNodeConfig;
      } else {
        this.executeConfig.executeNodeConfig = {};
      }
      if (this.$refs.form.valid()) {
        let editConfig = this.$utils.deepClone(this.editConfig);
        if (editConfig.policy && (!this.groupConfig || this.groupConfig.policy != 'grayScale' || (this.editConfig.execMode && this.editConfig.execMode != 'runner' && this.editConfig.execMode != 'sqlfile'))) {
          this.$delete(editConfig, 'policy'); 
        }
        this.$emit('close', editConfig, this.executeConfig.isPresetExecuteConfig ? this.executeConfig : {});
      }
    },
    checkExist(key, val) {
      let isExist = false;
      let _this = this;
      let value = val || this.editConfig[key];
      if (value) {
        for (let i = 0; i < _this.stepList.length; i++) {
          for (let j = 0; j < _this.stepList[i].length; j++) {
            if ((_this.stepList[i][j].uuid != _this.editConfig.uuid) && (_this.stepList[i][j][key] == value)) {
              isExist = true;
              break;
            }
          }
        }
      }
      if (isExist) {
        _this.formItem.forEach(f => {
          if (f.name == key) {
            _this.$set(f, 'errorMessage', (key == 'uk' ? _this.$i18n.t('common.uniqueIdent') : _this.$i18n.t('page.name')) + '重复，请重新输入');
          }
        });
      } else {
        _this.formItem.forEach(f => {
          if (f.name == key) {
            _this.$set(f, 'errorMessage', '');
          }
        });
      }
    },
    toggleExecuteForm(type) {
      let _this = this;
      //runner方式的阶段无需选执行目标；其他方式需要（非必选)
      if (type == 'runner') {
        _this.executeConfig = {
          protocolId: '',
          executeUser: '',
          isPresetExecuteConfig: 0,
          executeNodeConfig: {}
        };
      }
    },
    validSetting(type) { //true不需要提示校验信息
      if (!this.$refs.targetDetail || (this.$refs.targetDetail && !this.$refs.targetDetail.valid())) {
        return;
      }
      let executeNodeConfig = this.$refs.targetDetail.save();
      this.isValid = false;
      let data = {
        protocolId: this.executeConfig.protocolId,
        executeUser: this.executeConfig.executeUser,
        filter: executeNodeConfig.filter || this.defaultSearchValue || {},
        selectNodeList: executeNodeConfig.selectNodeList || [],
        inputNodeList: executeNodeConfig.inputNodeList || [],
        paramList: executeNodeConfig.paramList || []
      };
      let _this = this;
      return this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          _this.resultList = res.Return.list || [];
          _this.resultList.length && (_this.isValid = true);
          if (!_this.isValid) {
            if (!type) {
              this.$Message.success('校验成功');
            }
          }
        }
      });
    },
    async ok() {
      this.isValid = false;
      (this.editConfig.execMode != 'runner') && (await this.validSetting(true));
      if (this.isValid) {
        return;
      } else {
        this.confirmEdit();
      }
    },
    saveValid() { //校验完成，保存
      this.confirmEdit();
      this.isValid = false;
    },
    closeValid() { //关闭校验弹框
      this.isValid = false;
    },
    getExecutePolicy() {
      let data = {
        enumClass: 'AutoexecJobPhaseExecutePolicy'
      };
      this.$api.common.getSelectLit(data).then((res) => {
        if (res.Status == 'OK') {
          this.executePolicyList = res.Return || [];
        }
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
