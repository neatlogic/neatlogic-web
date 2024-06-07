
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
          <div v-if="editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')" class="mt-lg">
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
                ></TargetDetail>
              </div>
            </template>
          </div>
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
    ExecuteuserSetting: () => import('@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue')
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
          placeholder: this.$t('page.pleaseselect'),
          transfer: true,
          disabled: !_this.canEdit
        },
        {
          type: 'slot',
          name: 'executeUser',
          label: this.$t('page.executeuser'),
          tooltip: this.$t('term.autoexec.nowriteusertooltip')
        },
        {
          type: 'select',
          name: 'roundCount',
          value: null,
          transfer: true,
          label: this.$t('term.autoexec.batchquantity'),
          desc: this.$t('term.autoexec.batchcountprioritydesc'),
          dataList: this.$utils.getRoundCountList(),
          filterName: 'text',
          disabled: !_this.canEdit
        }
      ],
      executeConfig: {
        protocolId: '',
        executeUser: {},
        roundCount: null,
        isPresetExecuteConfig: 0,
        executeNodeConfig: {}
      },
      isValid: false, // 校验执行目标
      resultList: [], //校验结果
      validateList: ['required'],
      executePolicyList: [],
      executeTooltip: this.$t('term.autoexec.executeTooltip')
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
      if (this.$refs.executeUser) {
        this.$set(this.executeConfig, 'executeUser', this.$refs.executeUser.save());
      }
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
      let _this = this;
      //runner方式的阶段无需选执行目标；其他方式需要（非必选)
      if (type == 'runner') {
        _this.executeConfig = {
          protocolId: '',
          executeUser: {},
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
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
