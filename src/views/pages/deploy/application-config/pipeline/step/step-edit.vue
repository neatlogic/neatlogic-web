<template>
  <div>
    <TsDialog
      :title="getTitle(config)"
      type="slider"
      :isShow="true"
      width="large"
      @on-close="closeDialog()"
    >
      <template v-slot>
        <div class="pl-nm pr-nm">
          <TsForm
            ref="formConfig"
            v-model="editConfig"
            :item-list="formItem"
            labelPosition="left"
            :labelWidth="115"
          >
            <template v-slot:execMode>
              <PoptipSelect
                v-model="editConfig.execMode"
                v-bind="formItem.execMode"
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
                :validateList="['required']"
                border="border"
              ></TsFormSelect>
            </TsFormItem>
          </div>
          <div v-if="envId && editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')" class="mt-lg">
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
                    :isEditRuntimeParam="false"
                  ></ExecuteuserSetting>
                </template>
              </TsForm>
              <div class="pt-nm">
                <TargetDetail
                  ref="targetDetail"
                  :runtimeParamList="runtimeParamList"
                  :canEdit="canEdit"
                  :config="executeConfig.executeNodeConfig"
                  :isAddParam="true"
                  :labelWidth="115"
                ></TargetDetail>
              </div>
            </template>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="closeDialog()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="envId && editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')"
          type="primary"
          ghost
          @click="valid()"
        >{{ $t('page.validate') }}</Button>
        <Button type="primary" @click="okDialog()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <TargetValid
      v-if="isShowTargetValid"
      :visible="isShowTargetValid"
      :resultList="resultList"
      @save="saveValid()"
      @close="closeValid()"
    ></TargetValid>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    PoptipSelect: () => import('@/resources/components/PoptipSelect/PoptipSelect'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TargetDetail: () => import('@/views/pages/autoexec/components/common/addTarget/target-detail'),
    TargetValid: () => import('@/views/pages/autoexec/components/common/targetView/target-valid.vue'),
    ExecuteuserSetting: () => import('@/views/pages/autoexec/detail/actionDetail/executeuser-setting.vue')
  },
  props: {
    canEdit: {
      type: Boolean,
      default: true
    },
    stepList: {
      type: Array,
      default: () => []
    },
    config: Object,
    scriptLength: Number,
    execModeList: Array,
    groupConfig: Object,
    appSystemId: Number, //应用id
    appModuleId: Number, //模块id
    envId: Number, //环境id
    runtimeParamList: Array //作业参数
  },
  data() {
    return {
      editConfig: {
        name: '',
        execMode: 'target',
        policy: 'first'
      },
      formItem: {
        name: {
          type: 'text',
          name: 'name',
          maxlength: 50,
          label: this.$t('page.name'),
          validateList: ['required', 'name-special'],
          errorMessage: '',
          disabled: !!this.appModuleId || !!this.envId,
          onChange: (val) => {
            this.checkExist(val);
          }
        },
        execMode: {
          type: 'slot',
          name: 'execMode',
          label: this.$t('page.executionmode'),
          validateList: ['required'],
          disabled: this.scriptLength > 0 || !!this.appModuleId || !!this.envId,
          list: this.execModeList,
          vertical: true,
          popLable: 120
        }
      },
      executePolicyList: [],
      executeForm: [
        {
          type: 'select',
          name: 'protocolId',
          label: this.$t('page.protocol'), //添加阶段
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          multiple: false,
          rootName: 'tbodyList',
          search: true,
          clearable: true,
          transfer: true,
          dealDataByUrl: this.dealDataByUrl || null,
          disabled: !this.canEdit
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
          disabled: !this.canEdit
        }
      ],
      executeConfig: {
        protocolId: '',
        executeUser: {},
        roundCount: null,
        isPresetExecuteConfig: 0,
        executeNodeConfig: {}
      },
      resultList: [], //执行目标校验结果
      isValid: true, //校验结果通过
      isShowTargetValid: false,
      executeTooltip: this.$t('term.autoexec.executeTooltip')
    };
  },
  beforeCreate() {},
  created() {
    this.getExecutePolicy();
  },
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      if (!this.$utils.isEmpty(this.config)) {
        Object.assign(this.editConfig, this.config);
        if (this.editConfig.config.executeConfig) {
          Object.keys(this.editConfig.config.executeConfig).forEach(key => {
            if (this.executeConfig.hasOwnProperty(key)) {
              this.executeConfig[key] = this.editConfig.config.executeConfig[key];
            }
          });
        }
      }
      for (let key in this.formItem) {
        !this.canEdit && (this.formItem[key].disabled = true);
      }
    },
    closeDialog() {
      this.$emit('close');
    },
    async okDialog() {
      if (this.$refs.formConfig.valid()) {
        if (this.editConfig.policy && (!this.groupConfig || this.groupConfig.policy != 'grayScale' || (this.editConfig.execMode && this.editConfig.execMode != 'runner' && this.editConfig.execMode != 'sqlfile'))) {
          this.$delete(this.editConfig, 'policy');
        }
        await this.validSetting();
        if (!this.isValid) {
          return;
        }
        if (this.executeConfig.isPresetExecuteConfig) {
          this.saveExecuteNodeConfig();
        } else if (this.editConfig.config) {
          this.$set(this.editConfig.config, 'executeConfig', {});
        }
        this.$emit('close', this.editConfig);
      }
    },
    checkExist(value) {
      let isExist = false;
      if (value) {
        for (let i = 0; i < this.stepList.length; i++) {
          for (let j = 0; j < this.stepList[i].length; j++) {
            if ((this.stepList[i][j].uuid != this.editConfig.uuid) && (this.stepList[i][j].name == value)) {
              isExist = true;
              break;
            }
          }
        }
      }
      if (isExist) {
        this.$set(this.formItem.name, 'errorMessage', this.$t('form.validate.repeat', {target: this.$t('page.name')}));
      } else {
        this.$set(this.formItem.name, 'errorMessage', '');
      }
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
    dealDataByUrl(nodeList) { // 处理默认值的数据结构
      return this.dealDataFilter(nodeList);
    },
    dealDataFilter(nodeList) {
      // 处理默认值的数据结构
      let columlist = [];
      nodeList.forEach(v => {
        let text = '';
        if (v.port) {
          text = v.name + '(' + v.port + ')';
        } else {
          text = v.name;
        }
        columlist.push(
          {text: text, value: v.id}
        );
      });
      return columlist;
    },
    validSetting(isMessage) { //isMessage是否需要提示'校验成功'
      if (!this.$refs.targetDetail || (this.$refs.targetDetail && !this.$refs.targetDetail.valid())) {
        return;
      }
      let executeNodeConfig = this.$refs.targetDetail.save();
      this.isValid = true;
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
      return this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          this.resultList = res.Return.list || [];
          if (this.resultList.length > 0) {
            this.isValid = false;
            this.isShowTargetValid = true;
          } else if (isMessage) {
            this.$Message.success(this.$t('message.validatesuccess'));
          }
        }
      });
    },
    async valid() {
      await this.validSetting(true);
    },
    saveExecuteNodeConfig() { //保存执行目标
      if (this.$refs.executeUser) {
        this.$set(this.executeConfig, 'executeUser', this.$refs.executeUser.save());
      }
      if (this.$refs.targetDetail) {
        let executeNodeConfig = this.$refs.targetDetail.save();
        this.executeConfig.executeNodeConfig = executeNodeConfig;
        this.$set(this.editConfig.config, 'executeConfig', this.executeConfig);
      }
    },
    saveValid() {
      this.saveExecuteNodeConfig();
      this.isShowTargetValid = false;
      this.$emit('close', this.editConfig);
    },
    closeValid() { //关闭校验弹框
      this.isShowTargetValid = false;
    }
  },
  filter: {},
  computed: {
    getTitle() {
      return (config) => {
        let title = '';
        if (config && config.name) {
          title = this.canEdit ? this.$t('term.deploy.editphasetarget', {target: config.name}) : this.$t('term.deploy.viewphasetarget', {target: config.name});
        } else {
          title = this.$t('dialog.title.addtarget', {target: this.$t('page.phase')});
        }
        return title;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
