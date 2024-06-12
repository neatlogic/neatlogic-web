<template>
  <div>
    <div class="deal-list permission-list">
      <div class="deal-top pb-xs">
        <TsRow>
          <Col span="12">
            <div class="title">
              <div class="text-grey require-label">{{ $t('term.process.poliyuser') }}</div>
              <div class="text-tip overflow">{{ $t('page.mousedragsort') }}</div>
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
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">{{ $t('term.process.prestep') }}</div>
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
                    <div class="title text-left text-tip form-label">{{ $t('term.process.assigngoals') }}</div>
                    <div class="text custom-select">
                      <TsFormSelect
                        v-model="item.config.groupList"
                        :dataList="dataGroupList"
                        border="border"
                        multiple
                        transfer
                        @change="()=>changeGroupList(item.config.groupList)"
                      ></TsFormSelect>
                    </div>
                  </div>
                  <div class="text-list">
                    <div class="title text-left text-tip form-label">{{ $t('term.process.assignscope') }}</div>
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
                    <div class="title text-left text-tip">{{ $t('page.isrequired') }}</div>
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
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">{{ $t('term.process.prestep') }}</div>
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
                  <div class="text-list">
                    <div v-if="!formUuid" class="text-tip">
                      {{ $t('term.process.norelformtip') }}
                      <a class="text-href" href="javascript:void(0);" @click="toSetting">{{ $t('term.process.flowsetting') }}</a>
                      {{ $t('term.process.relform') }}
                    </div>
                    <div v-else-if="!formItemList || formItemList.length == 0" class="text-tip">
                      {{ $t('term.process.nouserformitemtip') }}
                      <a href="javascript:void(0);" @click="toSetting">{{ $t('term.process.flowsetting') }}</a>
                      {{ $t('term.process.reviserelform') }}
                    </div>
                    <div v-else>
                      <div class="title text-left require-label text-tip form-label">{{ $t('term.process.formvalue') }}</div>
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
                      <div class="title text-left require-label text-tip form-label">{{ $t('term.process.dispatcher') }}</div>
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
                            @change="() => changeDispatcher(item.config.handler)"
                          ></TsFormSelect>
                        </div>
                      </div>
                    </div>
                    <Component
                      :is="handleComponent(item.config.handler)"
                      ref="dispatcherForm"
                      :value="item.config.handlerConfig"
                      :formConfig="getDispatcherConfig(item.config.handler)"
                      :allFormitemList="allFormitemList"
                    >
                    </Component>
                  </div>
                </div>
              </div>
              <div v-if="item.type == 'assign'" class="list">
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
                  <div class="text-list">
                    <div class="title text-left require-label text-tip form-label">{{ $t('term.process.dealwithuser') }}</div>
                    <div class="text custom-select">
                      <div class="input-border" style="width:100%;">
                        <UserSelect
                          ref="dealValue"
                          v-model="item.config.workerList"
                          v-bind="dealwithuserConfig"
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
          <span class="label require-label">{{ $t('term.process.erroruser') }}</span>
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
import dispatcherComponent from './dispatcher/index.js';
export default {
  name: 'AssignSetting',
  components: {
    vuedraggable,
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    UserSelect: () => import('@/resources/components/UserSelect/UserSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    ...dispatcherComponent
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
    return {
      groupTeam: ['team'], //分派器分组
      isValid: true, //是否校验通过
      formItemList: [], //表单授权列表
      copyPrevNodes: this.prevNodes || [], //复制前置步骤
      processStepUuidList: '', //前置步骤值
      processStepAssignList: [], //指派步骤
      policyListFormList: [], //表单值列表
      policyListAttributeUuidList: [], //表单值默认值
      validateSelectList: ['required'],
      executeModeList: [
        {
          value: 'batch',
          text: this.$t('term.process.matchall')
        },
        {
          value: 'sort',
          text: this.$t('term.process.matchsort')
        }
      ],
      workerPolicyConfig: { executeMode: 'batch', policyList: [] },
      policyList: [
        {
          name: this.$t('term.process.preuserappoint'),
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
          name: this.$t('term.process.copypreuser'),
          isChecked: 0,
          config: {
            processStepUuid: []
          }
        },
        {
          type: 'form',
          name: this.$t('term.process.formvalue'),
          isChecked: 0,
          config: {
            attributeUuidList: []
          }
        },
        {
          type: 'automatic',
          name: this.$t('term.process.dispatcher'),
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
      automaticFormValue: [], //分派器表单值
      dataGroupList: [ //指派目标类型
        {
          text: this.$t('page.usertype'),
          value: 'user'
        },
        {
          text: this.$t('page.teamtype'),
          value: 'team'
        },
        {
          text: this.$t('page.roletype'),
          value: 'role'
        }
      ],
      groupList: ['user', 'role', 'team'],
      dealwithuserConfig: {
        border: 'border',
        validateList: ['required'],
        groupList: ['processUserType', 'user', 'team', 'role'],
        excludeList: [
          'processUserType#major',
          'processUserType#minor',
          'processUserType#agent',
          'processUserType#defaultworker',
          'processUserType#worker']
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
    getAssignt(obj) {
      //获取自定义处理人
      let config = this.$utils.deepClone(obj);
      if (JSON.stringify(config) != '{}') {
        let {policyList = []} = config || {};
        Object.keys(this.workerPolicyConfig).forEach(key => {
          if (config[key]) {
            this.workerPolicyConfig[key] = config[key];
          }
        });
        if (policyList) {
          this.policyList = policyList;
          this.policyList.forEach((item, index) => {
            if (item.type == 'prestepassign') {
              this.processStepAssignList = item.config.processStepUuidList;
            }
            if (item.type == 'copy') {
              this.processStepUuidList = item.config.processStepUuid;
            }
            if (item.type == 'form') {
              this.policyListAttributeUuidList = item.config.attributeUuidList;
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
      } else if (item.type == 'assign') {
        item.config.workerList = null;
      }
    },
    getFormItem() {
      //获取表单指定版本的数据，渲染表单
      this.$set(this, 'formItemList', []);
      let formitem = [];
      this.$set(this, 'formItemList', formitem);
      if (this.policyListAttributeUuidList && this.policyListAttributeUuidList.length > 0) {
        let newPolicyListAttributeUuid = [];
        this.policyListAttributeUuidList.forEach(item => {
          let formItem = this.allFormitemList.find(f => f.uuid == item);
          formItem && newPolicyListAttributeUuid.push(item);
        });
        newPolicyListAttributeUuid.length == 0 && (this.policyListAttributeUuidList = []);
        newPolicyListAttributeUuid.length > 0 && (this.policyListAttributeUuidList = newPolicyListAttributeUuid);
      }
    },
    saveAssignData() {
      let data = {
        executeMode: this.workerPolicyConfig.executeMode,
        defaultWorker: this.defaultWorker
      };
      this.policyList.forEach((item) => {
        if (item.type == 'prestepassign') {
          item.config.processStepUuidList = this.processStepAssignList;
        }
        if (item.type == 'copy') {
          item.config.processStepUuid = this.processStepUuidList;
        }
        if (item.type == 'form') {
          item.config.attributeUuidList = this.policyListAttributeUuidList;
        }
        if (item.type == 'automatic') {
          item.config.handlerConfig = this.$refs.dispatcherForm && this.$refs.dispatcherForm[0] && this.$refs.dispatcherForm[0].saveData() || {};
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
      let dispatcherFormList = this.$refs.dispatcherForm || [];
      for (let i = 0; i < dispatcherFormList.length; i++) {
        if (dispatcherFormList[i] && dispatcherFormList[i].valid && !dispatcherFormList[i].valid()) {
          this.isValid = false;
        }
      }
      this.$refs.defaultWorker && this.$refs.defaultWorker.valid();
    },
    changeDispatcher() {
      //选择分派器
      let findDispatcherItem = this.policyList.find((v) => v.type == 'automatic');
      let {config = {}} = findDispatcherItem || {};
      let {handler = ''} = config;
      if (!this.$utils.isEmpty(findDispatcherItem) && !this.$utils.isEmpty(handler)) {
        this.$set(findDispatcherItem['config'], 'handlerConfig', {});
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
    },
    changeGroupList(val) { 
      // 由前置步骤处理人指定，根据指派目标，过滤指派范围
      this.policyList.map(e => {
        if (e.type == 'prestepassign') {
          e.config.rangeList = [];
        }
        return e;
      });
      if (val && val.length > 0) {
        this.groupList = val;
      } else {
        this.groupList = ['user', 'role', 'team'];
      }
    }
  },
  filter: {},
  computed: {
    allFormitemList() {
      return store.allFormitemList;
    },
    automaticList() {
      return store.automaticList;
    },
    getDispatcherName() {
      // 获取分派器名称
      return (handlerDispatcher) => {
        const arr = handlerDispatcher && handlerDispatcher.split('.') || [];
        return arr[arr.length - 1];
      };
    },
    handleComponent() {
      return (handler) => {
        let dispatcherName = this.getDispatcherName(handler);
        let componentList = Object.keys(dispatcherComponent) || [];
        if (componentList.includes(dispatcherName)) {
          return dispatcherName;
        } else {
          return 'DefaultDispatcher';
        }
      };
    },
    getDispatcherConfig() {
      return (handler) => {
        let findItem = this.automaticList.find((v) => v.handler == handler);
        if (!this.$utils.isEmpty(findItem)) {
          return findItem.config;
        } else {
          return [];
        }
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
