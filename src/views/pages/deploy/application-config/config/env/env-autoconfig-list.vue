<template>
  <div class="env-autoconfig-box bg-op env-autoconfig-radius">
    <ul class="pt-nm pl-nm">
      <li v-if="hasAutoConfig && hasEditConfigAuth" class="tsfont-edit text-href" @click="editAutoConfig">{{ $t('page.edit') }}</li>
      <template v-else>
        <li v-if="!hasEditConfigAuth">{{ $t('term.deploy.noconfigauthtip') }}</li>
      </template>
    </ul>
    <div v-if="hasAutoConfig" :class="hasAutoConfig ? 'padding': ''">
      <TsTable
        v-bind="tableConfig"
        :theadList="envTheadList"
        @changeCurrent="changeCurrentAutoConfig"
        @changePageSize="changePageSizeAutoConfig"
      >
        <template slot="value" slot-scope="{row}">
          <span v-if="row.type==='password'">******</span>
          <span v-else>{{ row.hasOwnProperty('value') && !row.value ? $t('page.settonull') :(row.value || '-') }}</span>
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
            <span class="action-item tsfont-edit text-action" @click="openEnvDifferenceEdit(item)"></span>
            <span class="tsfont-trash-o text-action" @click="delEnvDifference(item, index)"></span>
          </div>
        </div>
        <TsTable
          v-bind="tableConfig"
          :theadList="envTheadList"
          :tbodyList="item.keyValueList"
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
      :params="params"
      @close="closeAutoConfigEdit"
    ></EnvAutoconfigEdit>
    <EnvAutoconfigInstanceDifferenceEdit
      v-if="isShowEnvDifferenceEdit"
      :instanceId="instanceId"
      :params="instanceParams"
      @close="closeEnvDifferenceEdit"
    ></EnvAutoconfigInstanceDifferenceEdit>
  </div>
</template>
<script>
export default {
  name: '', // 配置文件适配列表
  components: {
    EnvAutoconfigEdit: resolve => require(['./env-autoconfig-edit'], resolve),
    EnvAutoconfigInstanceDifferenceEdit: resolve => require(['./env-autoconfig-instance-difference-edit'], resolve), // 添加实例差异
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
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
      isShowEnvDifferenceEdit: false,
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
      ]
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
    editAutoConfig() {
      this.isShowEnvEdit = true;
    },
    closeAutoConfigEdit(needRefresh) {
      this.isShowEnvEdit = false;
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
  &.env-autoconfig-radius {
  border-radius: 0 10px 10px;
  }
  .autocfg-box {
    height: 148px;
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
