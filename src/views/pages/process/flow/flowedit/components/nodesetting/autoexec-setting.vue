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
  <div id="autoexecConfig">
    <div class="permission-list">
      <div class="list">
        <div class="second-title text-grey">{{ $t('term.autoexec.toolclassification') }}</div>
        <div>
          <TsFormSelect
            v-model="autoexecConfig.autoexecTypeId"
            v-bind="autoFormData.typeConfig"
            @on-change="changeType"
          > </TsFormSelect>
        </div>
      </div>
    </div>
    <div id="autoexecCombop" class="permission-list">
      <div class="list">
        <div class="second-title text-grey">
          <span class="require-label">{{ $t('term.autoexec.combinationtool') }}</span>
          <div class="float-right">
            <span
              v-if="autoexecConfig.autoexecCombopId"
              class="tsfont-edit text-tip-active"
              :title="$t('dialog.title.edittarget',{target: $t('term.autoexec.combinationtool')})"
              @click="editCombop()"
            ></span>
            <span class="tsfont-refresh text-tip-active pl8" :title="$t('page.refresh')" @click="refreshCombop()"></span>
          </div>
        </div>
        <div>
          <TsFormSelect
            ref="autoexecCombop"
            v-model="autoexecConfig.autoexecCombopId"
            v-bind="autoFormData.combopConfig"
            @on-change="chnageCombop"
          > </TsFormSelect>
        </div>
      </div>
    </div>
    <div v-if="autoexecConfig.autoexecCombopId" class="permission-list">
      <div class="params-top">
        <div class="text-grey">{{ $t('term.process.paramsMapping') }}</div>
        <div class="text-href" @click="editParams()">{{ $t('page.add') }}</div>
      </div>
      <div class="bg-op params-box" :class="{'border-error':!isValid}">
        <div v-if="autoexecConfig.executeParamList.length > 0" class="param-type-list">
          <div class="title">
            <span>{{ $t('term.process.targetparamsvalue') }}</span>
            <span>
              <Tooltip
                max-width="300"
                theme="light"
                transfer
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.targetparamsvaluetip') }}</p>
                </div>
              </Tooltip>
            </span></div>
          <div v-for="(e,eindex) in autoexecConfig.executeParamList" :key="'execute_'+eindex" class="param-list">
            <div class="text-grey param-title overflow" :class="{'require-label':e.isRequired}" :title="e.name">{{ e.name }}</div>
            <div v-if="e.mappingMode == 'form'" class="text-right">{{ paramText(e.value,'form') }}</div>
            <div v-else-if="e.mappingMode == 'prestepexportparam'" class="text-right">{{ paramText(e.value,'prestepexportparam') }}</div>
            <div v-else-if="e.mappingMode =='constant'" :class="e.key == 'executeNodeConfig' ? 'param-value' : ''">
              <protocolReadonly v-if="e.key=='protocolId'" :value="e.value" readonly></protocolReadonly>
              <executeNodeReadonly
                v-else-if="e.key=='executeNodeConfig'"
                :value="e.value"
                :runtimeParamList="autoexecConfig.runtimeParamList"
                readonly
              ></executeNodeReadonly>
              <div v-else-if="e.key=='roundCount'">
                {{ getRoundCountText(e.value) }}
              </div>
              <div v-else>{{ e.value }}</div>
            </div>
            <div v-else-if="e.mappingMode=='runtimeparam'">
              <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
              <span>{{ getruntimeParamListText(e.value) }}</span>
            </div>
            <div v-else>{{ e.value || '-' }}</div>
          </div>
        </div>
        <div v-if="autoexecConfig.runtimeParamList.length > 0" class="param-type-list">
          <div class="title">{{ $t('term.process.jobparamsvalue') }}</div>
          <div v-for="(r,rindex) in autoexecConfig.runtimeParamList" :key="'run_'+rindex" class="param-list">
            <div class="text-grey param-title overflow" :class="{'require-label':r.isRequired}" :title="r.name">{{ r.name }}</div>
            <div v-if="r.mappingMode == 'form'" class="text-right">{{ paramText(r.value,'form') }}</div>
            <div v-else-if="r.mappingMode == 'prestepexportparam'" class="text-right">{{ paramText(r.value,'prestepexportparam') }}</div>
            <div v-else-if="r.mappingMode == 'constant'">
              <Item
                :is="paramType(r.type,'Readonly')"
                :value="r.value"
                :config="r.config?r.config:{}"
                readonly
                :type="r.type"
              ></Item>
            </div>
            <div v-else>-</div>
          </div>
        </div>
        <div id="autoexecParams" class="param-type-list">
          <div class="title">
            <span>{{ $t('term.process.formparamsvalue') }}</span>
            <span>
              <Tooltip
                max-width="300"
                theme="light"
                transfer
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.formparamsvaluetip') }}</p>
                </div>
              </Tooltip>
            </span>
          </div>
          <div v-for="(f,findex) in autoexecConfig.formAttributeList" :key="'form_'+findex" class="param-list">
            <div class="text-grey param-title overflow" :title="paramText(f.key,'form')">{{ paramText(f.key,'form') }}</div>
            <div class="text-right">{{ paramText(f.value,'export') }}</div>
          </div>
        </div>
      </div>
    </div>
    <TsDialog
      :title="$t('term.process.paramsMapping')"
      :isShow="isShow"
      height="400px"
      @on-ok="saveParams()"
      @on-close="close()"
    >
      <div class="dialog-params">
        <div v-if="executeParamList.length > 0">
          <div class="title">
            <span>{{ $t('term.process.targetparamsvalue') }}</span>
            <span>
              <Tooltip
                placement="right"
                max-width="400"
                theme="light"
                transfer
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.targetparamsvaluetip') }}</p>
                </div>
              </Tooltip>
            </span>
          </div>
          <TsRow
            v-for="(e,eindex) in executeParamList"
            :key="'execute_'+eindex"
            :gutter="8"
            class="item-list"
          >
            <Col span="6">
              <div :class="{'require-label':e.isRequired}">{{ e.name }}</div>
            </Col>
            <template v-if="e.mappingMode=='constant'">
              <Col span="18">
                <protocolReadonly v-if="e.key=='protocolId'" :value="e.value" readonly></protocolReadonly>
                <executeNodeReadonly
                  v-else-if="e.key=='executeNodeConfig'"
                  :value="e.value"
                  :runtimeParamList="autoexecConfig.runtimeParamList"
                  readonly
                ></executeNodeReadonly>
                <div v-else-if="e.key=='roundCount'">
                  {{ getRoundCountText(e.value) }}
                </div>
                <div v-else>{{ e.value }}</div>
              </Col>
            </template>
            <div v-else-if="e.mappingMode=='runtimeparam'">
              <span class="text-tip pr-sm">{{ $t('term.autoexec.jobparam') }}</span>
              <span>{{ getruntimeParamListText(e.value) }}</span>
            </div>
            <template v-else>
              <Col span="6">
                <TsFormSelect
                  ref="formValid"
                  v-model="e.mappingMode"
                  :dataList="executeMappingModeList(e.key)"
                  :validateList="e.isRequired?validateList:[]"
                  transfer
                  border="border"
                  @on-change="changeMappingMode(e)"
                ></TsFormSelect>
              </Col>
              <Col span="12">
                <template v-if="e.mappingMode == 'form'">
                  <TsFormSelect
                    ref="formValid"
                    v-model="e.value"
                    :dataList="allFormitemList"
                    textName="label"
                    valueName="uuid"
                    :validateList="e.isRequired?validateList:[]"
                    transfer
                    border="border"
                  ></TsFormSelect>
                </template>
                <template v-else>
                  <TsFormInput
                    ref="formValid"
                    v-model="e.value"
                    :validateList="e.isRequired?validateList:[]"
                    border="border"
                  ></TsFormInput>
                </template>
              </Col>
            </template>
          </TsRow>
        </div>
        <div v-if="runtimeParamList.length > 0">
          <div class="title">{{ $t('term.process.jobparamsvalue') }}</div>
          <div class="param-list">
            <TsRow
              v-for="(r,rindex) in runtimeParamList"
              :key="'run_'+rindex"
              :gutter="8"
              class="item-list"
            >
              <Col span="6">
                <div class="overflow" :class="{'require-label':r.isRequired}" :title="r.name">{{ r.name }}</div>
              </Col>
              <Col span="6">
                <TsFormSelect
                  ref="formValid"
                  v-model="r.mappingMode"
                  :dataList="mappingModeList"
                  :validateList="r.isRequired?validateList:[]"
                  transfer
                  border="border"
                  @on-change="changeMappingMode(r)"
                ></TsFormSelect>
              </Col>
              <Col span="12">
                <template v-if="r.mappingMode == 'form'">
                  <TsFormSelect
                    ref="formValid"
                    v-model="r.value"
                    :dataList="allFormitemList"
                    textName="label"
                    valueName="uuid"
                    :validateList="r.isRequired?validateList:[]"
                    transfer
                    border="border"
                  ></TsFormSelect>
                </template>
                <template v-else-if="r.mappingMode == 'prestepexportparam'">
                  <TsFormSelect
                    ref="formValid"
                    v-model="r.value"
                    :dataList="allPreNodeExportParamList"
                    :validateList="r.isRequired?validateList:[]"
                    transfer
                    border="border"
                  ></TsFormSelect>
                </template>
                <template v-else-if="r.mappingMode == 'constant'">
                  <Edit
                    :is="paramType(r.type,'Handler')"
                    ref="formValid"
                    v-model="r.value"
                    :type="r.type"
                    :config="r.config?r.config:{}"
                    :isRequired="!!r.isRequired"
                  ></Edit>
                </template>
                <template v-else>
                  <TsFormInput
                    ref="formValid"
                    v-model="r.value"
                    :validateList="r.isRequired?validateList:[]"
                    border="border"
                  ></TsFormInput>
                </template>
              </Col>
            </TsRow>
          </div>
        </div>
        <div>
          <div class="title">
            <span>{{ $t('term.process.formparamsvalue') }}</span>
            <span>
              <Tooltip
                placement="right"
                max-width="400"
                theme="light"
                transfer
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.formparamsvaluetip') }}</p>
                </div>
              </Tooltip>
            </span>
          </div>
          <template v-if="formAttributeList.length > 0">
            <div class="param-list text-title">
              <TsRow :gutter="8">
                <Col span="12">
                  <div>{{ $t('page.formparams') }}</div>
                </Col>
                <Col span="12">
                  <div>{{ $t('term.process.exportparameters') }}</div>
                </Col>
              </TsRow>
            </div>
            <div v-for="(form,formIndex) in formAttributeList" :key="'form_'+formIndex" class="form-param-list">
              <TsRow :gutter="8">
                <Col span="12">
                  <TsFormSelect
                    v-model="form.key"
                    :dataList="formDataList"
                    textName="label"
                    valueName="uuid"
                    transfer
                    border="border"
                    @on-change="changeFormItem"
                  ></TsFormSelect>
                </Col>
                <Col span="12">
                  <TsFormSelect
                    v-model="form.value"
                    :dataList="exportParamList"
                    :firstSelect="false"
                    transfer
                    border="border"
                  ></TsFormSelect>
                </Col>
              </TsRow>
              <div class="del-btn tsfont-trash-o text-tip-active" @click="delFormParam(formIndex)"></div>
            </div>
          </template>
          <Button
            v-if="formAttributeList.length !== formDataList.length"
            type="primary"
            ghost
            @click="addFormParam()"
          >
            <span class="tsfont-plus pr4"></span><span>{{ $t('page.param') }}</span>
          </Button>
        </div>
      </div>
    </TsDialog>
  </div>
</template>
<script>
import {store, mutations} from '../../floweditState.js';
import Item from './autoexec/paramreadonly/index.js';
import Edit from './autoexec/paramedit/index.js';
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    ...Item,
    ...Edit 
  },
  filters: {
  },
  props: {
    defaultAutoexecConfig: Object,
    allPrevNodes: Array, //所有前置节点，用于判断是否是开始节点
    uuid: String //节点uuid
  },
  data() {
    return {
      validateList: ['required'],
      autoFormData: {
        typeConfig: {
          type: 'select',
          name: 'autoexecTypeId',
          dataList: [],
          multiple: false,
          search: true,
          dynamicUrl: '/api/rest/autoexec/type/search',
          params: {
            needPage: false
          },
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getToolClassificationList,
          transfer: true,
          border: 'border'
        },
        combopConfig: {
          type: 'select',
          name: 'autoexecCombopId',
          dataList: [],
          multiple: false,
          search: true,
          dynamicUrl: '/api/rest/autoexec/combop/list',
          params: {
            typeId: null
          },
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          transfer: true,
          border: 'border',
          validateList: ['required']
        }
      },
      autoexecConfig: {
        failPolicy: null,
        autoexecTypeId: null,
        autoexecCombopId: null,
        runtimeParamList: [], //作业参数列表
        executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
        formAttributeList: []
      },
      isShow: false,
      isValid: true, //校验
      runtimeParamList: [], //作业参数列表
      executeParamList: [], //执行参数列表:执行目标、连接协议、执行用户、分批数量
      formAttributeList: [],
      mappingModeList: [
        {
          text: this.$t('page.constant'),
          value: 'constant'
        },
        {
          text: this.$t('page.formparams'),
          value: 'form'
        },
        {
          text: this.$t('term.process.prestepexportparam'),
          value: 'prestepexportparam'
        }
      ],
      formDataList: [],
      exportParamList: [], //自由参数
      allPreNodeExportParamList: [] //当前节点的所有上游节点参数
    };
  },
  beforeCreate() {},
  created() {
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
    initData(val) {
      let config = this.$utils.deepClone(val);
      if (val) {
        Object.keys(this.autoexecConfig).forEach(key => {
          if (config[key]) {
            this.autoexecConfig[key] = config[key];
          }
        });
        if (config.exportParamList) {
          this.exportParamList = config.exportParamList;
        }
        this.getAllPreNodeExportParamList();
        this.saveAutoexecConfig();
      }
    },
    changeType(type) {
      this.autoexecConfig.autoexecCombopId = null;
      this.clearCombopConfig();
      type && (this.autoFormData.combopConfig.params.typeId = type);
      !type && (this.autoFormData.combopConfig.params.typeId = null);
    },
    chnageCombop(val) {
      this.getAutoexecCombop();
    },
    getAutoexecCombop(isFresh) { //组合工具 ；isFresh 是否刷新页面
      let _this = this;
      !isFresh && this.clearCombopConfig();
      if (!this.autoexecConfig.autoexecCombopId) {
        return;
      }
      let data = {
        combopId: this.autoexecConfig.autoexecCombopId
      };
      this.$api.process.process.getAutoexecCombop(data).then(res => {
        if (res.Status == 'OK') {
          let runtimeParamList = res.Return.runtimeParamList || [];
          let executeParamList = res.Return.executeParamList || [];
          let phaseList = res.Return.phaseList || [];
          this.exportParamList = res.Return.exportParamList || [];
          let newRuntimeParamList = [];
          let newExecuteParamList = [];
          runtimeParamList.forEach(item => {
            if (item.type == 'phase') {
              this.$set(item, 'config', {});
              this.$set(item.config, 'dataList', phaseList);
            }
          });
          if (isFresh) {
            runtimeParamList.length > 0 && (newRuntimeParamList = runtimeParamList.map(a => {
              let finditem = this.autoexecConfig.runtimeParamList.find(item => item.key == a.key);
              if (finditem) {
                _this.$set(finditem, 'isRequired', a.isRequired);
                _this.$set(finditem, 'name', a.name);
                if (finditem.type != a.type) {
                  _this.$set(finditem, 'value', a.value || null);
                  _this.$set(finditem, 'type', a.type);
                }
                if (a.config && !_this.$utils.isSame(finditem.config, a.config)) {
                  _this.$set(finditem, 'value', a.value || null);
                  _this.$set(finditem, 'config', a.config);
                }
                a = finditem;
              }
              return a;
            }));
            executeParamList.length > 0 && (newExecuteParamList = executeParamList.map(b => {
              let finditem = this.autoexecConfig.executeParamList.find(item => item.key == b.key);
              if (finditem) {
                b = finditem;
              }
              return b;
            }));
            this.autoexecConfig.runtimeParamList = newRuntimeParamList;
            this.autoexecConfig.executeParamList = newExecuteParamList;
          } else {
            this.autoexecConfig.runtimeParamList = runtimeParamList;
            this.autoexecConfig.executeParamList = executeParamList;
          }
          //当前节点参数
          let exportParamList = this.$utils.deepClone(this.exportParamList);
          exportParamList.length && exportParamList.forEach(e => {
            _this.$set(e, 'text', e.text + '_');
            _this.$set(e, 'value', _this.uuid + '_' + e.value);
          });
          this.nodeExportParamConfig[_this.uuid] = exportParamList;
          mutations.setNodeExportParams(this.nodeExportParamConfig);
        }
      });
    },
    editParams() {
      this.isShow = true;
      this.runtimeParamList = this.$utils.deepClone(this.autoexecConfig.runtimeParamList);
      this.executeParamList = this.$utils.deepClone(this.autoexecConfig.executeParamList);
      this.formAttributeList = this.$utils.deepClone(this.autoexecConfig.formAttributeList);
      this.formDataList = this.$utils.deepClone(this.allFormitemList);
    },
    close() {
      this.isShow = false;
    },
    saveParams() {
      let formValidList = this.$refs.formValid;
      let isValid = true;
      if (formValidList && formValidList.length > 0) {
        formValidList.forEach(v => {
          if (!v.valid()) {
            isValid = false;
          }
        });
      }
      if (!isValid) { return; }
      this.autoexecConfig.runtimeParamList = this.runtimeParamList;
      this.autoexecConfig.executeParamList = this.executeParamList;
      this.autoexecConfig.formAttributeList = this.formAttributeList;
      this.isValid = true;
      this.isShow = false;
    },
    clearCombopConfig() {
      this.autoexecConfig.runtimeParamList = [];
      this.autoexecConfig.executeParamList = [];
      this.autoexecConfig.formAttributeList = [];
    },
    saveAutoexecConfig() { //获取自动化数据
      let _this = this;
      let autoexecConfig = {};
      if (this.autoexecConfig.runtimeParamList.length > 0) {
        this.autoexecConfig.runtimeParamList.forEach(a => {
          a.value = _this.paramValue(a);
        });
      }
      if (this.autoexecConfig.executeParamList.length > 0) {
        this.autoexecConfig.executeParamList.forEach(b => {
          b.value = _this.paramValue(b);
        });
      }
      if (this.allFormitemList.length == 0) {
        this.autoexecConfig.formAttributeList = [];
      }
      for (let key in this.autoexecConfig) {
        if (this.autoexecConfig[key] && this.autoexecConfig[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== '') {
          autoexecConfig[key] = this.autoexecConfig[key];
        }
      }
      this.exportParamList.length && this.$set(autoexecConfig, 'exportParamList', this.exportParamList);
      return autoexecConfig;
    },
    autoexecConfigValid() { //校验
      this.isValid = true;
      this.$refs.autoexecCombop.valid();
      if (this.autoexecConfig.autoexecCombopId) {
        let paramsList = this.autoexecConfig.runtimeParamList.concat(this.autoexecConfig.executeParamList);
        for (let i = 0; i < paramsList.length; i++) {
          if (paramsList[i].isRequired) {
            if (this.$utils.isEmpty(paramsList[i].value)) {
              this.isValid = false;
              break;
            } else {
              let findForm = this.allFormitemList.find(f => f.uuid == paramsList[i].value);
              if (!findForm) {
                this.isValid = false;
                break;
              }
            }
          }
          if (!this.$utils.isEmpty(paramsList[i].value)) {
            this.isValid = !!this.paramValue(paramsList[i]);
          }
        }
      }
      return this.isValid;
    },
    editCombop() { //编辑合租工具
      window.open(HOME + '/autoexec.html#/action-detail?id=' + this.autoexecConfig.autoexecCombopId + '&versionStatus=passed', '_blank');
    },
    refreshCombop() {
      this.$refs.autoexecCombop.initDataListByUrl();
      this.getAutoexecCombop(true);
      this.$Message.success(this.$t('message.executesuccess'));
    },
    addFormParam() {
      let obj = {
        key: '',
        value: ''
      };
      this.formAttributeList.push(obj);
      this.changeFormItem();
    },
    delFormParam(index) {
      this.formAttributeList.splice(index, 1);
      this.changeFormItem();
    },
    changeFormItem() {
      this.formDataList.forEach(e => {
        let find = this.formAttributeList.find(f => f.key == e.uuid);
        if (find) {
          this.$set(e, '_disabled', true);
        } else {
          this.$set(e, '_disabled', false);
        }
      });
    },
    getAllPreNodeExportParamList() {
      let list = [];
      let _this = this;
      this.allPrevNodes.forEach(item => {
        if (item.handler == 'autoexec') {
          let exportParamList = item.stepConfig.autoexecConfig.exportParamList ? _this.$utils.deepClone(item.stepConfig.autoexecConfig.exportParamList) : [];
          exportParamList.length && exportParamList.forEach(e => {
            _this.$set(e, 'text', e.text + '_' + item.name);
            _this.$set(e, 'value', item.uuid + '_' + e.value);
          });
          list.push(...exportParamList);
        }
      });
      this.allPreNodeExportParamList = _this.$utils.deepClone(list);
    },
    changeMappingMode(item) {
      if (item.mappingMode == 'constant' && item.type == 'checkbox') {
        item.value = [];
      } else {
        item.value = '';
      }
    },
    paramValue(item) {
      let nodeExportParamList = [];
      this.nodeExportParamConfig && Object.keys(this.nodeExportParamConfig).forEach(key => {
        if (this.nodeExportParamConfig[key] && this.nodeExportParamConfig[key].length) {
          nodeExportParamList.push(...this.nodeExportParamConfig[key]);
        }
      });
      let value = !this.$utils.isEmpty(item.value) ? this.$utils.deepClone(item.value) : null;
      if (item.isRequired && item.mappingMode == 'form') {
        let findForm = this.allFormitemList.find(f => f.uuid == value);
        !findForm && (value = '');
      } else if (value && item.mappingMode == 'prestepexportparam') {
        let findExport = nodeExportParamList.find(e => e.value == value);
        !findExport && (value = '');
      }
      return value;
    },
    executeMappingModeList(key) {
      let list = this.$utils.deepClone(this.mappingModeList);
      if (key === 'roundCount') {
        return list.filter(item => {
          return item.value != 'constant' && item.value != 'prestepexportparam';
        });
      } else {
        return list.filter(item => {
          return item.value != 'constant';
        });
      }
    }
  },
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    },
    nodeExportParamConfig() {
      return store.nodeExportParamConfig;
    },
    paramText() {
      return (value, type) => {
        let text = '-';
        if (value) {
          let findConfig = null;
          if (type == 'form') { //表单text
            findConfig = this.allFormitemList.find(item => item.uuid == value);
            findConfig && (text = findConfig.label);
          } else if (type == 'prestepexportparam') { //上游参数text
            findConfig = this.allPreNodeExportParamList.find(item => item.value == value);
            findConfig && (text = findConfig.text);
          } else if (type == 'export') { //当前参数text
            findConfig = this.exportParamList.find(item => item.value == value);
            findConfig && (text = findConfig.text);
          }
        }
        return text;
      };
    },
    paramType() {
      return (type, key) => {
        let handler = type ? type + key : 'text' + key;
        return handler;
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
    },
    getruntimeParamListText() {
      return (value) => {
        let findItem = this.autoexecConfig.runtimeParamList.find(item => item.key === value);
        if (findItem) {
          return findItem.name;
        } else {
          return '';
        }
      };
    }
  },
  watch: {
    defaultAutoexecConfig: {
      handler(val) {
        if (val && JSON.stringify(val) != '{}') {
          this.initData(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.params-top{
  display: flex;
  align-items: center;
  padding: 10px 0;
  justify-content: space-between;
}
.params-box{
  padding: 10px;
  border-radius: 6px;
  .param-type-list{
    &:not(:last-of-type){
      padding-bottom: 16px;
    }
  }
  .title{
    padding-bottom: 10px;
  }
  .param-list{
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .param-title {
      min-width: 80px;
    }
    &:not(:last-of-type){
      padding-bottom: 10px;
    }
    .param-value{
      flex-grow: 1;
      text-align: right;
      white-space: nowrap;
      /deep/ .tag-item-text{
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
      }
    }
  }
}
.pl8{
  padding-left: 8px;
}
.dialog-params{
  .title,
  .param-list{
    padding-bottom: 10px;
  }
  .item-list {
    padding-bottom: 10px;
    line-height: 32px;
  }
  .pr4{
    padding-right: 4px;
  }
  .form-param-list{
    position: relative;
    padding-right: 20px;
    padding-bottom: 10px;
    .del-btn{
      position: absolute;
      right: 0;
      top: 6px;
      display: none;
    }
    &:hover{
      .del-btn{
        display: block;
      }
    }
  }
}
</style>
