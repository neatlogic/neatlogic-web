<template>
  <div id="appModuleList">
    <Loading :loadingShow="loading" type="fix"></Loading>
    <div class="appModule-list">
      <Checkbox
        v-if="!allModuleDiabled"
        :value="allModuleCheck"
        :indeterminate="allModuleInteterminate"
        :disabled="disabled"
        @on-change="checkAllModule"
      >{{ $t('page.selectall') }}</Checkbox>
      <div
        v-for="(item, index) in appModuleListLocal"
        :id="'appModule_' + item.id"
        :key="index"
        class="pt-sm"
      >
        <div class="appModule-title">
          <Checkbox v-model="item.isChecked" :disabled="disabled || item.disabled" @on-change="checkAppModule">
            <span>
              <span v-if="item.abbrName">{{ item.abbrName }}</span>
              <span v-if="item.name">[{{ item.name }}]</span>
            </span>
          </Checkbox>
          <template v-if="!item.disableInstanceFilter && item.isChecked">
            <div
              v-if="!disableVersionSelect && item.version"
              class="pl-nm text-href"
              :class="{'text-disabled':disabled}"
              @click="selectVersion(item, index)"
            >
              <span>{{ item.version }}</span>
              <span v-if="item.isHasBuildTypeTool">-{{ item.buildNo == -1 ? 'buildnew' : 'build' + item.buildNo }}</span>
            </div>
            <div v-else-if="!disableVersionSelect && (item.isHasBuildTypeTool || item.isHasDeployTypeTool)" class="text-href pl-nm">
              <Button
                type="primary"
                ghost
                :disabled="disabled"
                @click="selectVersion(item, index)"
              >{{ $t('term.deploy.selectversion') }}</Button>
            </div>
            <div class="text-tip-active pl-nm">
              <TsFormItem :label="$t('term.deploy.instancefiltering') " labelWidth="70">
                <TsFormSwitch
                  v-model="item.isSelectInstance"
                  :falseValue="false"
                  :trueValue="true"
                  :disabled="disabled"
                  @on-change="showInstanceList(item)"
                ></TsFormSwitch>
              </TsFormItem>
            </div>
          </template>
        </div>
        <div v-if="item.isChecked && item.isSelectInstance" class="instance-box mt-sm">
          <div class="bg-op padding radius-lg">
            <Loading :loadingShow="item.loadingShow" type="fix"></Loading>
            <div v-if="item.instanceList && item.instanceList.length > 0">
              <div class="pb-sm">
                <Checkbox
                  :value="allInstanceCheck(item)"
                  :indeterminate="allInstanceIndeterminate(item)"
                  :disabled="disabled"
                  @on-change="
                    val => {
                      checkAllInstance(item, val);
                    }
                  "
                >
                  <span>{{ $t('page.selectall') }}</span>
                </Checkbox>
              </div>
              <div class="instance-ul">
                <Row :gutter="16">
                  <Col
                    v-for="i in item.instanceList"
                    :key="i.id"
                    :xs="12"
                    :sm="8"
                    :md="6"
                  >
                    <div class="overflow instance-li">
                      <Checkbox v-model="i.isChecked" :disabled="disabled" @on-change="checkInstance">
                        <span v-if="i.name" class="text-tip">{{ i.name }}</span>
                        <span v-if="i.ip" class="text-tip">[{{ i.ip }}]</span>
                      </Checkbox>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            <div v-else class="text-tip">{{ $t('term.deploy.moduleenvnotinstance', {modulename: item.name, envname: envName}) }}</div>
          </div>
        </div>
        <div v-if="item.canSelectModule && !item.isHasRunner" class="runner-tip pt-sm text-tip">
          <i class="tsfont-danger-o text-warning pr-xs"></i>
          <span>{{ $t('term.deploy.currentmodulenotsetexecutetip') }}</span>
          <span class="text-href" @click="addRunner(item)">{{ $t('term.deploy.clickadd') }}</span>
          <span>{{ $t('term.deploy.actuator') }}</span>
        </div>
      </div>
    </div>
    <TsDialog
      v-if="showDialog"
      type="modal"
      :isShow.sync="showDialog"
      :title="$t('term.deploy.selectversion')"
      :width="isHasBuildTypeTool ? 'small' : 'medium'"
      @on-ok="okVersion"
      @on-close="closeVersion"
    >
      <template v-slot>
        <div v-if="isHasBuildTypeTool">
          <BuildnoTable :params="searchParam" @getSelectedVersion="getSelectedVersion" @addVersion="addVersion"></BuildnoTable>
        </div>
        <div v-else>
          <VersionTable :params="searchParam" @getSelectedVersion="getSelectedVersion" @addVersion="addVersion"></VersionTable>
        </div>
      </template>
    </TsDialog>
    <AddVersionDialog v-if="isShowVersionDialog" :params="searchParam" @close="closeAddVersion"></AddVersionDialog>
    <ModuleEdit v-if="isShowModuleInfoEdit" :params="runnerParams" @close="closeModuleInfoEdit"></ModuleEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    BuildnoTable: resolve => require(['./module/buildno-table.vue'], resolve),
    VersionTable: resolve => require(['./module/version-table.vue'], resolve),
    AddVersionDialog: resolve => require(['./module/add-version-dialog.vue'], resolve),
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormSwitch: resolve => require(['@/resources/plugins/TsForm/TsFormSwitch'], resolve),
    ModuleEdit: resolve => require(['@/views/pages/deploy/application-config/config/module/module-edit'], resolve)
  },
  props: {
    appSystemId: Number,
    envId: Number,
    envName: String,
    loading: { type: Boolean, default: false },
    disableVersionSelect: { type: Boolean, default: false },
    appModuleList: {
      type: Array,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      appModuleListLocal: [],
      appModuleIdList: [],
      showDialog: false,
      isHasBuildTypeTool: 0,
      searchParam: {
        appSystemId: this.appSystemId
      },
      selectIndex: 0,
      selectItem: null,
      isShowVersionDialog: false,
      isShowModuleInfoEdit: false,
      runnerParams: {
        //保存runner需要的参数
        appSystemId: this.appSystemId
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
    checkAllModule(val) {
      this.appModuleListLocal.forEach(item => {
        this.$set(item, 'isChecked', val);
      });
    },
    checkAppModule() {
      this.$emit('updateSelectModuleList', this.appModuleListLocal);
    },
    selectVersion(item, index) {
      if (this.disabled) {
        return;
      }
      this.selectIndex = index;
      this.isHasBuildTypeTool = item.isHasBuildTypeTool;
      this.searchParam.appModuleId = item.id;
      this.showDialog = true;
      this.$set(this.searchParam, 'version', item.version || null);
      this.isHasBuildTypeTool && this.$set(this.searchParam, 'buildNo', item.buildNo || null);
    },
    okVersion() {
      if (this.selectItem) {
        this.selectItem.version && this.$set(this.appModuleListLocal[this.selectIndex], 'version', this.selectItem.version);
        this.selectItem.buildNo && this.$set(this.appModuleListLocal[this.selectIndex], 'buildNo', this.selectItem.buildNo);
      }
      this.closeVersion();
    },
    closeVersion() {
      this.showDialog = false;
    },
    getSelectedVersion(row) {
      //选择版本
      this.selectItem = row;
    },
    addVersion() {
      this.showDialog = false;
      this.isShowVersionDialog = true;
    },
    closeAddVersion() {
      this.isShowVersionDialog = false;
      this.showDialog = true;
    },
    showInstanceList(item) {
      //筛选实例
      if (item.isSelectInstance) {
        this.$set(item, 'loadingShow', true);
        this.getInstanceList(item);
      }
    },
    getInstanceList(module) {
      //获取实例列表
      let data = {
        needPage: false,
        appSystemId: this.appSystemId,
        envId: this.envId,
        appModuleId: module.id
      };
      this.$api.deploy.env
        .getInstanceList(data)
        .then(res => {
          if (res.Status == 'OK') {
            if (res.Return && res.Return.tbodyList && res.Return.tbodyList.length) {
              let instanceList = res.Return.tbodyList;
              instanceList.forEach(i => {
                //处理回显数据
                if (module.instanceList) {
                  if (module.instanceList.find(ins => ins.id === i.id)) {
                    this.$set(i, 'isChecked', true);
                  }
                } else {
                  this.$set(i, 'isChecked', true);
                }
              });
              this.$set(module, 'instanceList', instanceList);
            } else {
              this.$set(module, 'instanceList', []);
            }
          }
        })
        .finally(() => {
          this.$set(module, 'loadingShow', false);
        });
    },
    checkAllInstance(module, isChecked) {
      if (module.instanceList && module.instanceList.length) {
        module.instanceList.forEach(i => {
          this.$set(i, 'isChecked', isChecked);
        });
      }
    },
    checkInstance() {
      this.$emit('updateSelectModuleList', this.appModuleListLocal);
    },
    getData() {
      //向外提供的取数接口
      let moduleList = [];
      this.appModuleListLocal.forEach(item => {
        if (item.isChecked) {
          let config = {
            id: item.id,
            name: item.name,
            abbrName: item.abbrName,
            selectNodeList: []
          };
          item.version && this.$set(config, 'version', item.version);
          item.buildNo && this.$set(config, 'buildNo', item.buildNo);
          if (item.isSelectInstance && item.instanceList && item.instanceList.length) {
            item.instanceList.forEach(i => {
              if (i.isChecked) {
                config.selectNodeList.push({
                  id: i.id,
                  ip: i.ip,
                  port: i.port,
                  name: i.name
                });
              }
            });
          }
          moduleList.push(config);
        }
      });
      return moduleList;
    },
    valid() {
      let validList = [];
      let moduleList = this.appModuleListLocal.filter(item => {
        return item.isChecked;
      });
      if (!moduleList.length) {
        validList.push({
          text: this.$t('term.deploy.atleastselectamodule'),
          type: 'error',
          id: '#appModuleList'
        });
      } else {
        moduleList.forEach(m => {
          if (!m.version && (m.isHasBuildTypeTool || m.isHasDeployTypeTool)) {
            validList.push({
              text: this.$t('term.deploy.moduleconfigselectversion', {target: m.name}),
              type: 'error',
              id: '#appModule_' + m.id
            });
          }
          if (m.isSelectInstance) {
            let selectNodeList = m.instanceList.filter(i => {
              return i.isChecked;
            });
            if (!selectNodeList.length) {
              validList.push({
                text: this.$t('term.deploy.moduleconfigatleastselectainstance', {target: m.name}),
                type: 'error',
                id: '#appModule_' + m.id
              });
            }
          }
        });
      }
      return validList;
    },
    addRunner(item) {
      this.appModuleId = item.id;
      this.$set(this.runnerParams, 'appModuleId', item.id);
      this.isShowModuleInfoEdit = true;
    },
    closeModuleInfoEdit(needRefresh) {
      if (needRefresh) {
        let findItem = this.appModuleListLocal.find(item => item.id == this.appModuleId);
        if (findItem) {
          this.$set(findItem, 'isHasRunner', 1);
          this.$set(findItem, 'disabled', false);
        }
      }
      this.isShowModuleInfoEdit = false;
    }
  },
  filter: {},
  computed: {
    allModuleDiabled() {
      const disabledItem = this.appModuleListLocal.find(element => element.disabled);
      if (disabledItem) {
        return true;
      }
      return false;
    },
    allModuleCheck() {
      if (this.appModuleListLocal && this.appModuleListLocal.length > 0) {
        const uncheckItem = this.appModuleListLocal.find(element => !element.isChecked);
        const checkedItem = this.appModuleListLocal.find(element => element.isChecked);
        if (!uncheckItem && checkedItem) {
          return true;
        }
      }
      return false;
    },
    allModuleInteterminate() {
      if (this.appModuleListLocal && this.appModuleListLocal.length > 0) {
        const uncheckItem = this.appModuleListLocal.find(element => !element.isChecked);
        const checkedItem = this.appModuleListLocal.find(element => element.isChecked);
        if (uncheckItem && checkedItem) {
          return true;
        }
      }
      return false;
    },
    allInstanceCheck() {
      return module => {
        if (module.instanceList && module.instanceList.length > 0) {
          const uncheckItem = module.instanceList.find(element => !element.isChecked);
          const checkedItem = module.instanceList.find(element => element.isChecked);
          if (!uncheckItem && checkedItem) {
            return true;
          }
        }
        return false;
      };
    },
    allInstanceIndeterminate() {
      return module => {
        if (module.instanceList && module.instanceList.length > 0) {
          const uncheckItem = module.instanceList.find(element => !element.isChecked);
          const checkedItem = module.instanceList.find(element => element.isChecked);
          if (uncheckItem && checkedItem) {
            return true;
          }
        }
        return false;
      };
    }
  },
  watch: {
    appModuleList: {
      handler(val) {
        if (val && val.length && !this.$utils.isSame(val, this.appModuleListLocal)) {
          this.appModuleListLocal = this.$utils.deepClone(val);
          if (this.appModuleListLocal && this.appModuleListLocal.length > 0) {
            this.appModuleListLocal.forEach(module => {
              if (module.isChecked && module.isSelectInstance) {
                this.getInstanceList(module);
              }
            });
          }
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.divier {
  font-size: 13px;
}
.appModule-title {
  display: flex;
  align-items: center;
}
.instance-box {
  position: relative;
  padding-left: 30px;
  .instance-ul {
    margin-bottom: -10px;
    .instance-li {
      margin-bottom: 10px;
    }
  }
}
.runner-tip {
  display: flex;
  align-items: center;
}
</style>
