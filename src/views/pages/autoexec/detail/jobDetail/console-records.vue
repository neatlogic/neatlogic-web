
<template>
  <div>
    <TsTable v-bind="tableConfig" :theadList="theadList">
      <template v-slot:startTime="{ row }">
        <span v-if="row.startTime" class="overflow" :class="{ 'text-grey': row.isDelete === 1 }">
          <div v-if="row.startTime" class="fz10">
            <span>{{ row.startTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.begin') }}</span>
          </div>
          <div v-if="row.endTime" class="fz10">
            <span>{{ row.endTime | formatDate }}</span>
            <span class="text-grey ml-xs">{{ $t('page.finish') }}</span>
          </div>
        </span>
      </template>
      <template v-slot:id="{ row }">
        <span v-download="downurl(row)" class="text-href">
          {{ $t('page.downloadlog') }}
        </span>
      </template>
    </TsTable>
    <Loading v-if="isLoading"></Loading>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  directives: { download },
  filters: {
  },
  props: {
    jobData: {type: Object},
    runnerData: {type: Object}
  },
  data() {
    return {
      theadList: [
        {
          title: this.$t('page.startstoptime'),
          key: 'startTime'
        },
        {
          title: this.$t('page.timecost'),
          key: 'costTime'
        },
        {
          title: this.$t('page.executeuser'),
          key: 'execUser',
          type: 'user'
        },
        {
          title: this.$t('page.result'),
          key: 'id'
        }
      ],
      tableConfig: {
      },
      isLoading: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTableData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTableData() {
      this.isLoading = true;
      let data = {
        jobId: this.jobData.id,
        runnerId: this.runnerData.id
      };
      this.$api.autoexec.job.getConsoleRecords(data).then(res => {
        this.tableConfig = res.Return;
      }).finally(() => {
        this.isLoading = false;
      });
    }
  },
  computed: {
    downurl() {
      return (row) => {
        let data = {
          jobId: this.jobData.id,
          runnerId: this.runnerData.id,
          startTime: row.startTime,
          execUser: row.execUser
        };
        return {url: '/api/binary/autoexec/job/console/log/audit/download', params: data, method: 'post'};
      };
    }
  },
  watch: {
  }
};
</script>
