<template>
  <div class="env-autoconfig-box bg-op env-autoconfig-radius">
    <div class="text-right">
      <ul class="pt-nm pr-nm action-group">
        <li v-if="hasEditConfigAuth" class="action-item tsfont-edit text-href" @click="editAutoConfig">{{ $t('page.edit') }}</li>
        <template v-else>
          <Tooltip
            max-width="400"
            placement="right"
            transfer
          >
            <span class="tsfont-edit text-disabled action-item">{{ $t('page.edit') }}</span>
            <ul slot="content">
              <li>{{ $t('term.deploy.noconfigauthtip') }}</li>
            </ul>
          </Tooltip>
        </template>
        <li v-if="hasEditConfigAuth" class="action-item tsfont-formtextarea text-href" @click="editAutoConfigForTextarea">{{ '文本编辑' }}</li>
        <li class="action-item tsfont-task text-href" @click="showEnvAutoConfigAudit">{{ '审计' }}</li>
      </ul>
    </div>
    <div v-if="hasAutoConfig" :class="hasAutoConfig ? 'padding': ''">
      <TsTable
        v-bind="tableConfig"
        :theadList="envTheadList"
        :fixedHeader="false"
        @changeCurrent="changeCurrentAutoConfig"
        @changePageSize="changePageSizeAutoConfig"
      >
        <template slot="value" slot-scope="{row}">
          <span v-if="row.isEmpty==1">{{ $t('page.settonull') }}</span>
          <span v-else-if="row.type==='password' && row.value">******</span>
          <span v-else>{{ row.value }}</span>
          <!-- <span v-if="row.type==='password' && row.value">******</span>
          <span v-else-if="row.type==='password' && !row.value">{{ $t('page.settonull') }}</span>
          <span v-else>{{ row.hasOwnProperty('value') && !row.value ? $t('page.settonull') :(row.value || '-') }}</span> -->
        </template>
      </TsTable>
    </div>
    <ul v-else class="autocfg-box flex-center">
      <li v-show="hasEditConfigAuth" class="text-grey">
        <span>{{ $t('term.deploy.notconfigfiletip') }}</span>
        <span class="tsfont-plus text-href" @click="openEnvEdit">{{ $t('page.config') }}</span></li>
    </ul>
    <div class="border-bottom border-color"></div>
    <div class="padding">
      <div v-show="hasEditConfigAuth" class="pb-xs">
        <span class="pr-nm">{{ $t('term.deploy.configfilecasedifference') }}</span>
        <span class="tsfont-plus text-href" @click="openEnvDifferenceEdit">{{ $t('page.add') }}</span>
      </div>
      <ul v-if="!hasInstance && hasEditConfigAuth" class="flex-center" style="height: 128px;">
        <li class="text-grey">
          <span>{{ $t('term.deploy.notconfigdifftip') }}</span>
          <span class="text-href pl-xs" @click="openEnvDifferenceEdit">{{ $t('page.add') }}</span></li>
      </ul>
      <div v-for="(item, index) in instanceAutoConfigList" :key="index" class="pb-nm">
        <div class="operation-box pb-xs">
          <span>{{ getIPPortName(item) }}</span>
          <div v-show="hasEditConfigAuth" class="action-group">
            <span class="action-item tsfont-edit text-action text-href" @click="openEnvDifferenceEdit(item)">{{ $t('page.edit') }}</span>
            <span class="action-item tsfont-formtextarea text-action text-href" @click="openEnvDifferenceEditForTextarea(item)">{{ '文本编辑' }}</span>
            <span class="action-item tsfont-task text-action text-href" @click="openEnvDifferenceAudit(item)">{{ '审计' }}</span>
            <span class="tsfont-trash-o text-action text-href" @click="delEnvDifference(item, index)">{{ $t('page.delete') }}</span>
          </div>
        </div>
        <TsTable
          v-bind="tableConfig"
          :theadList="envTheadList"
          :tbodyList="item.keyValueList"
          :fixedHeader="false"
        >
          <template slot="value" slot-scope="{row}">
            <span>{{ row.hasOwnProperty('value') && !row.value ? $t('page.settonull') : (row.value || '-') }}</span>
          </template>
        </TsTable>
      </div>
    </div>
    <EnvAutoconfigEdit
      v-if="isShowEnvEdit"
      :isEdit="hasAutoConfig"
      :tableData="tableData"
      :params="params"
      @close="closeAutoConfigEdit"
      @save="saveAutoConfig"
    ></EnvAutoconfigEdit>
    <EnvAutoconfigEditTextarea
      v-if="isShowEnvEditForTextarea"
      :isEdit="hasAutoConfig"
      :instanceId="0"
      :tableData="tableData"
      :params="params"
      @close="closeAutoConfigEdit"
      @save="saveAutoConfig"
    ></EnvAutoconfigEditTextarea>
    <EnvAutoconfigAudit
      v-if="isShowEnvAutoConfigAudit"
      :instanceId="0"
      :params="params"
      @close="closeAutoConfigAudit"
    ></EnvAutoconfigAudit>
    <EnvAutoconfigInstanceDifferenceEdit
      v-if="isShowEnvDifferenceEdit"
      :instanceId="instanceId"
      :params="instanceParams"
      @close="closeEnvDifferenceEdit"
    ></EnvAutoconfigInstanceDifferenceEdit>
    <EnvAutoconfigEditTextarea
      v-if="isShowEnvDifferenceEditForTextarea"
      :isEdit="true"
      :instanceId="instanceId"
      :tableData="instanceTableData"
      :params="instanceParams"
      @close="closeEnvDifferenceEditForTextarea"
      @save="saveEnvDifferenceEditForTextarea"
    ></EnvAutoconfigEditTextarea>
    <EnvAutoconfigAudit
      v-if="isShowEnvDifferenceAudit"
      :instanceId="instanceId"
      :params="instanceParams"
      @close="closeEnvDifferenceAudit"
    ></EnvAutoconfigAudit>
  </div>
</template>
<script>
export default {
  name: '', // 配置文件适配列表
  components: {
    EnvAutoconfigEdit: () => import('./env-autoconfig-edit'),
    EnvAutoconfigEditTextarea: () => import('./env-autoconfig-edit-textarea'),
    EnvAutoconfigAudit: () => import('./env-autoconfig-audit'),
    EnvAutoconfigInstanceDifferenceEdit: () => import('./env-autoconfig-instance-difference-edit'), // 添加实例差异
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    params: {
      type: Object,
      default: function() {
        return {};
      }
    },
    hasEditConfigAuth: {
      // 是否有编辑配置权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowEnvEdit: false,
      isShowEnvEditForTextarea: false,
      isShowEnvAutoConfigAudit: false,
      isShowEnvDifferenceEdit: false,
      isShowEnvDifferenceEditForTextarea: false,
      isShowEnvDifferenceAudit: false,
      hasInstance: false, // 是否存在实例差异
      hasAutoConfig: false,
      instanceId: null,
      instanceParams: {},
      tableConfig: {},
      instanceAutoConfigList: [],
      envTheadList: [
        {
          title: this.$t('page.variablename'),
          key: 'key'
        },
        {
          title: this.$t('page.type'),
          key: 'typeText'
        },
        {
          title: this.$t('page.variablevalue'),
          key: 'value'
        }
      ],
      tableData: {
        hideAction: false,
        tbodyList: []
      },
      instanceTableData: {
        hideAction: false,
        tbodyList: []
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getEnvInfo();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    openEnvEdit() {
      this.isShowEnvEdit = true;
    },
    openEnvDifferenceEdit(item) {
      if (item) {
        let {instanceId, keyValueList} = item;
        this.instanceId = instanceId;
        this.instanceParams = {
          ...this.params,
          keyValueList
        };
      } else {
        this.instanceParams = {
          ...this.params
        };
      }
      this.isShowEnvDifferenceEdit = true;
    },
    openEnvDifferenceEditForTextarea(item) {
      if (item) {
        let {instanceId, keyValueList} = item;
        this.instanceId = instanceId;
        this.instanceParams = {
          ...this.params,
          keyValueList
        };
      } else {
        this.instanceParams = {
          ...this.params
        };
      }
      let {appSystemId, appModuleId, envId} = this.params;
      let params = {
        appSystemId: appSystemId,
        appModuleId: appModuleId,
        envId: envId
      };
      this.$api.deploy.applicationConfig.getEnvInfo(params).then((res) => {
        if (res && res.Status == 'OK') {
          let returnData = res.Return;
          this.currentEnvKeyList = [];
          if (!this.instanceId) {
            // 新增
            this.tableData.tbodyList = [];
            this.isShowEnvDifferenceEditForTextarea = true;
          } else {
            // 编辑
            returnData.instanceAutoConfigList && returnData.instanceAutoConfigList.forEach((item) => {
              if (item.instanceId == this.instanceId) {
                item.keyValueList && item.keyValueList.forEach((v) => {
                  this.instanceTableData.tbodyList.push({
                    key: v.key,
                    value: v.hasOwnProperty('value') ? v.value : '',
                    isEmpty: v.isEmpty,
                    type: v.type,
                    delOperation: '',
                    componentType: v.type
                  });
                });
              }
            });
            this.isShowEnvDifferenceEditForTextarea = true;
          }
        }
      });
    },
    closeEnvDifferenceEditForTextarea(needRefresh) {
      this.isShowEnvDifferenceEditForTextarea = false;
      this.instanceTableData.tbodyList = [];
      if (needRefresh) {
        this.getEnvInfo();
      }
    },
    saveEnvDifferenceEditForTextarea(params) {
      this.$api.deploy.applicationConfig.saveEnvAutoConfig(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeEnvDifferenceEditForTextarea(true);
        }
      });
    },
    openEnvDifferenceAudit(item) {
      if (item) {
        let {instanceId, keyValueList} = item;
        this.instanceId = instanceId;
        this.instanceParams = {
          ...this.params,
          keyValueList
        };
      } else {
        this.instanceParams = {
          ...this.params
        };
      }
      this.isShowEnvDifferenceAudit = true;
    },
    closeEnvDifferenceAudit(needRefresh) {
      this.isShowEnvDifferenceAudit = false;
      if (needRefresh) {
        this.getEnvInfo();
      }
    },
    editAutoConfig() {
      this.isShowEnvEdit = true;
    },
    editAutoConfigForTextarea() {
      this.isShowEnvEditForTextarea = true;
    },
    closeAutoConfigEdit(needRefresh) {
      this.isShowEnvEdit = false;
      this.isShowEnvEditForTextarea = false;
      if (needRefresh) {
        this.getEnvInfo();
      }
    },
    closeEnvDifferenceEdit(needRefresh) {
      this.isShowEnvDifferenceEdit = false;
      this.instanceParams = {};
      if (needRefresh) {
        this.getEnvInfo();
      }
    },
    getEnvInfo() {
      this.$api.deploy.applicationConfig.getEnvInfo(this.params).then((res) => {
        if (res && res.Status == 'OK') {
          let returnData = res.Return;
          if (returnData && returnData.envAutoConfigList) {
            this.hasAutoConfig = !!(returnData.envAutoConfigList && returnData.envAutoConfigList.length > 0);
            this.$set(this.tableConfig, 'tbodyList', returnData.envAutoConfigList);
            this.instanceAutoConfigList = returnData.instanceAutoConfigList;
            this.hasInstance = !!(returnData.instanceAutoConfigList && returnData.instanceAutoConfigList.length > 0);
          } else {
            this.hasAutoConfig = false;
          }
          this.tableData.tbodyList = [];
          returnData.envAutoConfigList && returnData.envAutoConfigList.forEach((v) => {
            this.tableData.tbodyList.push({
              key: v.key,
              type: v.type,
              value: v.hasOwnProperty('value') ? v.value : '',
              isEmpty: v.isEmpty,
              // isEmpty: (!v.hasOwnProperty('value') || (v.value == '')) ? 1 : 0, // 没有value的属性，或者为空字符串，设为空打开
              delOperation: ''
            });
          });
        }
      });
    },
    delEnvDifference(item, index) {
      if (item) {
        let params = {
          appSystemId: item.appSystemId,
          appModuleId: item.appModuleId,
          envId: item.envId,
          instanceId: item.instanceId
        };
        this.$createDialog({
          title: this.$t('dialog.title.deleteconfirm'),
          content: this.$t('dialog.content.deleteconfirm', {target: this.$t('term.deploy.casedifference')}),
          btnType: 'error',
          'on-ok': vnode => {
            vnode.isShow = false;
            this.$nextTick(() => {
              this.$api.deploy.applicationConfig.delEnvExample(params).then((res) => {
                if (res && res.Status == 'OK') {
                  this.instanceAutoConfigList.splice(index, 1);
                  this.$Message.success(this.$t('message.deletesuccess'));
                }
              });
            });
          }
        });
      }
    },
    changeCurrentAutoConfig() {

    },
    changePageSizeAutoConfig() {

    },
    getIPPortName(item) {
      // 获取instanceIp/instancePort/instanceName
      if (item) {
        return item.instanceIp ? (item.instancePort ? (item.instanceName ? `${item.instanceIp}:${item.instancePort}[${item.instanceName}]` : `${item.instanceIp}:${item.instancePort}`) : item.instanceIp) : '';
      }
    },
    saveAutoConfig(params) {
      this.$api.deploy.applicationConfig.saveEnvAutoConfig(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeAutoConfigEdit(true);
        }
      });
    },
    showEnvAutoConfigAudit() {
      this.isShowEnvAutoConfigAudit = true;
    },
    closeAutoConfigAudit(needRefresh) {
      this.isShowEnvAutoConfigAudit = false;
      if (needRefresh) {
        this.getEnvInfo();
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.env-autoconfig-box {
  height: calc(100vh - 50px - 50px - 32px - 16px);
  overflow-y: auto;
  &.env-autoconfig-radius {
  border-radius: 0 10px 10px;
  }
  .autocfg-box {
    height: 148px;
  }
  .add-text-box {
    padding-top: 20px;
  }
}
.border-bottom {
  border-bottom: 1px solid;
}
.operation-box {
  display: flex;
  justify-content: space-between;
}
</style>
