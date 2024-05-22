<template>
  <div class="batch-inspection-dialog-box">
    <TsDialog
      :isShow="true"
      @on-close="closeDialog"
    >
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <template v-slot:header>
        <div>
          <span>{{ $t('term.inspect.appinspect') }}</span>
          <span style="font-weight: normal;" class="tips text-grey pl-xs">{{ inspectionData.abbrName }} {{ inspectionData.name ? (inspectionData.name) : '' }}</span>
        </div>
      </template>
      <ul v-if="!$utils.isEmpty(envModuleList)">
        <li class="mt-md">
          <TsFormCheckbox
            v-model="checkboxModel"
            :dataList="checkboxAllDataList"
            @on-change="checkboxAllChange"
          ></TsFormCheckbox>
        </li>
        <li v-for="(item, index) in envModuleList" :key="index">
          <div class="h4 mb-md mt-md">{{ item.name }}{{ $t('page.environment') }}</div>
          <TsFormCheckbox
            v-model="item.value"
            :dataList="item.appModuleList"
            valueName="id"
            textName="label"
            class="checkbox-list-box"
            @on-change="(selectedList) => changeCheckbox(selectedList, item, index)"
          ></TsFormCheckbox>
        </li>
      </ul>
      <div v-else class="mt-md">{{ $t('term.inspect.appnoasset') }}</div>
      <template v-slot:footer>
        <div>
          <Button :ghost="true" @click="closeDialog">{{ $t('page.cancel') }}</Button>
          <Button v-if="!$utils.isEmpty(envModuleList)" type="primary" @click="confirm">{{ $t('page.continue') }}</Button>
        </div>
      </template>
    </TsDialog>
    <TsDialog
      :title="$t('page.tip')"
      :isShow="isShowCompobDialog"
      @on-close="closeCompobDialog"
    >
      <ul>
        <li v-for="(item, index) in noCompobIdList" :key="index" class="flex-start mb-nm">
          {{ item.label }}<span v-if="item.typeName" class="text-grey">({{ item.typeName }})</span>
          {{ $t('page.notconfig') }}<span v-if="$AuthUtils.hasRole('INSPECT_MODIFY')" class="text-href" @click="openInspectionTool(item.typeName)">{{ $t('term.inspect.inspecttool') }}</span>
          <span v-else class="text-grey">{{ $t('term.inspect.inspecttool') }}</span>
        </li>
      </ul>
      <template v-slot:footer>
        <div>
          <Button :ghost="true" @click="closeCompobDialog">{{ $t('page.cancel') }}</Button>
          <Button v-if="hasContinueBtn" type="primary" @click="okCompobDialog">{{ $t('page.continue') }}</Button>
        </div>
      </template>
    </TsDialog>
    <InspectToolSetting v-if="isShowInspectTool" :keyword="typeName" @close="closeInspectToolSetting"></InspectToolSetting>
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
    }
  },
  data() {
    return {
      checkboxAllDataList: [{
        text: this.$t('page.selectall'),
        value: 'all'
      }],
      defaultDialogList: [],
      checkboxModel: [],
      envModuleList: [],
      noCompobIdList: [], // 巡检没有配置组合工具列表
      subDataList: [],
      isShowCompobDialog: false,
      hasContinueBtn: false,
      loadingShow: false,
      isShowInspectTool: false,
      typeName: '' // 巡检工具名称
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
      this.isShowInspectTool = false;
      // if (needRefresh) {
      //   this.isShowCompobDialog = false;
      //   await this.okDialog();
      // }
    },
    changeCheckbox(selectedList, row, index) {
      let appModuleList = this.$utils.deepClone(row.appModuleList);
      let filterCiVoList = [];
      let allListNumber = null; // 总条数
      let selectedListNumber = null; // 选中数量
      if (row.checkboxFlag == 'all' || row.checkboxFlag == 'cancel') {
        filterCiVoList = appModuleList && appModuleList.filter((val) => {
          return val.id;
        });
      }
      if (selectedList && selectedList.length != row.appModuleList.length && row.checkboxFlag == 'all' && selectedList.includes('')) {
        // 取消单个
        row.value = row.value.filter((val) => val);
        row.checkboxFlag = 'cancel';
        this.$set(this.envModuleList, index, row);
        this.checkboxModel = [];
      } else if (selectedList && selectedList.length == 1 && selectedList.includes('') && row.checkboxFlag == 'all') {
        // 点击所有，全选
        row.value = this.getIdByAppModuleList(row.appModuleList);
        row.checkboxFlag = 'all';
        this.$set(this.envModuleList, index, row);
      } else if (selectedList && selectedList.length == filterCiVoList.length && row.checkboxFlag == 'all' && !selectedList.includes('')) {
        // 点击所有，取消
        row.value = [];
        row.checkboxFlag = 'cancel';
        this.$set(this.envModuleList, index, row);
        this.checkboxModel = [];
      } else if (selectedList && selectedList.length == filterCiVoList.length && row.checkboxFlag == 'cancel' && !selectedList.includes('')) {
        row.value = this.getIdByAppModuleList(row.appModuleList);
        row.checkboxFlag = 'all';
        this.$set(this.envModuleList, index, row);
      } else if (selectedList && row.checkboxFlag == 'cancel' && selectedList.includes('')) {
        row.value = this.getIdByAppModuleList(row.appModuleList);
        row.checkboxFlag = 'all';
        this.$set(this.envModuleList, index, row);
      }
      this.envModuleList && this.envModuleList.forEach((val) => {
        allListNumber += val.appModuleList.length; // 所有的数量
        selectedListNumber += val.value.length;
      });
      if (allListNumber == selectedListNumber) {
        this.checkboxModel = ['all']; // 全选勾选
      }
    },
    checkboxAllChange(val) {
      if (val && val.length > 0) {
        this.envModuleList && this.envModuleList.forEach((item) => {
          item.value = this.getIdByAppModuleList(item.appModuleList);
          item.checkboxFlag = 'all';
        });
      } else {
        this.envModuleList && this.envModuleList.forEach((item) => {
          item.value = [];
          item.checkboxFlag = 'cancel';
        });
      }
    },
    getInspectionList() {
      this.checkboxModel = [];
      this.loadingShow = true;
      let params = {
        appSystemId: this.inspectionData.id
      };
      this.$api.inspect.applicationInspect.getInspectionList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.envModuleList = res.Return;
          this.envModuleList && this.envModuleList.forEach((item) => {
            item && item.appModuleList.forEach((v) => {
              v.label = v.abbrName ? (v.name ? `${v.abbrName}(${v.name})` : v.abbrName) : v.name || '';
            });
            item.appModuleList.unshift({
              label: this.$t('term.deploy.allmodule'),
              id: ''
            });
            item.checkboxFlag = 'cancel';
            item.value = [];
          });
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    getIdByAppModuleList(appModuleList) {
      // 获取id列表，根据模块id
      let idList = [];
      appModuleList && appModuleList.forEach((item) => {
        idList.push(item.id);
      });
      return idList;
    },
    isValid() {
      let isValid = true;
      let copyEnvModuleList = this.$utils.deepClone(this.envModuleList);
      if (copyEnvModuleList && !this.$utils.isEmpty(copyEnvModuleList)) {
        let emptyList = copyEnvModuleList.filter((val) => {
          return !this.$utils.isEmpty(val.value);
        });
        if (this.$utils.isEmpty(emptyList)) {
          this.$Message.warning(this.$t('term.inspect.selectmodule'));
          isValid = false;
        }
      }
      return isValid;
    },
    getEnvList() {
      let envList = [];
      let copyEnvModuleList = this.$utils.deepClone(this.envModuleList);
      copyEnvModuleList && copyEnvModuleList.forEach((env) => {
        if (env && env.appModuleList && env.appModuleList.length > 0 && !this.$utils.isEmpty(env.value)) {
          let moduleIdList = env.value.filter(moduleId => moduleId && moduleId != '');
          if (moduleIdList && moduleIdList.length > 0) {
            envList.push({
              envId: env.id,
              appModuleIdList: moduleIdList
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
        appSystemId: this.inspectionData.id,
        envList: envList
      };
      this.$api.inspect.applicationInspect.createInspectAppJob(param).then((res) => {
        this.loadingShow = true;
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.executesuccess'));
          this.isShowCompobDialog = false;
          this.closeDialog();
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    handleDataList() {
      // 处理获取组合工具id的数据
      let dataList = [];
      let copyEnvModuleList = this.$utils.deepClone(this.envModuleList);
      copyEnvModuleList && copyEnvModuleList.forEach((a) => {
        if (a && a.appModuleList && a.appModuleList.length > 0 && !this.$utils.isEmpty(a.value)) {
          a.appModuleList.forEach((b) => {
            if (b && b.ciList && !this.$utils.isEmpty(b.ciList)) {
              b.ciList.forEach((c) => {
                if (c && c.id) {
                  dataList.push({
                    envId: a.id,
                    appModuleId: b.id,
                    ciLabel: c.label,
                    ciId: c.id,
                    typeName: c.name,
                    value: a.value.includes(b.id) ? a.value : []
                  });
                }
              });
            }
          });
        }
      });
      return dataList;
    },
    async okDialog() {
      // 执行操作
      this.noCompobIdList = [];
      if (!this.isValid()) {
        return false;
      }
      this.loadingShow = true;
      let ajaxFinishedFlag = 0;
      let dataList = this.handleDataList();
      let submitDataList = [];
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i] && dataList[i].value && dataList[i].value.length > 0) {
          await this.$api.inspect.applicationInspect.getCombopIdByTypeId({ciId: dataList[i].ciId, resourceId: null}).then((res) => {
            if (res.Status == 'OK') {
              let returnValue = res.Return;
              ajaxFinishedFlag = ajaxFinishedFlag + 1;
              if (returnValue && returnValue.isHasBindCombop == 1) {
                dataList[i].combopId = returnValue.combop ? returnValue.combop.id : null;
              } else if (returnValue && returnValue.isHasBindCombop == 0) {
                // 没有绑定组合工具
                this.noCompobIdList.push({
                  id: dataList[i].ciId,
                  label: dataList[i].ciLabel,
                  typeName: dataList[i].typeName
                });
              }
            }
          }).finally(() => {
            let ajaxNumber = dataList.filter((v) => {
              return v.value && v.value.length > 0;
            });
            if (ajaxFinishedFlag == ajaxNumber.length) {
              this.loadingShow = false;
            }
          });
        }
      }
      dataList.forEach((item) => {
        // 合并appModuleIdList
        if (item && item.combopId) {
          let tempObj = submitDataList.find((v) => v.envId == item.envId && v.ciId == item.ciId);
          if (tempObj) {
            tempObj.appModuleIdList.push(item.appModuleId);
          } else {
            submitDataList.push({
              envId: item.envId,
              ciId: item.ciId,
              ciLable: item.ciLabel,
              appModuleId: item.appModuleId,
              appModuleIdList: [item.appModuleId],
              combopId: item.combopId
            });
          }
        }
      });
      this.subDataList = [];
      submitDataList.forEach((item) => {
        this.subDataList.push({
          combopId: item.combopId,
          name: item.ciLable,
          source: 'inspectapp',
          invokeId: item.ciId,
          routeId: this.inspectionData.id,
          roundCount: 64,
          param: {},
          executeConfig: {
            executeNodeConfig: {
              filter: {
                typeIdList: [item.ciId],
                envIdList: [item.envId],
                appModuleIdList: item.appModuleIdList,
                appSystemIdList: [this.inspectionData.id]
              }
            }
          }
        });
      });
      this.noCompobIdList = this.$utils.uniqueByField(this.noCompobIdList, 'id'); // 数组去重
      if (!this.$utils.isEmpty(this.noCompobIdList)) {
        this.isShowCompobDialog = true;
        if (this.$utils.isEmpty(submitDataList)) {
          this.hasContinueBtn = false; // 一个配置工具都没有，则不显示继续按钮
        } else {
          this.hasContinueBtn = true;
        }
      } else {
        // 全部都是有组合工具id，直接提交请求
        this.okCompobDialog();
      }
    },
    closeDialog() {
      this.$emit('close');
    },
    closeCompobDialog() {
      this.isShowCompobDialog = false;
    },
    okCompobDialog() {
      let flag = 0;
      this.subDataList && this.subDataList.forEach((item) => {
        this.$api.inspect.applicationInspect.executeInspect(item).then((res) => {
          if (res.Status == 'OK') {
            flag++;
            if (flag == this.subDataList.length) {
              this.$Message.success(this.$t('message.executesuccess'));
              this.isShowCompobDialog = false;
              this.closeDialog();
            }
          }
        }).catch(() => {
          this.loadingShow = false;
        });
      });
    },
    openInspectionTool(typeName) {
      // 打开巡检定义页面
      this.typeName = typeName || '';
      this.isShowInspectTool = true;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
