<template>
  <div class="operate-manage">
    <TsContain>
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="addRow()">{{ $t('term.autoexec.operationlevel') }}</span>
      </template>
      <template v-slot:topRight>
        <div>
          <InputSearcher
            v-model="keyword"
            @change="getTableDataSearch(1)"
          ></InputSearcher>
        </div>
      </template>
      <template v-slot:content>
        <TsTable
          :theadList="theadList"
          v-bind="tableData"
          canDrag
          @changeCurrent="getTableDataSearch"
          @changePageSize="getTableDataSearch(1, ...arguments)"
          @updateRowSort="handleDragUpdate"
        >
          <template slot="name" slot-scope="{ row }">
            <div :style="{ color: row.color ? row.color : '' }">{{ row.name }}</div>
          </template>
          <template slot="color" slot-scope="{ row }">
            <div class="priority-color">
              <div class="color-block radius-sm" :style="{ backgroundColor: row.color }"></div>
            </div>
          </template>
          <template slot="isActive" slot-scope="{ row }">
            <span v-if="row.isActive" class="text-success">{{ $t('page.yes') }}</span>
            <span v-else-if="!row.isActive" class="text-grey">{{ $t('page.no') }}</span>
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="tsfont-edit icon" @click="editRow(row)">{{ $t('page.edit') }}</li>
                <li class="tsfont-trash-o icon" @click="deleteRow(row)">{{ $t('page.delete') }}</li>
              </ul>
            </div>
          </template>
        </TsTable>
      </template>
    </TsContain>
    <OperateAdd
      v-if="isDialogShow"
      :id="id"
      :data="selectData"
      @close="closeDialog"
    ></OperateAdd>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    InputSearcher: resolve => require(['@/resources/components/InputSearcher/InputSearcher.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    OperateAdd: resolve => require(['./operate-add'], resolve)
  },
  filters: {},
  props: {},
  data() {
    return {
      isDialogShow: false,
      theadList: [
        { title: this.$t('page.name'), key: 'name', minWidth: 300, resizable: true },
        { title: this.$t('page.color'), key: 'color', minWidth: 300, resizable: true },
        { title: this.$t('page.enable'), key: 'isActive', minWidth: 300, resizable: true },
        { title: this.$t('page.description'), key: 'description', minWidth: 300, resizable: true },
        { title: ' ', key: 'action', align: 'right', width: 10 }
      ],
      tableData: {
        tbodyList: [],
        rowNum: 0,
        pageSize: 20,
        currentPage: 1
      },
      searchConfig: {
        placeholder: this.$t('form.placeholder.pleaseinput', {target: this.$t('term.autoexec.operationlevel')})
      },
      
      keyword: '',
      searchParam: {
        keyword: null,
        isActive: null,
        currentPage: 1,
        pageSize: 20
      },
      
      deleting: false,
      oldList: [],
      id: null,
      selectData: null
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getTableDataSearch(1);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTableDataSearch(currentPage, pageSize) {
      let _this = this;
      if (currentPage) {
        _this.searchParam.currentPage = currentPage;
      }
      if (pageSize) {
        _this.searchParam.pageSize = pageSize;
      } else {
        _this.searchParam.pageSize = this.pageSize;
      }
      let data = {
        keyword: this.keyword,
        currentPage: currentPage || this.tableData.currentPage,
        pageSize: pageSize || this.tableData.pageSize
      };
      _this.$api.autoexec.operate
        .searchOperateList(data)
        .then(res => {
          if (res.Status == 'OK') {
            _this.tableData = res.Return;
            _this.tableData.theadList = _this.theadList;
            _this.oldList = res.Return.tbodyList;
            this.loadingShow = false;
            this.tableData = Object.assign(this.tableData, res.Return);
          }
        });
    },
    // 改变页数
    changePageSize(size) {
      this.pageSize = size;
      this.getTableDataSearch();
    },
    getPageData(currentPage) {
      this.getTableDataSearch(currentPage);
    },
    addRow() {
      this.id = null;
      this.isDialogShow = true;
    },  
    closeDialog(needFresh) {
      this.isDialogShow = false;
      if (needFresh) {
        this.getTableDataSearch(1);
      }
    },
    editRow(row) {
      this.isDialogShow = true;
      this.id = row.id;
      this.selectData = row;
    },
    deleteRow(row) {
      this.$createDialog({
        title: this.$t('dialog.title.deleteconfirm'),
        content: this.$t('dialog.content.deleteconfirm', {target: row.name}),
        btnType: 'error',
        'on-ok': vnode => {
          if (!this.deleting) {
            let params = { id: row.id };
            this.deleting = true;
            this.$api.autoexec.operate
              .deleteOperate(params)
              .then(res => {
                this.deleting = false;
                if (res.Status == 'OK') {
                  this.$Message.success(this.$t('message.deletesuccess'));
                  this.getTableDataSearch(1);
                  vnode.isShow = false;
                }
              })
              .catch(error => {
                this.deleting = false;
              });
          }
        }
      });
    },
    handleDragUpdate({ oldIndex, newIndex }) {
      const params = {
        id: this.oldList[oldIndex].id, //被拖拽的优先级的id
        sort: this.oldList[newIndex].sort //被挤走的优先级的sort
      };
      this.$api.autoexec.operate
        .moveOperate(params)
        .then(res => {
          if (res.Status === 'OK') {
            this.$Message.success(this.$t('message.savesuccess'));
          } else throw res;
        })
        .finally(() => {
          this.getTableDataSearch(1);
        });
    }
    
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less">
.priority-color {
  /deep/ .ivu-poptip-arrow {
    display: none;
  }
  /deep/ .ivu-poptip-inner {
    transform: translateY(-8px);
  }
  .color-block {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .color-selected {
    cursor: pointer;
    .color-block {
      display: inline-block;
      margin-right: 4px;
    }
    .ts-angle-down {
      transition: transform 0.25s ease-out;
      &.arrow-rotate {
        transform: rotate(-180deg);
      }
    }
  }
  .color-block-list {
    box-sizing: border-box;
    width: 152px;
    height: 120px;
    padding: 8px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: space-between;
    .color-block-item {
      margin: 4px;
      &.tsfont-check {
        font-size: 24px;
        text-align: center;
        line-height: 24px;
        &::before {
          text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
        }
      }
    }
  }
}
</style>
