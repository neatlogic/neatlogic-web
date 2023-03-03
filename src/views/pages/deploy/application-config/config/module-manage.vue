<template>
  <div>
    <ModuleInfo v-if="!isLoading" v-bind="params"></ModuleInfo>
    <div class="pb-xs pt-xs">
      <span class="pr-nm">执行器组分配</span>
      <span v-show="hasEditConfigAuth" class="tsfont-edit text-action text-href" @click="openModuleInfoEdit">编辑</span>
    </div>
    <div v-if="!moduleInfo && hasEditConfigAuth" class="bg-op radius-lg padding" style="height: 200px;">
      <div class="pt-xs pb-xs pl-nm pr-nm bg-error-grey radius-sm">当前模块未配置runner组，将导致发布作业无法运行，点击<span class="text-href" @click="openModuleInfoEdit">配置runner组</span></div>
    </div>
    <div v-else class="module-content-box bg-op radius-lg pt-nm pb-nm pr-lg pl-lg">
      <TsRow>
        <Col :span="10">
          <div>
            <div class="text-grey pb-xs">执行器组</div>
            <div class="overflow">{{ runnerGroupInfo ? runnerGroupInfo.name : '' }}</div>
          </div>
        </Col>
        <Col :span="14">
          <div>
            <div class="text-grey pb-xs">描述</div>
            <div class="overflow">{{ runnerGroupInfo ? runnerGroupInfo.description : '' }}</div>
          </div>
        </Col>
      </TsRow>

      <div class="runner-table-box pt-nm">
        <div class="text-grey pb-xs">关联runner</div>
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
    <ModuleEdit v-if="isShowModuleInfoEdit" :params="params" @close="closeModuleInfoEdit">
    </ModuleEdit>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ModuleEdit: resolve => require(['./module/module-edit'], resolve),
    ModuleInfo: resolve => require(['./module/module-info'], resolve)
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
      theadList: [
        {
          key: 'name', 
          title: '名称'
        },
        {
          key: 'authType', 
          title: '连接方式'
        },
        {
          key: 'host', 
          title: 'IP'
        },
        {
          key: 'protocol', 
          title: '协议'
        },
        {
          key: 'port', 
          title: '命令端口'
        },
        {
          key: 'nettyPort', 
          title: '心跳端口'
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
