<template>
  <div class="batch-inspection-dialog-box">
    <TsDialog v-bind="dialogSetting" @on-close="closeDialog">
      <template v-slot:header>
        <div>
          <span>{{ $t('term.inspect.moduleinspect') }}</span>
          <span style="font-weight: normal;" class="tips text-grey pl-xs">{{ inspectionData.abbrName }} {{ inspectionData.name ? inspectionData.name : '' }}</span>
        </div>
      </template>
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <ul v-if="hasAssets">
        <li v-if="!$utils.isEmpty(envList)" class="mt-md">
          <TsFormCheckbox v-model="checkboxModel" :dataList="checkboxAllDataList" @on-change="checkboxAllChange"></TsFormCheckbox>
        </li>
        <li v-if="$utils.isEmpty(envList)" class="text-tip mt-md">
          {{ $t('term.inspect.noenvconfig') }}
        </li>
        <template v-else>
          <li v-for="(item, index) in envList" :key="index" class="mb-md">
            <div v-if="item.env && item.env.id && !$utils.isEmpty(item.ciVoList)" class="mb-md mt-md">
              <TsFormCheckbox
                v-model="item.value"
                :dataList="item.dataList"
                :disabled="$utils.isEmpty(item.ciVoList)"
                class="checkbox-list-box"
                @on-change="() => checkboxChange()"
              ></TsFormCheckbox>
            </div>
          </li>
        </template>
      </ul>
      <div v-else>{{ $t('term.inspect.modulenoasset') }}</div>
      <template v-slot:footer>
        <div>
          <Button :ghost="true" @click="closeDialog">{{ $t('page.cancel') }}</Button>
          <Button v-if="hasAssets" type="primary" @click="okDialog">{{ $t('page.continue') }}</Button>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      :title="$t('page.tip')"
      :okText="$t('page.continue')"
      width="medium"
      :isShow="isShowCompobList"
      @on-close="closeCompobDialog"
    >
      <ul>
        <li v-for="(item, index) in noCompobIdList" :key="index" class="flex-start mb-sm">
          {{ item.label }}
          <span v-if="item.toolName" class="text-grey">({{ item.toolName }})</span>
          {{ $t('page.notconfig') }}
          <span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="text-href" @click="openInspectionTool(item.toolName)">{{ $t('term.inspect.inspecttool') }}</span>
          <span v-else class="text-grey">{{ $t('term.inspect.inspecttool') }}</span>
        </li>
      </ul>
      <template v-slot:footer>
        <div>
          <Button :ghost="true" @click="closeCompobDialog">{{ $t('page.cancel') }}</Button>
          <Button v-if="hasContinueBtn" type="primary" @click="confirm">{{ $t('page.continue') }}</Button>
        </div>
      </template>
    </TsDialog>
    <InspectToolSetting v-if="isShowInspectTool" :keyword="toolName" @close="closeInspectToolSetting"></InspectToolSetting>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormCheckbox: () => import('@/resources/plugins/TsForm/TsFormCheckbox'),
    InspectToolSetting: () => import('@/views/pages/inspect/definition/components/inspect-tool-setting')
  },
  filters: {},
  props: {
    inspectionData: {
      type: Object,
      default: () => ({})
    },
    appSystemId: {
      // 应用id
      type: Number,
      default: null
    }
  },
  data() {
    return {
      dialogSetting: {
        isShow: true,
        width: 'medium'
      },
      checkboxAllDataList: [
        {
          text: this.$t('page.selectall'),
          value: 'all'
        }
      ],
      compobList: [],
      checkboxModel: [],
      envList: [],
      noCompobIdList: [], // 无组合工具id列表
      isShowCompobList: false,
      isShowInspectTool: false,
      toolName: '',
      loadingShow: false,
      hasContinueBtn: false
    };
  },
  beforeCreate() {},
  created() {
    this.getInspectionList();
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
    async closeInspectToolSetting(needRefresh) {
      // 关闭巡检
      this.isShowInspectTool = false;
      // if (needRefresh) {
      //   this.isShowCompobList = false;
      //   await this.okDialog();
      // }
    },
    checkboxAllChange(val) {
      if (val && val.length > 0) {
        this.checkboxModel = ['all'];
        this.envList &&
          this.envList.forEach(item => {
            item.value = this.getIdByDataList(item.dataList, item.ciVoList);
          });
      } else {
        this.checkboxModel = [];
        this.envList &&
          this.envList.forEach(item => {
            item.value = [];
          });
      }
    },
    checkboxChange() {
      let checkboxList = this.envList.filter((item) => {
        return item.value && item.value.length > 0 && item.ciVoList.length > 0;
      });
      let envList = this.envList.filter((item) => {
        return item.ciVoList && item.ciVoList.length > 0;
      });
      if (checkboxList && !this.$utils.isEmpty(checkboxList) && !this.$utils.isEmpty(envList) && (checkboxList.length == envList.length)) {
        // 全选选中
        this.checkboxModel = ['all'];
      } else {
        this.checkboxModel = [];
      }
    },
    getInspectionList() {
      this.checkboxModel = [];
      this.envList = [];
      this.$set(this.dialogSetting, 'isShow', true);
      this.loadingShow = true;
      this.$api.inspect.applicationInspect
        .getResourceTypeList({ appModuleId: this.inspectionData.id })
        .then(res => {
          if (res && res.Status == 'OK') {
            this.envList = res.Return;
            this.envList &&
              this.envList.forEach(item => {
                item.dataList = [{ text: item.env && item.env.name ? `${item.env.name}${this.$t('page.environment')}` : '', value: item.env && item.env.id ? item.env.id : null }];
                item.value = [];
              });
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    getIdByDataList(dataList, ciVoList) {
      let idList = [];
      dataList &&
        dataList.forEach(item => {
          if (!this.$utils.isEmpty(ciVoList)) {
            // 处理没有的数据
            idList.push(item.value);
          }
        });
      return idList;
    },
    isValid() {
      let isValid = true;
      let copyEnvList = this.$utils.deepClone(this.envList);
      if (copyEnvList && !this.$utils.isEmpty(copyEnvList)) {
        let emptyList = copyEnvList.filter(val => {
          return !this.$utils.isEmpty(val.value);
        });
        if (this.$utils.isEmpty(emptyList)) {
          this.$Message.warning(this.$t('term.inspect.selectenv'));
          isValid = false;
        }
      }
      return isValid;
    },
    getEnvList() {
      let envList = [];
      let copyEnvList = this.$utils.deepClone(this.envList);
      copyEnvList && copyEnvList.forEach((env) => {
        if (env && !this.$utils.isEmpty(env.value)) {
          let envIdList = env.value.filter(envId => envId && envId != '');
          if (envIdList && envIdList.length > 0) {
            envIdList.forEach(envId => {
              envList.push({
                envId: envId,
                appModuleIdList: [this.inspectionData.id]
              });
            });
          }
        }
      });
      return envList;
    },
    confirm() {
      if (!this.isValid()) {
        return false;
      }
      let envList = this.getEnvList();
      const param = {
        appSystemId: this.appSystemId,
        envList: envList
      };
      this.$api.inspect.applicationInspect.createInspectAppJob(param).then((res) => {
        this.loadingShow = true;
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.loadingShow = false;
          this.dialogSetting.isShow = false;
          this.isShowCompobList = false;
          this.closeDialog();
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    async okDialog() {
      // 执行操作
      this.compobList = [];
      let flag = 0;
      let envList = this.$utils.deepClone(this.envList) || [];
      if (!this.isValid()) {
        return false;
      }
      this.loadingShow = true;
      for (let i = 0; i < envList.length; i++) {
        if (envList[i] && envList[i].ciVoList.length > 0 && (envList[i].value && envList[i].value.length > 0)) {
          for (let v = 0; v < envList[i].ciVoList.length; v++) {
            if (envList[i].ciVoList[v]) {
              flag++;
              await this.$api.inspect.applicationInspect.getCombopIdByTypeId({ ciId: envList[i].ciVoList[v].id, resourceId: null }).then(innerRes => {
                if (innerRes.Status == 'OK') {
                  let returnValue = innerRes.Return;
                  if (returnValue && returnValue.isHasBindCombop == 1) {
                    this.compobList.push({
                      combopId: returnValue.combop ? returnValue.combop.id : null,
                      id: envList[i].ciVoList[v].id,
                      label: envList[i].ciVoList[v].label,
                      envId: envList[i].env.id
                    });
                  } else {
                    this.noCompobIdList.push({
                      id: envList[i].ciVoList[v].id,
                      label: envList[i].ciVoList[v].label,
                      toolName: envList[i].ciVoList[v].name
                    });
                  }
                }
              }).finally(() => {
                let ajaxNumber = 0;
                envList && envList.forEach((fv) => {
                  fv && !this.$utils.isEmpty(fv.value) && fv.ciVoList && fv.ciVoList.forEach((fn) => {
                    if (fn && fn.id) {
                      ajaxNumber++;
                    }
                  });
                });
                if (ajaxNumber && flag && ajaxNumber == flag) {
                  this.loadingShow = false;
                }
              });
            }
          }
        }
      }
      this.noCompobIdList = this.$utils.uniqueByField(this.noCompobIdList, 'id'); // 数组去重
      if (this.$utils.isEmpty(this.noCompobIdList)) {
        // this.handleContinue();
        this.confirm();
      } else {
        this.isShowCompobList = true;
        if (this.$utils.isEmpty(this.compobList)) {
          this.hasContinueBtn = false; // 一个配置都没有，不显示继续按钮
        } else {
          this.hasContinueBtn = true;
        }
      }
    },
    closeCompobDialog() {
      this.noCompobIdList = [];
      this.isShowCompobList = false;
    },
    closeDialog() {
      this.$emit('close');
    },
    handleContinue() {
      // 继续执行
      let flag = 0;
      let paramsList = [];
      let handleDataList = [];
      this.loadingShow = true;
      this.compobList.forEach(item => {
        let tempObj = handleDataList.find((v) => v.id == item.id);
        if (tempObj) {
          tempObj.envIdList.push(item.envId);
        } else {
          handleDataList.push({
            envId: item.envId,
            id: item.id,
            label: item.label,
            combopId: item.combopId,
            envIdList: [item.envId]
          });
        }
      });
      handleDataList.forEach(v => {
        if (v && v.id && v.combopId) {
          paramsList.push({
            combopId: v.combopId,
            name: v.label,
            source: 'inspectapp',
            invokeId: v.id,
            routeId: this.appSystemId,
            roundCount: 64,
            param: {},
            executeConfig: {
              executeNodeConfig: {
                filter: {
                  typeIdList: [v.id],
                  envIdList: v.envIdList,
                  appModuleIdList: [this.inspectionData.id],
                  appSystemIdList: [this.appSystemId]
                }
              }
            }
          });
        }
      });
      paramsList &&
        paramsList.forEach(item => {
          this.$api.inspect.applicationInspect.executeInspect(item).then(res => {
            if (res.Status == 'OK') {
              flag++;
              if (flag == paramsList.length) {
                this.$Message.success(this.$t('message.executesuccess'));
                this.loadingShow = false;
                this.dialogSetting.isShow = false;
                this.isShowCompobList = false;
              }
            }
          }).catch(() => {
            this.loadingShow = false;
          });
        });
    },
    openInspectionTool(toolName) {
      // 打开巡检定义页面
      this.toolName = toolName || '';
      this.isShowInspectTool = true;
    }
  },
  computed: {
    hasAssets() {
      // 是否有关联资产
      let ciVoList = this.envList && this.envList.filter((v) => {
        return v && v.ciVoList && v.ciVoList.length > 0;
      });
      if (this.$utils.isEmpty(ciVoList)) {
        return false;
      } else {
        return true;
      }
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped></style>
