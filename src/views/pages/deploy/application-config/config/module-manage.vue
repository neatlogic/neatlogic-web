<template>
  <div>
    <ModuleInfo v-if="!isLoading" v-bind="params"></ModuleInfo>
    <div class="pb-xs pt-xs">
      <span class="pr-nm">{{ $t('term.deploy.actuatorgroupallocation') }}</span>
      <span v-show="hasEditConfigAuth" class="tsfont-edit text-action text-href" @click="openModuleInfoEdit">{{ $t('page.edit') }}</span>
    </div>
    <div v-if="!moduleInfo && hasEditConfigAuth" class="bg-op radius-lg padding" style="height: 200px;">
      <div class="pt-xs pb-xs pl-nm pr-nm bg-error-grey radius-sm">{{ $t('term.deploy.modulenotconfigrunnergroup') }}<span class="text-href" @click="openModuleInfoEdit">{{ $t('term.deploy.configrunnergroup') }}</span></div>
    </div>
    <div v-else class="module-content-box bg-op radius-lg pt-nm pb-nm pr-lg pl-lg">
      <TsRow>
        <Col :span="10">
          <div>
            <div class="text-grey pb-xs">{{ $t('term.deploy.actuatorgroup') }}</div>
            <div class="overflow">{{ runnerGroupInfo ? runnerGroupInfo.name : '' }}</div>
          </div>
        </Col>
        <Col :span="14">
          <div>
            <div class="text-grey pb-xs">{{ $t('page.description') }}</div>
            <div class="overflow">{{ runnerGroupInfo ? runnerGroupInfo.description : '' }}</div>
          </div>
        </Col>
      </TsRow>

      <div class="runner-table-box pt-nm">
        <div class="text-grey pb-xs">{{ $t('term.deploy.associatedrunner') }}</div>
      </div>
      <TsTable
        v-bind="tableConfig"
        :theadList="theadList"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="" slot-scope="{row}">
          {{ row }}
        </template>
      </TsTable>
    </div>
    <ModuleEdit
      v-if="isShowModuleInfoEdit"
      :runnerId="runnerId"
      :params="params"
      @close="closeModuleInfoEdit"
    >
    </ModuleEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ModuleEdit: () => import('./module/module-edit'),
    ModuleInfo: () => import('./module/module-info')
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
      isLoading: false,
      isShowModuleInfoEdit: false,
      moduleInfo: {},
      runnerGroupInfo: {},
      tableConfig: {},
      runnerId: null,
      theadList: [
        {
          key: 'name',
          title: this.$t('page.name')
        },
        {
          key: 'authType',
          title: this.$t('term.deploy.connectionmode')
        },
        {
          key: 'host',
          title: this.$t('page.ip')
        },
        {
          key: 'protocol',
          title: this.$t('page.protocol')
        },
        {
          key: 'port',
          title: this.$t('term.deploy.commandport')
        },
        {
          key: 'nettyPort',
          title: this.$t('term.deploy.heartbeatport')
        }
      ]

    };
  },
  beforeCreate() {},
  created() {
    this.searchRunner();
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
    openModuleInfoEdit() {
      this.runnerId = this.runnerGroupInfo?.id;
      this.isShowModuleInfoEdit = true;
    },
    closeModuleInfoEdit(needRefresh) {
      this.isShowModuleInfoEdit = false;
      if (needRefresh) {
        this.searchRunner(1);
      }
    },
    changeCurrent(currentPage) {
      this.searchRunner(currentPage);
    },
    changePageSize(pageSize) {
      this.tableConfig.pageSize = pageSize;
      this.searchRunner();
    },
    searchRunner(currentPage) {
      this.moduleInfo = {};
      this.isLoading = true;
      let params = {
        ...this.params,
        currentPage: currentPage
      };
      if (params) {
        this.$api.deploy.applicationConfig.getModuleInfo(params).then((res) => {
          if (res && res.Status == 'OK') {
            let {appModuleInfo, runnerGroupVo} = res.Return;
            this.moduleInfo = appModuleInfo;
            this.runnerGroupInfo = runnerGroupVo;
            this.tableConfig.tbodyList = runnerGroupVo ? runnerGroupVo.runnerList : [];
          }
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
