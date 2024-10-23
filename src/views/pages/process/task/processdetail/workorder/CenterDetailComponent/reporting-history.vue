<template>
  <div>
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <TsTable
      v-bind="tableConfig"
      :fixedHeader="false"
      :theadList="theadList"
      @changeCurrent="changeCurrent"
      @changePageSize="changePageSize"
    >
      <template slot="title" slot-scope="{row}">
        <div v-if="row.title" class="text-href" @click="toTaskDetailPage(row)">
          {{ row.title }}
        </div>
      </template>
      <template slot="priority" slot-scope="{row}">
        <div v-if="row.priority" :style="{ color: row.priority.color }">
          {{ row.priority.name }}
        </div>
      </template>
      <template slot="statusVo" slot-scope="{row}">
        <div v-if="row.statusVo" :style="{ color: row.statusVo.color }">
          {{ row.statusVo.text }}
        </div>
      </template>
      <template slot="startTime" slot-scope="{row}">
        <div>
          {{ row.startTime | formatDate }}
        </div>
      </template>
      <template slot="endTime" slot-scope="{row}">
        <div>
          {{ row.endTime | formatDate }}
        </div>
      </template>

    </TsTable>
  </div>
</template>
<script>
export default {
  name: '', // 上报列表页面
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    processTaskConfig: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: false,
      tableConfig: {
        currentPage: 1,
        pageSize: 10,
        pageCount: 0,
        rowNum: 0,
        tbodyList: []
      },
      defaultData: null,
      theadList: [
        {
          title: this.$t('page.title'),
          key: 'title'
        },
        {
          title: this.$t('page.priority'),
          key: 'priority'
        },
        {
          title: this.$t('page.status'),
          key: 'statusVo'
        },
        {
          title: this.$t('term.process.catalogmanage'),
          key: 'catalogName'
        },
        {
          title: this.$t('page.reportingtime'),
          key: 'startTime'
        },
        {
          title: this.$t('page.endtime'),
          key: 'endTime'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getTableList();
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
    changeCurrent(currentPage) {
      this.tableConfig.currentPage = currentPage;
      this.getTableList();
    },
    changePageSize(pageSize) {
      this.tableConfig.currentPage = 1;
      this.tableConfig.pageSize = pageSize;
      this.getTableList();
    },
    getTableList() {
      // 获取列表
      if (this.$utils.isEmpty(this.processTaskConfig)) {
        return false;
      }
      this.loadingShow = true;
      let params = {
        owner: this.processTaskConfig.owner,
        excludeId: this.processTaskConfig.id,
        currentPage: this.tableConfig.currentPage,
        pageSize: this.tableConfig.pageSize
      };
      this.$api.process.processtask.getReportingHistoryList(params).then((res) => {
        if (res.Status == 'OK') {
          this.tableConfig = Object.assign(this.tableConfig, res.Return);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    toTaskDetailPage(row) {
      // 跳转到工单详情页面
      let url = '/task-detail';
      if (!this.$utils.isEmpty(row)) {
        let id = row.id;
        if (row.status === 'draft') {
          url = '/task-dispatch';
        }
        window.open(HOME + `/process.html#${url}?processTaskId=${id}`, '_blank');
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    processTaskConfig: {
      handler(newVal) {
        let {owner = '', id = ''} = newVal || {};
        let tempData = {owner, id};
        if (!this.$utils.isSame(this.defaultData, tempData)) {
          this.defaultData = this.$utils.deepClone(tempData);
          this.getTableList();
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>
