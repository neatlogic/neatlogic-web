<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
    <template v-slot>
      <TsTable
        v-if="tableData"
        v-bind="tableData"
        :theadList="theadList"
        @changeCurrent="changePage"
        @changePageSize="changePageSize"
      >
        <template v-slot:duration="{ row }">
          <span v-if="row.duration != null">
            {{ row.duration | formatTimeCost({ unitNumber: 1, language: 'zh', unit: 'millisecond' }) }}
          </span>
          <span v-else>-</span>
        </template>
      </TsTable>
    </template>
  </TsDialog>
</template>
<script>
// import axios from '@/resources/api/http.js';
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    loginAuditId: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: '使用情况',
        width: 'large',
        hasFooter: false,
        maskClose: true
      },
      searchParam: {
        loginAuditId: null,
        currentPage: 1,
        pageSize: 20
      },
      tableData: null,
      theadList: [
        {
          key: 'moduleGroupName',
          title: '模块'
        },
        {
          key: 'featureName',
          title: '功能名称'
        },
        // {
        //   key: 'featurePath',
        //   title: '功能路径'
        // },
        // {
        //   key: 'url',
        //   title: 'URL'
        // },
        {
          key: 'startTime',
          title: this.$t('page.starttime'),
          type: 'time'
        },
        {
          key: 'endTime',
          title: this.$t('page.endtime'),
          type: 'time'
        },
        {
          key: 'duration',
          title: '使用时长'
        }
      ]
    };
  },
  mounted() {
    this.searchParam.loginAuditId = this.loginAuditId;
    this.searchFeatureAuditList();
  },
  methods: {
    closeDialog() {
      this.$emit('close');
    },
    searchFeatureAuditList() {
      if (!this.searchParam.loginAuditId) {
        return;
      }
      this.$api.framework.loginaudit.searchFeatureUsageAuditList(this.searchParam).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
        }
      });
    },
    changePage(currentPage) {
      this.searchParam.currentPage = currentPage || 1;
      this.searchFeatureAuditList();
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchParam.currentPage = 1;
      this.searchFeatureAuditList();
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
