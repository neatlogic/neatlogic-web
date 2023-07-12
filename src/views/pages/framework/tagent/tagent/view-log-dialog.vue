<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-close="close"
    >
      <template v-slot>
        <TsTable v-bind="tableData" :theadList="theadList">
          <template v-slot:download="{ row }">
            <div class="action-group tagent-manage-download-box">
              <span v-if="row.isDownloadFileLoding" class="action-item disable" :title="$t('page.downloadloadingtip')">
                <Icon type="ios-loading" size="18" class="loading"></Icon>
                {{ $t('page.downloading') }}
              </span>
              <span v-else v-download="downloadFile(row)" class="tsfont-download text-href">{{ $t('term.framework.logdownload') }}</span>
            </div>
          </template>
        </TsTable>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '', // 查看密码
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  directives: { download },
  props: {
    tagentId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      tableData: {
        currentPage: 1,
        tbodyList: []
      },
      dialogSetting: {
        type: 'modal',
        isShow: true,
        title: this.$t('page.log'),
        hasFooter: false
      },
      theadList: [
        { key: 'log', title: this.$t('page.filename')},
        { key: 'download', title: this.$t('term.framework.logdownload')}
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchLog();
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
    searchLog() {
      if (this.$utils.isEmpty(this.tagentId)) {
        return false;
      }
      this.$api.framework.tagent.getWorkList({tagentId: this.tagentId})
        .then((res) => {
          if (res.Status == 'OK') {
            this.tableData.tbodyList = res.Return;
          }
        });
    },
    close() {
      this.$emit('close');
    }
  },
  filter: {},
  computed: {
    downloadFile(row) {
      return (row) => {
        let data = {
          path: row.log,
          tagentId: this.tagentId
        };
        return {
          url: '/api/binary/tagent/exec/log/download', 
          params: data, 
          method: 'post', 
          changeStatus: status => {
            if (status == 'start') {
              this.$set(row, 'isDownloadFileLoding', true);
            } else if (status == 'success' || status == 'error') {
              this.$set(row, 'isDownloadFileLoding', false);
            }
          }};
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
.tagent-manage-download-box{
    // 解决下载日志，宽度变化的问题
    display: inline-block;
    width: 100px;
  }
</style>
