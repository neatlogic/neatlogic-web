<template>
  <div class="integration-audit-box">
    <TsDialog
      v-if="actionLogData"
      :is-show="isShow"
      v-bind="dialogConfig"
      @on-close="close"
    >
      <template v-slot>
        <div
          ref="tableMain"
        >
          <TsTable
            v-if="actionLogData"
            v-bind="actionLogData"
            :height="tableHeight"
            @changeCurrent="searchActionLog"
            @changePageSize="pageSize => searchActionLog(1, pageSize)"
          >
            <template slot="mrUuid" slot-scope="{ row }">
              <a href="javascript:;" @click="goDetail(row.mrUuid)">{{ row.mrUuid }}</a>
            </template>
            <template slot="triggerTime" slot-scope="{ row }">
              {{ row.triggerTime |formatDate }}
            </template>
            <template slot="inputArgument" slot-scope="{ row }">
              <a v-if="row.inputArgument" href="javascript:;" @click="showArgument(row.inputArgument)">查看</a>
              <span v-if="!row.inputArgument">-</span>
            </template>
            <template slot="outputArgument" slot-scope="{ row }">
              <a v-if="row.outputArgument" href="javascript:;" @click="showArgument(row.outputArgument)">查看</a>
              <span v-if="!row.outputArgument">-</span>
            </template>
            <template slot="result" slot-scope="{ row }">
              <span v-if="row.result=='succeed'" class="text-success">{{ statusData[row.result] }}</span>
              <span v-if="row.result=='failed'" class="text-error">{{ statusData[row.result] }}</span>
            </template>
          </TsTable>
        </div>
      </template>
      <template v-slot:footer>
        <Button @click="close()">取消</Button>
      </template>
    </TsDialog>
    <ArgumentDetail :argument="argument" @close="closeArgumentDetailDialog"></ArgumentDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    ArgumentDetail: resolve => require(['./argument-detail.vue'], resolve)
  },
  props: {
    uuid: {type: Number}
  },
  data() {
    return {
      isShow: false,
      argument: null,
      detailData: {},
      actionLogData: {},
      contentHeight: '100',
      statusData: {'succeed': '成功', 'failed': '失败'},
      dialogConfig: {
        type: 'slider',
        maskClose: true,
        isShow: false,
        title: '触发记录',
        width: '1000px',
        isScrollbar: true
      },
      theadList: [
        {
          title: '原始mr',
          key: 'mrUuid'
        },
        {
          title: '动作触发时间',
          key: 'triggerTime'
        },
        {
          title: '输入参数',
          key: 'inputArgument'
        },
        {
          title: '输出参数',
          key: 'outputArgument'
        },
        {
          title: '动作执行结果',
          key: 'result'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.searchActionLog();
    let _this = this;
    window.addEventListener('resize', _this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    let _this = this;
    window.removeEventListener('resize', _this.initHeight);
  },
  destroyed() {},
  methods: {
    handleChange() {
      // 搜索条件下拉
      this.searchActionLog(1);
    },

    searchActionLog: function(currentPage, pageSize) {
      let params = {actionId: this.uuid};
      if (currentPage) {
        params['currentPage'] = currentPage;
      }
      if (pageSize) {
        params['pageSize'] = pageSize;
      } else {
        params['pageSize'] = this.actionLogData.pageSize || 10;
      }
      this.$api.codehub.merge.searchActionLog(params).then(res => {
        if (res.Status == 'OK') {
          this.actionLogData = res.Return;
          this.actionLogData.theadList = this.theadList;
          this.actionLogData.tbodyList = res.Return.list;
          this.isShow = true;
          this.initHeight();
        }
      });
    },

    goDetail(val) {
      this.$router.push({ path: 'merge-review', query: {uuid: val} });
    },

    close: function() {
      this.isShow = false;
      this.$emit('close');
    },
    showArgument: function(val) {
      this.isArgumentShow = true;
      this.argument = val;
    },
    closeArgumentDetailDialog: function() {
      this.isArgumentShow = false;
      this.argument = null;
    },
    initHeight() {
      this.$nextTick(() => {
        this.contentHeight = window.innerHeight - (this.$refs.tableMain ? this.$refs.tableMain.getBoundingClientRect().top : 0);
      });
    }
  },
  filter: {},
  computed: {
    tableHeight() {
      // 57 底部取消按钮高度，24padding的高度，38表格表头高度，44分页高度
      let height = this.contentHeight - 57 - 24 - 38 - 44;
      return height + 'px';
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
