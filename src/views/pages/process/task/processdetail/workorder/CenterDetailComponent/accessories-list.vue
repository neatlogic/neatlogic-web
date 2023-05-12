<template>
  <div>
    <TsTable
      v-bind="fileTable"
      :theadList="theadList"
      :height="setContentHeight()"
      @changeCurrent="changeCurrentFlie"
      @changePageSize="changePageSizeFile"
    >
      <template slot="action" slot-scope="{row}">
        <div class="tstable-action">
          <ul class="tstable-action-ul">
            <li
              v-download="downurl(row.id)"
              class="icon tsfont-download"
            >{{ $t('page.download') }}</li>
          </ul>
        </div>
      </template>
    </TsTable>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve)
  },
  directives: {download},
  props: {
    processTaskId: Number,
    contentHeight: [Number, String],
    value: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      theadList: [
        {
          key: 'name',
          title: this.$t('page.attachmentname')
        },
        {
          key: 'fcuVo',
          title: this.$t('page.uploaduser'),
          type: 'user'
        },
        {
          key: 'uploadTime',
          title: this.$t('page.uploadtime'),
          type: 'time'
        },
        {
          key: 'action'
        }
      ],
      fileTable: {}, //所有的附件
      searchParams: {
        processTaskId: this.processTaskId
      } 
    };
  },
  beforeCreate() {},
  created() {
    this.getAllFileList();
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
    getAllFileList() {
      this.$api.process.processtask.getProcesstaskFileList(this.searchParams).then(res => {
        if (res.Status == 'OK') {
          this.fileTable = res.Return;
          this.$emit('update.value', this.fileTable);
        }
      });
    },
    changeCurrentFlie(currentPage) {
      this.searchParams.currentPage = currentPage;
      this.getAllFileList();
    },
    changePageSizeFile(pageSize) {
      this.searchParams.pageSize = pageSize;
      this.searchParams.currentPage = 1;
      this.getAllFileList();
    }
  },
  filter: {},
  computed: {
    downurl() {
      return id => {
        return {
          url: 'api/binary/file/download',
          params: {
            id: id
          }
        };
      };
    },
    setContentHeight() {
      return () => {
        let height = typeof this.contentHeight == 'number' ? this.contentHeight - 32 : this.contentHeight;
        return height;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
