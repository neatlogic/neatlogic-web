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
                :validateList="['required']"
                border="border"
              ></TsFormSelect>
            </TsFormItem>
          </div>
          <div v-if="envId && editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')" class="mt-lg">
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
        <Button @click="closeDialog()">取消</Button>
        <Button
          v-if="envId && editConfig.execMode !='runner' && editConfig.execMode !='sqlfile' && (!groupConfig || groupConfig.policy !='grayScale')"
          type="primary"
          ghost
          @click="valid()"
        >校验</Button>
        <Button type="primary" @click="okDialog()">确定</Button>
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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    PoptipSelect: resolve => require(['@/resources/components/PoptipSelect/PoptipSelect'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    TargetDetail: resolve => require(['@/views/pages/autoexec/components/common/addTarget/target-detail'], resolve),
    TargetValid: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-valid.vue'], resolve)
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
          label: this.$i18n.t('page.name'),
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
          label: '执行方式',
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
          label: '连接协议', //添加阶段
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
          type: 'text',
          name: 'executeUser',
          label: '执行用户',
          value: '',
          transfer: true,
          disabled: !this.canEdit,
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
          disabled: !this.canEdit
        }
      ],
      executeConfig: {
        protocolId: '',
        executeUser: '',
        roundCount: null,
        isPresetExecuteConfig: 0,
        executeNodeConfig: {}
      },
      resultList: [], //执行目标校验结果
      isValid: true, //校验结果通过
      isShowTargetValid: false,
      executeTooltip: '若此处不填写执行目标，当前阶段默认继承组合工具执行目标，若此处填写执行目标，当前阶段将采用此处填写的执行目标；执行时，不可修改阶段的执行目标'
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
        this.$set(this.formItem.name, 'errorMessage', '名称重复，请重新输入');
      } else {
        this.$set(this.formItem.name, 'errorMessage', '');
      }
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
        executeUser: this.executeConfig.executeUser,
        filter: executeNodeConfig.filter || this.defaultSearchValue || {},
        selectNodeList: executeNodeConfig.selectNodeList || [],
        inputNodeList: executeNodeConfig.inputNodeList || [],
        paramList: executeNodeConfig.paramList || []
      };
      return this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          this.resultList = res.Return.list || [];
          if (this.resultList.length > 0) {
            this.isValid = false;
            this.isShowTargetValid = true;
          } else if (isMessage) {
            this.$Message.success('校验成功');
          }
        }
      });
    },
    async valid() {
      await this.validSetting(true);
    },
    saveExecuteNodeConfig() { //保存执行目标
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
          title = this.canEdit ? '编辑阶段:' + config.name : '查看阶段:' + config.name;
        } else {
          title = '添加阶段';
        }
        return title;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
