<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog">
    <template v-slot>
      <TsTable
        v-if="tableData"
        v-bind="tableData"
        :theadList="theadList"
        @changeCurrent="changePage"
        @changePageSize="changePageSize"
      ></TsTable>
    </template>
  </TsDialog>
</template>
<script>
import axios from '@/resources/api/http.js';
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
          key: 'moduleGroup',
          title: '模块'
        },
        {
          key: 'menuName',
          title: '功能名称'
        },
        {
          key: 'menuPath',
          title: '功能路径'
        },
        {
          key: 'url',
          title: 'URL'
        },
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
          title: '使用时长' + '(ms)'
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
      axios.post('/api/rest/feature/usage/audit/search', this.searchParam).then(res => {
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
