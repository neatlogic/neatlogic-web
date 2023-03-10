<template>
  <div>
    <div class="deal-list permission-list">
      <div class="deal-top pb-xs">
        <TsRow>
          <Col span="12">
            <div class="title">
              <div class="text-grey require-label">分配处理人</div>
              <div class="text-tip overflow">鼠标拖动排序</div>
            </div>
          </Col>
          <Col span="12">
            <TsFormSelect
              v-model="workerPolicyConfig.executeMode"              
              :dataList="executeModeList"
              :clearable="false"
              border="border"
            ></TsFormSelect>
          </Col>
        </TsRow>
      </div>
      <div class="edit-setting" :class="isValid == false ? 'border-error' : ''">
        <vuedraggable v-model="policyList" :options="{ chosenClass: 'choose', animation: '150' }">
          <transition-group>
            <div v-for="item of policyList" :key="item.type" class="move">
              <div v-if="item.type == 'prestepassign'" class="list">
                <div class="top">
                  <span class="ts-bars move-btn"></span>
                  <span>{{ item.name }}</span>
                  <div class="custom-checkbox">
                    <Checkbox
                      v-model="item.isChecked"
                      :true-value="1"
                      :false-value="0"
                      @on-change="changeStep(item)"
                    ></Checkbox>
                  </div>
                </div>
                <div v-if="item.isChecked == 1" class="content">
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">前置步骤</div>
                    <div class="text custom-select">
                      <div class="input-border">
                        <TsFormSelect
                          ref="dealValue"
                          v-model="processStepAssignList"
                          multiple
                          :dataList="returnNewPrevNodes(copyPrevNodes)"
                          textName="name"
                          valueName="uuid"
                          border="border"
                          :validateList="validateSelectList"
                          transfer
                        ></TsFormSelect>
                      </div>
                    </div>
                  </div>
                  <div class="text-list">
                    <div class="title text-left text-tip form-label">指派目标</div>
                    <div class="text custom-select">
                      <TsFormSelect
                        v-model="item.config.groupList"
                        :dataList="dataGroupList"
                        border="border"
                        multiple
                        transfer
                      ></TsFormSelect>
                    </div>
                  </div>
                  <div class="text-list">
                    <div class="title text-left text-tip form-label">指派范围</div>
                    <div class="text custom-select">
                      <div class="input-border">
                        <UserSelect
                          v-model="item.config.rangeList"
                          :groupList="groupList"
                          border="border"
                          multiple
                        ></UserSelect>
                      </div>
                    </div>
                  </div>
                  <div class="text-list">
                    <div class="title text-left text-tip">是否必填</div>
                    <div class="text custom-select">
                      <div class="text-right">
                        <i-switch v-model="item.config.isRequired" :true-value="1" :false-value="0"></i-switch>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="item.type == 'copy'" class="list">
                <div class="top">
                  <span class="ts-bars move-btn"></span>
                  <span>{{ item.name }}</span>
                  <div class="custom-checkbox">
                    <Checkbox
                      v-model="item.isChecked"
                      :true-value="1"
                      :false-value="0"
                      @on-change="changeStep(item)"
                    ></Checkbox>
                  </div>
                </div>
                <div v-if="item.isChecked == 1" class="content">
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">前置步骤</div>
                    <div class="text custom-select">
                      <div class="input-border">
                        <TsFormSelect
                          ref="dealValue"
                          v-model="processStepUuidList"
                          :dataList="returnNewPrevNodes(copyPrevNodes)"
                          textName="name"
                          valueName="uuid"
                          border="border"
                          :validateList="validateSelectList"
                          transfer
                        ></TsFormSelect>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="item.type == 'form'" class="list">
                <div class="top">
                  <span class="ts-bars move-btn"></span>
                  <span>{{ item.name }}</span>
                  <div class="custom-checkbox">
                    <Checkbox
                      v-model="item.isChecked"
                      :true-value="1"
                      :false-value="0"
                      @on-change="changeStep(item)"
                    ></Checkbox>
                  </div>
                </div>
                <div v-if="item.isChecked == 1" class="content">
                  <div class="text-list">
                    <div v-if="!formUuid" class="text-tip">
                      当前流程未关联任何表单，请前往
                      <a class="text-href" href="javascript:void(0);" @click="toSetting">{{ $t('term.process.flowsetting') }}</a>
                      关联表单
                    </div>
                    <div v-else-if="!formItemList || formItemList.length == 0" class="text-tip">
                      当前关联表单无可选组件（用户选择器或者下拉框），请前往
                      <a href="javascript:void(0);" @click="toSetting">{{ $t('term.process.flowsetting') }}</a>
                      修改关联表单
                    </div>
                    <div v-else>
                      <div class="title text-left require-label text-tip form-label">表单值</div>
                      <div class="text input-border custom-select">
                        <TsFormSelect
                          ref="dealValue"
                          v-model="policyListAttributeUuidList"
                          :dataList="formItemList"
                          textName="text"
                          valueName="value"
                          border="border"
                          :validateList="validateSelectList"
                          :firstSelect="false"
                          multiple
                          transfer
                        ></TsFormSelect>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="item.type == 'automatic'" class="list">
                <div class="top">
                  <span class="tsfont-bar move-btn"></span>
                  <span>{{ item.name }}</span>
                  <div class="custom-checkbox">
                    <Checkbox
                      v-model="item.isChecked"
                      :true-value="1"
                      :false-value="0"
                      @on-change="changeStep(item)"
                    ></Checkbox>
                  </div>
                </div>
                <div v-if="item.isChecked == 1" class="content">
                  <div>
                    <div class="text-list">
                      <div class="title text-left require-label text-tip form-label">分派器</div>
                      <div class="text custom-select">
                        <div class="input-border">
                          <TsFormSelect
                            ref="dealValue"
                            v-model="item.config.handler"
                            :dataList="automaticList"
                            textName="name"
                            valueName="handler"
                            border="border"
                            :validateList="validateSelectList"
                            transfer
                            @on-change="selectAutomatic(item.config.handler)"
                          ></TsFormSelect>
                        </div>
                      </div>
                    </div>
                    <div v-if="automaticDeal.length > 0" class="text-list">
                      <div v-for="automatic in automaticDeal" :key="automatic.name">
                        <div class="title text-left require-label overflow text-tip form-label" :title="automatic.label">{{ automatic.label }}</div>
                        <div class="text custom-select">
                          <div class="input-border">
                            <div
                              v-if="automatic.type == 'formselect'"
                            >
                              <TsFormSelect
                                ref="dealValue"
                                v-model="item.config.handlerConfig[automatic.name]"
                                v-bind="automatic"
                                :dataList="automaticFormList"
                                :firstSelect="false"
                                textName="label"
                                valueName="uuid"
                                border="border"
                                transfer
                              ></TsFormSelect>
                              <div v-if="!formUuid" class="text-tip">
                                当前流程未关联任何表单，请前往
                                <span class="text-href" @click="toSetting">{{ $t('term.process.flowsetting') }}</span>
                                关联表单
                              </div>
                            </div>
                            <!-- 处理人领导分派器 -->
                            <div v-else-if="automatic.policy && automatic.policy=='preStepList'">
                              <TsFormSelect
                                ref="dealValue"
                                v-model="item.config.handlerConfig[automatic.name]"
                                v-bind="automatic"
                                :dataList="copyPrevNodes"
                                textName="name"
                                valueName="uuid"
                                border="border"
                                :firstSelect="false"
                                transfer
                              ></TsFormSelect>
                            </div>
                            <div
                              :is="getAutomaticType(automatic.type)"
                              v-else
                              ref="dealValue"
                              v-model="item.config.handlerConfig[automatic.name]"
                              v-bind="automatic"
                              border="border"
                              :firstSelect="false"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="item.type == 'assign'" class="list">
                <div class="top">
                  <span class="ts-bars move-btn"></span>
                  <span>{{ item.name }}</span>
                  <div class="custom-checkbox">
                    <Checkbox
                      v-model="item.isChecked"
                      :true-value="1"
                      :false-value="0"
                      @on-change="changeStep(item)"
                    ></Checkbox>
                  </div>
                </div>
                <div v-if="item.isChecked == 1" class="content">
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">{{ $t('term.process.dealwithuser') }}</div>
                    <div class="text custom-select">
                      <div class="input-border" style="width:100%;">
                        <UserSelect
                          ref="dealValue"
                          v-model="item.config.workerList"
                          border="border"
                          :validateList="validateSelectList"
                          :groupList="workerGroupList"
                          :excludeList="excludeList"
                        ></UserSelect>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </vuedraggable>
      </div>
    </div>
    <div id="defaultWorker" class="settingList">
      <div class="control-box">
        <div class="control-setting">
          <span class="label require-label">异常处理人</span>
        </div>
      </div>
      <div class="input-border permission-list">
        <UserSelect
          ref="defaultWorker"
          v-model="defaultWorker"
          width="100%"
          :multiple="false"
          :validateList="validateSelectList"
          :groupList="groupList"
          border="border"
        ></UserSelect>
      </div>
    </div>
  </div>
</template>
<script>
import vuedraggable from 'vuedraggable';
import {store, mutations} from '../../floweditState.js';
export default {
  name: 'AssignSetting',
  components: {
    vuedraggable,
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    UserSelect: resolve => require(['@/resources/components/UserSelect/UserSelect'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  props: {
    prevNodes: {
      type: Array,
      default: () => []
    },
    toSetting: Function,
    formUuid: { type: [String, Number] },
    defaultWorkerPolicyConfig: { type: Object, default: () => {} }
  },
  data() {
    let _this = this;
    return {
      groupTeam: ['team'], //分派器分组
      isValid: true, //是否校验通过
      formItemList: [], //表单授权列表
      automaticDeal: [], //分派器处理组
      copyPrevNodes: _this.prevNodes || [], //复制前置步骤
      processStepUuidList: '', //前置步骤值
      processStepAssignList: [], //指派步骤
      policyListFormList: [], //表单值列表
      policyListAttributeUuidList: [], //表单值默认值
      validateSelectList: ['required'],
      executeModeList: [
        {
          value: 'batch',
          text: '全部匹配'
        },
        {
          value: 'sort',
          text: '顺序匹配'
        }
      ],
      workerPolicyConfig: { executeMode: 'batch', policyList: [] },
      policyList: [
        {
          name: '由前置步骤处理人指定',
          type: 'prestepassign',
          isChecked: 0,
          config: {
            isRequired: 0,
            processStepUuidList: [],
            rangeList: [],
            groupList: []
          }
        },
        {
          type: 'copy',
          name: '复制前置步骤处理人',
          isChecked: 0,
          config: {
            processStepUuid: []
          }
        },
        {
          type: 'form',
          name: '表单值',
          isChecked: 0,
          config: {
            attributeUuidList: []
          }
        },
        {
          type: 'automatic',
          name: '分派器',
          isChecked: 0,
          config: {
            handler: '',
            handlerConfig: {}
          }
        },
        {
          type: 'assign',
          name: this.$t('page.custom'),
          isChecked: 0,
          config: {
            workerList: []
          }
        }
      ],
      defaultWorker: null, //异常处理人
      automaticFormList: [], //分派器表单组件列表
      automaticFormValue: [], //分派器表单值
      dataGroupList: [ //指派目标类型
        {
          text: '用户类型',
          value: 'user'
        },
        {
          text: '组类型',
          value: 'team'
        },
        {
          text: '角色类型',
          value: 'role'
        }
      ],
      groupList: ['user', 'role', 'team'],
      workerGroupList: ['processUserType', 'user', 'team', 'role'],
      excludeList: ['processUserType#major', 'processUserType#minor', 'processUserType#agent', 'processUserType#defaultworker', 'processUserType#worker']
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
    getAssignt(obj) {
      //获取自定义处理人
      let config = this.$utils.deepClone(obj);
      if (JSON.stringify(config) != '{}') {
        Object.keys(this.workerPolicyConfig).forEach(key => {
          if (config[key]) {
            this.workerPolicyConfig[key] = config[key];
          }
        });
        if (config.policyList) {
          this.policyList = config.policyList;
          this.policyList.forEach((item, index) => {
            if (item.type == 'prestepassign') {
              this.processStepAssignList = item.config.processStepUuidList;
              // item.config.groupList.length > 0 && (this.groupList = item.config.groupList);
            }
            if (item.type == 'copy') {
              this.processStepUuidList = item.config.processStepUuid;
            }
            if (item.type == 'form') {
              this.policyListAttributeUuidList = item.config.attributeUuidList;
            }
            if (item.type == 'automatic' && item.config && item.config.handler != '') {
              this.selectAutomatic(item.config.handler, 'init');
            }
          });
        }
      }
      this.defaultWorker = config.defaultWorker;
    },
    changeStep(item) {
      if (item.type == 'prestepassign') {
        this.processStepAssignList.splice(0);
        item.config.rangeList = [];
        item.config.groupList = [];
        item.config.isRequired = 0;
      } else if (item.type == 'copy') {
        this.processStepUuidList = null;
      } else if (item.type == 'form') {
        this.policyListAttributeUuidList = [];
      } else if (item.type == 'automatic') {
        item.config.handler = null;
        item.config.handlerConfig = {};
        this.automaticDeal = [];
      } else if (item.type == 'assign') {
        item.config.workerList = null;
      }
    },
    getFormItem() {
      //获取表单指定版本的数据，渲染表单
      let _this = this;
      _this.$set(_this, 'formItemList', []);
      _this.clearAutomaticForm();
      let plugin = _this.allFormitemList || [];
      let formitem = [];
      if (plugin && plugin.length > 0) {
        plugin.forEach(plugins => {
          //只能选择用户选择器、下拉框
          if (plugins.handler == 'formuserselect' || plugins.handler == 'formselect') {
            let conf = {
              value: plugins.uuid,
              text: plugins.label
            };
            formitem.push(conf);
          }
        });
      }
      _this.$set(_this, 'formItemList', formitem);
      if (this.policyListAttributeUuidList && this.policyListAttributeUuidList.length > 0) {
        let newPolicyListAttributeUuid = [];
        _this.policyListAttributeUuidList.forEach(item => {
          let formItem = _this.allFormitemList.find(f => f.uuid == item);
          formItem && newPolicyListAttributeUuid.push(item);
        });
        newPolicyListAttributeUuid.length == 0 && (this.policyListAttributeUuidList = []);
        newPolicyListAttributeUuid.length > 0 && (this.policyListAttributeUuidList = newPolicyListAttributeUuid);
      }
      //分派器表单
      _this.automaticFormList = _this.$utils.deepClone(plugin);
    },
    saveAssignData() {
      let data = {
        executeMode: this.workerPolicyConfig.executeMode,
        defaultWorker: this.defaultWorker
      };
      this.policyList.forEach((item, index) => {
        if (item.type == 'prestepassign') {
          item.config.processStepUuidList = this.processStepAssignList;
        }
        if (item.type == 'copy') {
          item.config.processStepUuid = this.processStepUuidList;
        }
        if (item.type == 'form') {
          item.config.attributeUuidList = this.policyListAttributeUuidList;
        }
      });
      this.$set(data, 'policyList', this.policyList);
      this.assignValid();
      return data;
    },
    assignValid() {
      //校验分配处理人
      this.isValid = true;
      let arr = this.$refs.dealValue || [];
      if (arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          if (!arr[i].valid()) {
            this.isValid = false;
          }
        }
      } else {
        this.isValid = false;
      }
      this.$refs.defaultWorker && this.$refs.defaultWorker.valid();
    },
    selectAutomatic(handler, type) {
      //选择分派器
      let automaticObj = this.policyList.find(p => p.type === 'automatic');
      if (handler) {
        var newObj = this.automaticList.find(d => d.handler === handler);

        if (!newObj) {
          this.policyList.map(p => {
            if (p.type == 'automatic') {
              p.config.handler = '';
              p.config.handlerConfig = {};
            }
            return p;
          });
        } else if (newObj && newObj.config) {
          let config = newObj.config;
          this.automaticDeal = newObj.config;
          if (type != 'init') {
            this.$set(automaticObj.config, 'handlerConfig', {});
            this.automaticDeal.forEach(item => {
              if (!automaticObj.config.handlerConfig[item.name]) {
                this.$set(automaticObj.config.handlerConfig, item.name, null);
              }
            });
            this.clearAutomaticForm();
          }
        }
      } else {
        automaticObj.config.handlerConfig = {};
        this.automaticDeal = [];
      }
    },
    clearAutomaticForm() { //清空分派器选中表单的数据
      let _this = this;
      if (this.automaticDeal && this.automaticDeal.length > 0) {
        this.automaticDeal.forEach(item => {
          if (item.type == 'formselect') {
            _this.policyList.forEach(m => {
              if (m.type == 'automatic' && m.config.handlerConfig && m.config.handlerConfig[item.name]) {
                let findFormitem = _this.automaticFormList.find(f => f.uuid == m.config.handlerConfig[item.name]);
                if (!findFormitem) {
                  m.config.handlerConfig[item.name] = null;
                }
              }
            });
          }
        });
      }
    },
    returnNewPrevNodes(prevNodes) { //前置步骤过滤掉定时节点
      let newData = [];
      if (prevNodes) {
        let list = prevNodes.filter(p => p.handler != 'timer');
        if (list) {
          newData = list;
        }
      }
      return newData;
    }
    // changeGroupList(val) { //改变指派目标
    //   this.policyList.map(e => {
    //     if (e.type == 'prestepassign') {
    //       e.config.rangeList = [];
    //     }
    //     return e;
    //   });
    //   if (val && val.length > 0) {
    //     this.groupList = val;
    //   } else {
    //     this.groupList = ['user', 'role', 'team'];
    //   }
    // }
  },
  filter: {},
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    },
    automaticList() {
      return store.automaticList;
    },
    getAutomaticType() {
      return (type) => {
        let handler = 'TsFormSelect';
        if (type == 'userselect') {
          handler = 'UserSelect';
        } else if (type == 'text') {
          handler = 'TsFormInput';
        }
        return handler;
      };
    }
  },
  watch: {
    defaultWorkerPolicyConfig: {
      handler(val) {
        if (val && JSON.stringify(val) != '{}') {
          this.getAssignt(val);
        }
      },
      deep: true,
      immediate: true
    },
    allFormitemList: {
      handler(val) {
        this.getFormItem();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
  .deal-list {
    .edit-setting {
      .top {
        background: transparent;
        padding: 0;
        .move-btn {
          margin-right: 6px;
          cursor: move;
        }
        .custom-checkbox {
          position: absolute;
          top: 0;
          right: 0;
        }
      }
      .form-label {
        line-height: 30px;
      }
    }
  }
</style>
