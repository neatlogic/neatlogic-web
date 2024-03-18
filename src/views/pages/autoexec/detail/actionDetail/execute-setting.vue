
<template>
  <div>
    <TsDialog
      v-bind="dialogConfig"
      @on-close="closeSetting()"
    >
      <Loading :loadingShow="loadingShow" type="fix"></Loading>
      <div v-if="!loadingShow" class="pl-nm pr-nm">
        <div>
          <TsForm
            ref="form"
            v-model="settingConfig"
            labelPosition="left"
            :item-list="form"
            :labelWidth="80"
          >
            <template v-slot:executeUser>
              <ExecuteuserSetting
                ref="executeUser"
                :config="settingConfig.executeUser"
                :disabled="!isEditSetting"
                :runtimeParamList="runtimeParamList"
              ></ExecuteuserSetting>
            </template>
          </TsForm>
        </div>
        <div v-if="settingConfig.whenToSpecify == 'now'" class="execute-main">
          <div class="target-detail">
            <TargetDetail
              :id="id"
              ref="targetDetail"
              :config="settingConfig.executeNodeConfig"
              :canEdit="isEditSetting"
              :type="settingConfig.whenToSpecify"
              :required="true"
            ></TargetDetail>
          </div>
        </div>
        <div v-else-if="settingConfig.whenToSpecify == 'runtime'" class="execute-main">
          <div class="target-detail">
            <Filters
              ref="runtimeFilter"
              :tipText="$t('term.autoexec.setfilterexecutelimitdesc')"
              :defaultValue="runtimeFilter"
            ></Filters>
          </div>
        </div>
        <div v-else-if="settingConfig.whenToSpecify == 'runtimeparam'" class="execute-main">
          <div class="target-detail">
            <ExecutionModeParam
              :id="id"
              ref="runtimeparam"
              :defaultValue="settingConfig.executeNodeConfig.paramList"
              :paramList="nodeTypeParamList"
              :canEdit="isEditSetting"
            ></ExecutionModeParam>
          </div>
        </div>
      </div>
      <template v-slot:footer>
        <Button @click="closeSetting()">{{ $t('page.cancel') }}</Button>
        <Button
          v-if="settingConfig.whenToSpecify == 'now'"
          type="primary"
          ghost
          @click="validSetting()"
        >{{ $t('page.validate') }}</Button>
        <Button type="primary" @click="okSetting()">{{ $t('page.confirm') }}</Button>
      </template>
    </TsDialog>
    <TargetValid
      v-if="isValid"
      :visible="isValid"
      :resultList="resultList"
      @save="save()"
      @close="isValid=false"
    ></TargetValid>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TargetDetail: resolve => require(['@/views/pages/autoexec/components/common/addTarget/target-detail'], resolve),
    ExecutionModeParam: resolve => require(['@/views/pages/autoexec/components/common/executionMode/param'], resolve),
    Filters: resolve => require(['@/views/pages/autoexec/components/common/executionMode/filters'], resolve),
    TargetValid: resolve => require(['@/views/pages/autoexec/components/common/targetView/target-valid.vue'], resolve),
    ExecuteuserSetting: resolve => require(['./executeuser-setting.vue'], resolve)
  },
  filters: {},
  props: {
    id: [Number, String],
    executeConfig: {
      type: Object,
      default: () => {}
    },
    runtimeParamList: Array,
    isEditSetting: Boolean
  },
  data() {
    let _this = this;
    return {
      loadingShow: true,
      dialogConfig: {
        type: 'slider',
        title: this.$t('term.autoexec.executetarget'),
        width: 'medium',
        isShow: true,
        hasFooter: _this.isEditSetting
      },
      form: {
        protocolId: {
          type: 'select',
          label: this.$t('page.protocol'), // 执行目标弹窗
          value: '',
          multiple: false,
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getProtocolDataList,
          placeholder: this.$t('page.pleaseselect'),
          disabled: !_this.isEditSetting,
          transfer: true
        },
        executeUser: {
          type: 'slot',
          label: this.$t('page.executeuser')
        },
        roundCount: {
          type: 'select',
          value: null,
          transfer: true,
          disabled: !_this.isEditSetting,
          label: this.$t('term.autoexec.batchquantity'),
          desc: this.$t('term.autoexec.batchcountdisabledesc'),
          dataList: this.$utils.getRoundCountList()
        },
        whenToSpecify: {
          type: 'radio',
          label: this.$t('term.autoexec.choosethetime'),
          value: '',
          dataList: [],
          disabled: !_this.isEditSetting,
          onChange: (val) => {
            _this.changeWhenToSpecify(val);
          }
        }
      },
      settingConfig: {
        combopId: _this.id,
        protocolId: '',
        executeUser: null,
        roundCount: null,
        whenToSpecify: 'runtime',
        executeNodeConfig: {}
      },
      isValid: false,
      resultList: [],
      nodeTypeParamList: [], //可选的节点参数
      runtimeFilter: {}
    };
  },
  beforeCreate() {},
  async created() {
    await this.getParamList();
    this.getExecuteType();
    this.getExecuteConfig();
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
    getExecuteConfig() {
      let _this = this;
      if (_this.executeConfig) {
        Object.keys(_this.executeConfig).forEach(key => {
          if (_this.settingConfig.hasOwnProperty(key)) {
            _this.settingConfig[key] = _this.executeConfig[key];
          }
        });
        if (_this.settingConfig.whenToSpecify == 'runtime') {
          this.runtimeFilter = this.settingConfig.executeNodeConfig.filter || {};
        }
      }
      this.loadingShow = false;
    },
    getExecuteType() {
      let data = { enumClass: 'neatlogic.framework.autoexec.constvalue.CombopNodeSpecify' };
      this.$api.autoexec.action.getParamsTypeLit(data).then(res => {
        if (res.Status == 'OK') {
          this.form.whenToSpecify.dataList = res.Return;
          if (!this.nodeTypeParamList.length) {
            let config = this.form.whenToSpecify.dataList.find(item => item.value == 'runtimeparam');
            this.$set(config, 'disabled', true);
            this.$set(config, 'description', this.$t('term.autoexec.jobparamnotconfignodeinfoparamdesc'));
          }
          let runtimeConfig = this.form.whenToSpecify.dataList.find(item => item.value == 'runtime');
          this.$set(runtimeConfig, 'description', this.$t('term.autoexec.allphasesetconfigtargetaddjobdesc'));
        }
      });
    },
    okSetting() {
      this.$set(this.settingConfig, 'executeUser', this.$refs.executeUser.save());
      this.settingConfig.executeNodeConfig = {};
      if (this.settingConfig.whenToSpecify == 'now') {
        this.validSetting(true);
      } else if (this.settingConfig.whenToSpecify == 'runtime') {
        let filterValue = this.$refs.runtimeFilter.save();
        let complexModeSearchValue = this.$refs.runtimeFilter.getComplexModeSearchValue(); // 获取复杂模式搜索值
        this.$set(this.settingConfig.executeNodeConfig, 'filter', complexModeSearchValue && !this.$utils.isEmptyObj(complexModeSearchValue) ? complexModeSearchValue : filterValue);
        this.save();
      } else if (this.settingConfig.whenToSpecify == 'runtimeparam') {
        let paramList = this.$refs.runtimeparam.save();
        this.$set(this.settingConfig.executeNodeConfig, 'paramList', paramList);
        this.save();
      }
    },
    save() {
      this.closeSetting(this.settingConfig);
    },
    closeSetting(val) {
      this.$emit('close', val);
    },
    validSetting(type) { //true不需要提示校验信息
      if (!this.$refs.targetDetail.valid()) {
        return;
      }
      let executeNodeConfig = this.$refs.targetDetail.save();
      this.settingConfig.executeNodeConfig = executeNodeConfig;
      this.isValid = false;
      let data = {
        protocolId: this.settingConfig.protocolId,
        executeUser: null,
        filter: executeNodeConfig.filter || {},
        selectNodeList: executeNodeConfig.selectNodeList || [],
        inputNodeList: executeNodeConfig.inputNodeList || [],
        cmdbGroupType: this.opType
      };
      if (this.$refs.executeUser) {
        this.$set(this.settingConfig, 'executeUser', this.$refs.executeUser.save());
      }
      if (this.settingConfig.executeUser && this.settingConfig.executeUser.value) {
        if (this.settingConfig.executeUser.mappingMode === 'constant') {
          this.$set(data, 'executeUser', this.settingConfig.executeUser.value);
        } else if (this.settingConfig.executeUser.mappingMode === 'runtimeparam' && !this.$utils.isEmpty(this.runtimeParamList)) {
          let findItem = this.runtimeParamList.find(i => i.key === this.settingConfig.executeUser.value);
          if (findItem) {
            this.$set(data, 'executeUser', findItem.defaultValue);
          }
        }
      }
      let _this = this;
      this.$api.autoexec.action.getValidList(data).then(res => {
        if (res.Status == 'OK') {
          _this.resultList = res.Return.list || [];
          _this.resultList.length && (_this.isValid = true);
          if (!_this.isValid) {
            if (!type) {
              this.$Message.success(this.$t('message.validatesuccess'));
            } else {
              _this.save();
            }
          }
        }
      });
    },
    getParamList() { //获取参数
      let dataList = [];
      this.runtimeParamList.forEach(item => {
        if (item.type == 'node') {
          let obj = {
            text: item.name,
            value: item.key
          };
          dataList.push(obj);
        }
      });
      this.nodeTypeParamList = dataList;
    },
    changeWhenToSpecify(val) {
      this.settingConfig.whenToSpecify = val;
      this.settingConfig.executeNodeConfig = {};
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.execute-main {
  padding: 16px 0;
}
/deep/ span.ivu-radio + * {
  margin-left: 4px;
  margin-right: 31px;
}
.valid-title{
  padding-bottom: 10px;
}
.valid-box{
  padding-bottom: 10px;
}
.pt16{
  padding-bottom: 16px;
}
</style>
