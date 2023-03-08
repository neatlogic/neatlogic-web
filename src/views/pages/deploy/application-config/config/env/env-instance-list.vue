<template>
  <div class="bg-op padding env-example-radius">
    <div class="pb-nm">
      <TsRow>
        <Col :span="12">
          <ul>
            <li v-if="hasEditConfigAuth" class="tsfont-plus text-href mt-sm" @click="openEnvInstanceEdit">实例</li>
            <template v-else>
              <li>您没有当前应用的“编辑配置权限”，请联系管理员授权</li>
            </template>
          </ul>
        </Col>
        <Col :span="12">
          <InputSearcher
            v-if="hasInstance"
            v-model="keyword"
            placeholder="IP、名称"
            @change="searchData"
          ></InputSearcher>
        </Col>
      </TsRow>
    </div>
    <div style="min-height: 200px;">
      <ul v-if="!hasInstance && hasEditConfigAuth" class="flex-center">
        <li>
          <span>未添加实例，点击 </span>
          <span class="text-href" @click="openEnvInstanceEdit">添加实例</span>
        </li>
      </ul>
      <TsTable
        v-if="hasInstance"
        :tbodyList="tbodyList"
        :theadList="theadList"
      >
        <template slot="maintenanceWindow" slot-scope="{ row }">
          <span v-if="row.maintenanceWindow">{{ handleTimerange(row.maintenanceWindow) }}</span>
        </template>
      </TsTable>
    </div>
    <EnvInstanceEdit v-if="isShowEnInstanceEdit" :params="params" @close="closeEnvInstanceEdit"></EnvInstanceEdit>
  </div>
</template>
<script>
import handleTimeMixin from '../app/components/handleTimeMixin.js';
export default {
  name: '', // 实例列表
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    EnvInstanceEdit: resolve => require(['./env-instance-edit'], resolve)
  },
  mixins: [handleTimeMixin],
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
      keyword: '',
      isShowEnInstanceEdit: false,
      hasInstance: false, // 是否添加有实例
      tbodyList: [],
      defaultTbodyList: [],
      theadList: [
        {
          title: this.$t('page.name'),
          key: 'name'
        },
        {
          title: 'IP',
          key: 'ip'
        },
        {
          title: '端口',
          key: 'port'
        },
        {
          title: '维护窗口',
          key: 'maintenanceWindow'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchEnvList();
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
    openEnvInstanceEdit() {
      this.isShowEnInstanceEdit = true;
    },
    closeEnvInstanceEdit(needRefresh) {
      this.isShowEnInstanceEdit = false;
      if (needRefresh) {
        this.searchEnvList();
      }
    },
    searchEnvList() {
      let params = {
        ...this.params
      };
      if (params) {
        this.$api.deploy.applicationConfig.getEnvInfo(params).then((res) => {
          if (res && res.Status == 'OK') {
            let {instanceList} = res.Return;
            this.tbodyList = [];
            this.defaultTbodyList = [];
            if (instanceList && instanceList.length > 0) {
              this.hasInstance = true;
              this.tbodyList = instanceList;
              this.defaultTbodyList = instanceList;
            }
          }
        });
      }
    },
    searchData() {
      // 实例列表，IP/名称查询
      if (this.keyword) {
        this.tbodyList = this.tbodyList.filter((item) => {
          return (item.ip && item.ip.indexOf(this.keyword) != -1) || (item.name && item.name.indexOf(this.keyword) != -1);
        });
      } else {
        this.tbodyList = this.defaultTbodyList;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.env-example-radius {
  height: calc(100vh - 50px - 50px - 32px - 16px);
  border-radius: 0 10px 10px;
}
</style>
