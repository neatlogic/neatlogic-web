
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
          <span v-html="canEdit?$t('page.edit'):$t('page.view')"></span><span>{{ $t('page.phase') }}:{{ config.name }}</span>
        </div>
        <div v-else>
          {{ $t('dialog.title.addtarget', {target: $t('page.phase')}) }}
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
              :label="$t('term.deploy.executivestrategy')"
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
          <template v-if="!groupConfig || groupConfig.policy !='grayScale'">
            <div v-if="editConfig.execMode !='runner' && editConfig.execMode !='sqlfile'" class="mt-lg">
              <TsFormItem
                :label="$t('term.deploy.presetexecutiontarget')"
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
                  <template v-slot:executeUser>
                    <ExecuteuserSetting
                      ref="executeUser"
                      :config="executeConfig.executeUser"
                      :disabled="!canEdit"
                      :runtimeParamList="runtimeParamList"
                    ></ExecuteuserSetting>
                  </template>
                  <template v-slot:preCondition>
                    <ConditionSearch
                      ref="preCondition"
                      :defaultValue="executeConfig.preCondition"
                      :readonly="!canEdit"
                      @changeValue="changePreConditionValue"
                      @advancedModeSearch="changePreConditionValue"
                    ></ConditionSearch>
                  </template>
                </TsForm>
                <div class="pt-nm">
                  <TargetDetail
                    :id="id"
                    ref="targetDetail"
                    :canEdit="canEdit"
                    :config="executeConfig.executeNodeConfig"
                    :isAddParam="true"
                    :labelWidth="115"
                    :isAddPrenode="prevStepList.length > 0 ? true : false"
                    :prevStepList="prevStepList"
                    :runtimeParamList="runtimeParamList"
                    :preCondition="preCondition"
                  ></TargetDetail>
                </div>
              </template>
            </div>
            <div v-if="editConfig.execMode ==='runner'">
              <TsFormItem
                :label="$t('term.deploy.presetrunnergroup')"
                labelPosition="left"
                :labelWidth="115"
                :tooltip="runnerGroupTooltip"
              >
                <TsFormSwitch v-model="executeConfig.isPresetRunnerGroup" :disabled="!canEdit"></TsFormSwitch>
              </TsFormItem>
              <template v-if="executeConfig.isPresetRunnerGroup">
                <TsFormItem
                  :label="$t('term.deploy.actuatorgrouptag')"
                  labelPosition="left"
                  :labelWidth="115"
                >
                  <RunnerGroupTagSetting
                    ref="runnerGroupTag"
                    :config="executeConfig.runnerGroupTag"
                    :disabled="!canEdit"
                    :runtimeParamList="runtimeParamList"
                    :isRequired="false"
                  ></RunnerGroupTagSetting>
                </TsFormItem>
                <TsFormItem
                  :label="$t('page.autoexeccomboprunnergrouplabel')"
                  labelPosition="left"
                  :labelWidth="115"
                >
                  <RunnerGroupSetting
                    ref="runnerGroup"
                    :config="!$utils.isEmpty(executeConfig.runnerGroup)?executeConfig.runnerGroup : runnerGroup"
                    :disabled="!canEdit"
                    :runtimeParamList="runtimeParamList"
                    :isRequired="false"
                  ></RunnerGroupSetting>
                </TsFormItem>
              </template>
            </div>
          </template>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="editConfig.execMode !='runner'"
          type="primary"
          ghost
          @click="validSetting()"
        >{{ $t('page.validate') }}</Button>
        <Button type="primary" @click="ok()">{{ $t('page.confirm') }}</Button>
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
    TargetDetail: () => import('@/views/pages/autoexec/components/common/addTarget/target-detail'),
    PoptipSelect: () => import('@/resources/components/PoptipSelect/PoptipSelect'),
    TargetValid: () => import('@/views/pages/autoexec/components/common/targetView/target-valid.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    ExecuteuserSetting: () => import('@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue'),
    RunnerGroupSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergroup-setting.vue'),
    RunnerGroupTagSetting: () => import('@/views/pages/autoexec/detail/actionDetail/runnergrouptag-setting.vue'),
    ConditionSearch: () => import('@/views/pages/autoexec/detail/actionDetail/condition-search.vue')
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
    },
    runtimeParamList: Array
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
          label: this.$t('page.name'),
          validateList: ['required', 'name-special'],
          errorMessage: '',
          onChange: function(val) {
            _this.checkExist('name', val);
          }
        },
        {
          type: 'slot',
          name: 'execMode',
          label: this.$t('page.executionmode'),
          validateList: ['required'],
          disabled: this.scriptLength > 0,
          list: _this.execModeList,
          vertical: true,
          popLable: 120
        }
      ],
      executeForm: {
        protocolId: {
          type: 'select',
          label: this.$t('page.protocol'), //添加阶段
          value: '',
          multiple: false,
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getProtocolDataList,
          placeholder: this.$t('page.pleaseselect'),
          transfer: true,
          disabled: !_this.canEdit
        },
        executeUser: {
          type: 'slot',
          label: this.$t('page.executeuser'),
          tooltip: this.$t('term.autoexec.nowriteusertooltip')
        },
        parallelPolicy: {
          type: 'radio',
          labelWidth: '113',
          disabled: !_this.canEdit,
          label: this.$t('page.autoexecparallpolicy'),
          dataList: [
            {
              text: this.$t('page.autoexecparall'),
              value: 'parallel'
            },
            {
              text: this.$t('page.autoexecbatchround'),
              value: 'roundCount'
            }
          ],
          allowToggle: true,
          transfer: true,
          onChange: (val) => {
            this.changeParallelPolicy(val);
          }
        },
        roundCount: {
          type: 'select',
          value: null,
          transfer: true,
          label: this.$t('term.autoexec.batchquantity'),
          desc: this.$t('term.autoexec.batchcountprioritydesc'),
          dataList: this.$utils.getRoundCountList(),
          filterName: 'text',
          disabled: !_this.canEdit
        },
        parallelCount: {
          type: 'select',
          value: null,
          transfer: true,
          disabled: !_this.canEdit,
          label: this.$t('term.autoexec.parall'),
          desc: this.$t('term.autoexec.paralldesc'),
          dataList: this.$utils.getRoundCountList()
        },
        preCondition: {
          type: 'slot',
          label: '前置过滤器'
        }
      },
      executeConfig: {
        protocolId: '',
        executeUser: {},
        parallelPolicy: null,
        parallelCount: null,
        roundCount: null,
        isPresetExecuteConfig: 0,
        executeNodeConfig: {},
        isPresetRunnerGroup: 0,
        runnerGroup: null,
        runnerGroupTag: null,
        preCondition: null

      },
      isValid: false, // 校验执行目标
      resultList: [], //校验结果
      validateList: ['required'],
      executePolicyList: [],
      executeTooltip: this.$t('term.autoexec.executeTooltip'),
      runnerGroupTooltip: this.$t('term.autoexec.runnerGroupTooltip'),
      runnerGroup: {
        mappingMode: 'constant',
        value: '',
        text: ''
      },
      preCondition: null
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
        this.preCondition = this.$utils.deepClone(this.executeConfig.preCondition);
        if (!this.$utils.isEmpty(this.executeConfig.runnerGroup) || !this.$utils.isEmpty(this.executeConfig.runnerGroupTag)) {
          this.$set(this.executeConfig, 'isPresetRunnerGroup', 1);
        }
        this.$set(this.executeForm.roundCount, 'isHidden', true);
        this.$set(this.executeForm.parallelCount, 'isHidden', true);
        if (this.executeConfig.parallelPolicy && this.executeConfig.parallelPolicy == 'roundCount') {
          this.$set(this.executeForm.roundCount, 'isHidden', false);
        } else if (this.executeConfig.parallelPolicy && this.executeConfig.parallelPolicy == 'parallel') {
          this.$set(this.executeForm.parallelCount, 'isHidden', false);
        }
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
      if (this.$refs.executeUser) {
        this.$set(this.executeConfig, 'executeUser', this.$refs.executeUser.save());
      }
      if (this.$refs.targetDetail) {
        let executeNodeConfig = this.$refs.targetDetail.save();
        this.executeConfig.executeNodeConfig = executeNodeConfig;
      } else {
        this.executeConfig.executeNodeConfig = {};
      }
      if (this.$refs.runnerGroupTag) {
        this.$set(this.executeConfig, 'runnerGroupTag', this.$refs.runnerGroupTag.save());
      }
      if (this.$refs.runnerGroup) {
        this.$set(this.executeConfig, 'runnerGroup', this.$refs.runnerGroup.save());
      }

      if (this.$utils.isEmpty(this.executeConfig.parallelPolicy)) {
        this.executeConfig.roundCount = null;
        this.executeConfig.parallelCount = null;
      } else if (this.executeConfig.parallelPolicy === 'parallel') {
        this.executeConfig.roundCount = null;
      } else {
        this.executeConfig.parallelCount = null;
      }
      this.executeConfig.preCondition = !this.$utils.isEmpty(this.preCondition) ? this.preCondition : null;
      if (this.$refs.form.valid()) {
        let editConfig = this.$utils.deepClone(this.editConfig);
        if (editConfig.policy && (!this.groupConfig || this.groupConfig.policy != 'grayScale' || (this.editConfig.execMode && this.editConfig.execMode != 'runner' && this.editConfig.execMode != 'sqlfile'))) {
          this.$delete(editConfig, 'policy');
        }
        this.$emit('close', editConfig, this.executeConfig.isPresetExecuteConfig || this.executeConfig.isPresetRunnerGroup ? this.executeConfig : {});
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
            _this.$set(f, 'errorMessage', (key == 'uk' ? _this.$t('page.uniquekey') : this.$t('form.validate.repeat', {target: _this.$t('page.name')})));
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
      //runner方式的阶段无需选执行目标；其他方式需要（非必选)
      if (type == 'runner') {
        this.executeConfig = {
          protocolId: '',
          executeUser: {},
          executeNodeConfig: {},
          isPresetRunnerGroup: 0,
          runnerGroup: null,
          runnerGroupTag: null
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
        executeUser: null,
        filter: executeNodeConfig.filter || this.defaultSearchValue || {},
        selectNodeList: executeNodeConfig.selectNodeList || [],
        inputNodeList: executeNodeConfig.inputNodeList || [],
        paramList: executeNodeConfig.paramList || []
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
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          this.executePolicyList = res.Return || [];
        }
      });
    },
    changeParallelPolicy(val) {
      this.$nextTick(() => {
        this.$set(this.executeForm.roundCount, 'isHidden', true);
        this.$set(this.executeForm.parallelCount, 'isHidden', true);
        if (val && val == 'roundCount') {
          this.$set(this.executeForm.roundCount, 'isHidden', false);
        } else if (val && val == 'parallel') {
          this.$set(this.executeForm.parallelCount, 'isHidden', false);
        }
      });
    },
    changePreConditionValue(val) {
      this.preCondition = val;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
