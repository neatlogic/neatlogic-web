<template>
  <TsDialog
    v-bind="actionTsDialog"
    :isShow="isShow"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <template v-slot>
      <TsForm ref="reportForm" :item-list="reportInstanceFormConfig">
        <template v-slot:integrationConfig>
          <div>
            <Row>
              <Col :span="rowSpan">
                <TsFormSelect
                  ref="integrationUuid"
                  v-model="integrationUuid"
                  v-bind="integrationConfig"
                  search
                  transfer
                  :selectItemList.sync="integrationItemList"
                  @change="clearIntegrationrelation"
                >
                  <template slot="first-ul">
                    <li class="tsfont-plus text-href first-slot" @click.stop="toIntegration()">
                      外部调用
                    </li>
                  </template>
                </TsFormSelect>
              </Col>
              <Col v-if="integrationUuid" span="2" class="text-right"><i class="tsfont-edit btn-tointegration text-action" :title="$t('page.edit')" @click="toIntegration(integrationUuid)"></i></Col>
              <Col v-if="integrationUuid" span="2" class="text-right"><i class="ts-rotate-right btn-tointegration text-action" :title="$t('page.refresh')" @click="refreshIntegration(integrationUuid)"></i></Col>
            </Row>
          </div>
        </template>
      </TsForm>

      <div>
        <!-- <div class="form-block">
          <span class="block-left require-label-right">触发条件</span>
          <div clss="block-right">
            <TsFormSelect
              ref="trigger"
              v-model="trigger"
              search
              transfer
              :dataList="triggerList"
              valueName="trigger"
              textName="triggerName"
              :validateList="vaild"
              width="75%"
              border="border"
            ></TsFormSelect>
          </div>
        </div> -->
        
        <!-- <div class="form-block">
          <span class="block-left require-label-right">外部调用</span>
          <div clss="block-right">
            <Row>
              <Col span="18">
                <TsFormSelect
                  ref="integrationUuid"
                  v-model="integrationUuid"
                  v-bind="integrationConfig"
                  search
                  transfer
                  :selectItemList.sync="integrationItemList"
                  @change="clearIntegrationrelation"
                >
                  <template slot="first-ul">
                    <li class="tsfont-plus text-href first-slot" @click.stop="toIntegration()">
                      外部调用
                    </li>
                  </template>
                </TsFormSelect>
              </Col>
              <Col v-if="integrationUuid" span="2" class="text-right"><i class="tsfont-edit btn-tointegration text-action" title="编辑数据源" @click="toIntegration(integrationUuid)"></i></Col>
              <Col v-if="integrationUuid" span="2" class="text-right"><i class="ts-rotate-right btn-tointegration text-action" title="刷新数据源" @click="refreshIntegration(integrationUuid)"></i></Col>
            </Row>
          </div>
        </div> -->
        <div v-if="integrationUuid && paramMappingList && paramMappingList.length>0 && inputParamList.length > 0" class="form-block">
          <span class="block-left">{{ $t('term.autoexec.paramsvalue') }}</span>
          <div clss="block-right">
            <div class="bg-op block-interg">
              <TsRow
                v-for="(param,pindex) in inputParamList"
                :key="pindex"
                :gutter="8"
                class="param-list"
              >
                <Col span="8">
                  <div class="disabled-text text-tip overflow" :title="param.name"><span :class="param.isRequired && param.isRequired==1?'require-label':''"></span>{{ param.name }}</div>
                </Col>
                <Col span="16">
                  <TsFormSelect
                    :ref="param.isRequired==1?'inputparam'+pindex:''"
                    v-model="paramMappingList[pindex].value"
                    search
                    transfer
                    :dataList="paraConditionList"
                    textName="label"
                    valueName="name"
                    :validateList="param.isRequired==1?vaild:[]"
                    allow-create
                    @change="getParamtype(paramMappingList[pindex])"
                  ></TsFormSelect>
                </Col>
              </TsRow>
            </div>

          </div>
        </div>
        <div v-if="integrationUuid" class="form-block">
          <span class="block-left">
            <span>
              <Tooltip
                placement="bottom"
                max-width="300"
                transfer
                theme="light"
              >
                <b class="tsfont-info-o text-href"></b>
                <div slot="content">
                  <p>{{ $t('term.process.successjudgmenttip') }}</p>
                </div>
              </Tooltip>
            </span>
            <span>{{ $t('page.successjudgment') }}</span>
          </span>
          <div clss="block-right">
            <div style="padding:6px 0;" :title="outputParamList.length > 0?'':$t('term.process.extcallnoparamtip')">
              <span style="display: inline-block;">
                <TsFormSwitch
                  v-model="isSuccessactive"
                  true-value="1"
                  false-value="0"
                  :disabled="outputParamList.length > 0 ? false : true"
                ></TsFormSwitch>
              </span>
              <span :class="outputParamList.length > 0?'tip':'tip text-tip'" style="margin-left:4px;">{{ isSuccessactive == "1" ? $t('page.custom'): $t('page.default') }}</span>
            </div>
            <div v-if="isSuccessactive =='1'" class="bg-op block-interg" style="width:100%;">
              <TsRow :gutter="6">
                <Col span="8">
                  <TsFormSelect
                    v-model="successCondition.name"
                    transfer
                    :dataList="outputParamList"
                    textName="name"
                    valueName="name"
                    @change="clearExpression"
                  ></TsFormSelect>
                </Col>
                <Col span="6">
                  <TsFormSelect
                    v-model="successCondition.expression"
                    transfer
                    :dataList="getExpression(successCondition.name)"
                    textName="expressionName"
                    valueName="expression"
                  > </TsFormSelect>
                </Col>
                <Col span="10">
                  <TsFormInput v-model="successCondition.value" maxlength="50"> </TsFormInput>
                </Col>
              </TsRow>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsForm from '@/resources/plugins/TsForm/TsForm';
export default {
  name: 'ActionEdit',
  components: {
    TsForm,
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsDialog: resolve => require(['@/resources/plugins/TsDialog/TsDialog.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput.vue'], resolve)
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    triggerList: Array,
    editList: [Object, Boolean],
    type: {
      type: String,
      default: 'add'
    },
    paraConditionList: Array,
    integrationHandler: {
      type: String,
      default: ''
    }
  },
  data() {
    let _this = this;
    return {
      rowSpan: 20,
      reportInstanceFormConfig: {
        trigger: {
          type: 'select',
          label: this.$t('page.triggercondition'),
          value: _this.trigger,
          dataList: _this.triggerList,
          valueName: 'trigger',
          textName: 'triggerName',
          validateList: ['required'],
          transfer: true
          // firstText: '添加帐号',
          // firstLi: true,
          // rootName: 'tbodyList'
        },
        integrationConfig: {
          type: 'slot',
          label: this.$t('term.process.externalcall'),
          value: _this.integrationUuid,
          validateList: ['required'],
          dynamicUrl: '/api/rest/integration/search',
          rootName: 'tbodyList',
          params: { handler: _this.integrationHandler, needPage: false },
          textName: 'name',
          transfer: true
        }
      },
      vaild: ['required'],
      actionTsDialog: {
        title: this.$t('term.process.actionsetting'),
        maskClose: false,
        height: '200px'
      },
      integrationConfig: {
        validateList: ['required'],
        dynamicUrl: '/api/rest/integration/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'uuid',
        border: 'border',
        params: { handler: _this.integrationHandler }
      },
      integrationItemList: null, //选中的外部数据源整条数据
      trigger: '',
      integrationUuid: '',
      paramMappingList: [],
      successCondition: {
        name: '',
        expression: '',
        value: ''
      },
      inputParamList: [], //输入参数，用于成功参数
      outputParamList: [], //输出参数，用于成功参数
      isSuccessactive: '0'
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.rowfn();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    rowfn() {
      if (this.integrationUuid) {
        this.rowSpan = 20;
      } else {
        this.rowSpan = 24;
      }
    },
    close() {
      this.$emit('close');
    },
    saveEdit() {
      let _this = this;
      let isPass = true;
      if (this.inputParamList.length > 0) {
        this.inputParamList.forEach((input, iindex) => {
          if (_this.$refs['inputparam' + iindex] && _this.$refs['inputparam' + iindex][0]) {
            if (!_this.$refs['inputparam' + iindex][0].valid()) {
              isPass = false;
            }
          }
        });
      }
      if (this.$refs.reportForm.valid() && isPass) {
      // if (this.$refs.trigger.valid() && this.$refs.integrationUuid.valid() && isPass) {
        let actionList = {
          trigger: this.reportInstanceFormConfig.trigger.value,
          integrationUuid: this.integrationUuid,
          paramMappingList: this.paramMappingList,
          successCondition: this.isSuccessactive == '0' ? {} : this.successCondition
        };

        this.$emit('close', this.type, actionList);
      }
    },
    toIntegration(uuid) {
      //跳转到外部数据源管理页
      if (uuid) {
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true&integrationUuid=' + uuid, '_blank');
      } else {
        window.open(HOME + '/framework.html#/integration-manage?isIntegrationDialogShow=true', '_blank');
      }
    },
    getParamtype(item) {
      this.$set(item, 'type', '');
      let isExit = false;
      if (this.paraConditionList && this.paraConditionList.length > 0) {
        this.paraConditionList.forEach(pa => {
          if (pa.name == item.value) {
            this.$set(item, 'type', pa.type);
            isExit = true;
          }
        });
      }
      if (!isExit) {
        this.$set(item, 'type', 'constant');
      }
    },
    clearExpression() {
      this.successCondition.expression = '';
      this.successCondition.value = '';
    },
    clearIntegrationrelation(val) {
      this.rowfn();
      this.$set(this, 'integrationUuid', val);
      this.$set(this, 'paramMappingList', []);
      if (this.isSuccessactive != '0') {
        this.$set(this, 'isSuccessactive', '0');
      }
    },
    refreshIntegration(uuid) {
      this.$api.process.process.searchIntegration({ defaultValue: [uuid] }).then(res => {
        if (res && res.Status == 'OK' && res.Return && res.Return.tbodyList && res.Return.tbodyList.length > 0) {
          this.$Message.success(this.$t('message.executesuccess'));
          this.integrationItemList = res.Return.tbodyList[0];
        } else {
          this.getIntegration({});
        }
      });
    },
    getIntegration(val) {
      let _this = this;
      this.inputParamList = [];
      this.outputParamList = [];
      if (val && val.config && val.config.param && val.config.param.paramList && val.config.param.paramList.length > 0) {
        val.config.param.paramList.forEach(pa => {
          if (pa.name && pa.mode == 'input') {
            let newlist = {
              name: pa.name,
              type: '',
              value: ''
            };

            if (pa.isRequired) {
              Object.assign(newlist, {
                isRequired: 1
              });
            }
            this.inputParamList.push(newlist);
          } else if (pa.name && pa.mode == 'output') {
            this.outputParamList.push(pa);
          }
        });
        if (this.paramMappingList.length == 0) {
          //原先没有条件的直接为输入参数
          this.paramMappingList = this.inputParamList;
        } else {
          //原先有条件的对比输入参数，有值的赋值回去
          let allList = this.$utils.deepClone(this.inputParamList);
          allList.forEach(all => {
            _this.paramMappingList.forEach(pa => {
              if (pa.name == all.name) {
                all.value = pa.value;
                all.type = pa.type;
              }
            });
          });
          this.paramMappingList = allList;
        }
      }
    }
  },
  filter: {},
  computed: {
    getExpression() {
      return function(name) {
        let successexpressList = [];
        if (name) {
          if (this.outputParamList.length > 0) {
            this.outputParamList.forEach(li => {
              if (li.name == name) {
                successexpressList = li.expresstionList;
              }
            });
          }
        }
        return successexpressList;
      };
    }
  },
  watch: {
    integrationItemList: {
      handler: function(val) {
        this.getIntegration(val);
      },
      deep: true
    },
    isSuccessactive: {
      handler: function(val) {
        if (val == '0') {
          this.$set(this.successCondition, 'name', '');
          this.$set(this.successCondition, 'expression', '');
          this.$set(this.successCondition, 'value', '');
        }
      }
    },
    editList: {
      handler: function(val) {
        if (val) {
          this.reportInstanceFormConfig.trigger.value = val.trigger;
          // this.$set(this, 'trigger', val.trigger);
          this.$set(this, 'integrationUuid', val.integrationUuid);
          this.$set(this, 'paramMappingList', val.paramMappingList);
          this.$set(this, 'successCondition', val.successCondition);
          if (val.successCondition && val.successCondition.name) {
            this.isSuccessactive = '1';
          }
        }
      },
      deep: true,
      immediate: true
    },
    paramMappingList: {
      handler: function(val) {
        if (val && val.length > 2) {
          this.$set(this.actionTsDialog, 'height', '300px');
        } else {
          this.$set(this.actionTsDialog, 'height', '200px');
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
.param-list{
  &:not(:last-child) {
    padding-bottom: 10px;
  }
}
.block-interg {
  padding: 16px;
  margin-bottom: 8px;
  width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}
.disabled-text {
  cursor: not-allowed;
  height: 32px;
  line-height: 32px;
}
.btn-tointegration {
  line-height: 32px;
}
</style>
