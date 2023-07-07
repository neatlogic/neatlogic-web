<template>
  <div class="version-detail-wrap padding">
    <div v-if="selectedEnvId">
      <div v-if="envList && envList.length > 0" class="mb-sm">
        <Row :gutter="16">
          <Col
            v-for="(item,index) in envList"
            :key="index"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
            :xl="3"
            :xxl="2"
          >
            <div
              v-if="item.envName"
              class="li-item text-action"
              :class="selectedEnvId == item.envId ? 'li-active li-text border-primary' : 'border-base bg-op'"
              @click="selectedItem(item.envId)"
            >{{ item.envName }}</div>
          </Col>
        </Row>
      </div>
      <Row :gutter="16">
        <Col :span="14">
        </Col>
        <Col :span="10">
          <InputSearcher
            v-model="keyword"
            :placeholder="$t('term.deploy.ipname')"
            class="mb-nm"
            @change="searchData(1)"
          ></InputSearcher>
        </Col>
      </Row>
      <TsTable
        :theadList="theadList"
        v-bind="tableData"
        @changeCurrent="changeCurrent"
        @changePageSize="changePageSize"
      >
        <template slot="status" slot-scope="{row}">
          <span>{{ (row && row.status) ? $t('page.publish') : $t('page.notpublish') }}</span>
        </template>
      </TsTable>
    </div>
    <div v-else>
      <NoData :text="$t('term.deploy.appnotsettingenv')"></NoData>
    </div>
  </div>
</template>
<script>
export default {
  name: '', // 发布状态
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve)
  },
  props: {
    envId: {
      // 环境id
      type: Number,
      default: null
    },
    versionId: {
      // 版本ID
      type: Number,
      default: null
    }
  },
  data() {
    return {
      keyword: '',
      envList: [],
      selectedEnvId: null, // 选中环境id
      tableData: {},
      searchParams: {},
      theadList: [
        {
          title: this.$t('term.deploy.instancename'),
          key: 'resourceName'
        },
        {
          title: this.$t('page.ip'),
          key: 'ip'
        },
        {
          title: this.$t('term.deploy.publishstatus'),
          key: 'status'
        },
        {
          title: this.$t('term.deploy.lastpublishtime'),
          key: 'deployTime',
          type: 'time'
        },
        {
          title: this.$t('term.deploy.lastpublisheduser'),
          key: 'deployUserVo',
          type: 'user'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  async mounted() {
    await this.getVersionEnvList();
    if (this.envId) {
      this.selectedEnvId = this.envId;
      this.searchData(1);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getVersionEnvList() {
      this.$api.deploy.version.getVersionEnvList({versionId: this.versionId}).then((res) => {
        if (res.Status == 'OK') {
          this.envList = res.Return;
          if (!this.envId) {
            this.selectedEnvId = this.envList.length ? this.envList[0].envId : null;
          }
        }
      });
    },
    searchData(currentPage) {
      if (currentPage) {
        this.searchParams.currentPage = currentPage;
      }
      let params = {
        versionId: this.versionId,
        envId: this.selectedEnvId,
        keyword: this.keyword
      };
      this.$api.deploy.version.versionInstanceSearch({...this.searchParams, ...params}).then((res) => {
        if (res.Status == 'OK') {
          this.$set(this.tableData, 'tbodyList', res.Return);
        }
      });
    },
    selectedItem(envId) {
      if (envId) {
        this.selectedEnvId = envId;
        this.searchData(1);
      }
    },
    changeCurrent(currentPage) {
      this.searchData(currentPage);
    },
    changePageSize(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchData(1);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.version-detail-wrap {
  .li-item {
    padding: 6px 16px;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 10px;
  }
}
</style>
