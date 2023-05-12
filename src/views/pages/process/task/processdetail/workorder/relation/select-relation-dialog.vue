<template>
  <div>
    <TsDialog
      type="modal"
      :isShow.sync="relatedTaskModal"
      :title="$t('term.process.reltask')"
      width="medium"
      height="500px"
      @on-ok="relatedTaskOk"
      @on-close="close"
    >
      <template>
        <div class="related-task">
          <loading :loadingShow="loadingShow" type="fix"></loading>
          <div class="search-box">
            <div v-if="relarelationSelectList.length > 0">
              <div
                v-for="(item,index) in preRelarelationList"
                :key="index"
                class="overflow select-style"
                :class="channelTypeRelationId == item.value?'border-primary active text-primary':'border-color'"
                :title="item.text"
                @click="changeRelationId(item)"
              >
                {{ item.text }}
              </div>
              <div v-if="moreRelarelationList && moreRelarelationList.length > 0" class="overflow select-style more-btn border-color" :class="channelTypeRelationId == moreSelectValue?'border-primary active':'border-color'">
                <Dropdown transfer trigger="click">
                  <span>
                    {{ moreSelectText }}
                    <i class="tsfont-down"></i>
                  </span>
                  <DropdownMenu slot="list">
                    <DropdownItem v-for="(m,mindex) in moreRelarelationList" :key="mindex" @click.native="changeMoreRelarelation(m)">{{ m.text }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div class="search-right input-border">
              <TsFormInput
                v-model="keyword"
                search
                clearable
                @on-enter="searchTask(1)"
                @on-clear="searchTask(1)"
              ></TsFormInput>
            </div>
          </div>
          <div class="related-main">
            <TsTable
              ref="taskTable"
              v-model="relationProcessTaskIdList"
              v-bind="tableData"
              :theadList="theadList"
              keyName="id"
              selectedRemain
              height="330px"
              multiple
              :noDataText="noDataText"
              @getSelected="updateSelected"
              @changeCurrent="getPageData"
              @changePageSize="changePageSize"
            >
              <template slot="ownerName" slot-scope="{ row }">
                <UserCard v-bind="row.ownerVo" hideAvatar></UserCard>
              </template>
              <template slot="startTime" slot-scope="{ row }">
                {{ row.startTime | formatDate }}
              </template>
              <template slot="statusVo" slot-scope="{ row }">
                {{ row.statusVo.text }}
              </template>
            </TsTable>
            <div v-if="relationProcessTaskIdList.length > 0" class="number-box" :class="tableData.pageCount && tableData.pageCount > 1?'select-number':''">
              <div v-html="$t('term.process.selecteditemsnum',{target:relationProcessTaskIdList.length})"></div>
            </div>
          </div>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    processTaskId: {
      type: [String, Number],
      default: null
    },
    channelUuid: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      relatedTaskModal: false,
      keyword: null,
      channelTypeRelationId: null, //选中的关联关系
      relarelationSelectList: [],
      preRelarelationList: [], //可见关系
      moreRelarelationList: [], //下拉更多关系
      moreSelectValue: null,
      moreSelectText: this.$t('page.more'),
      pageSize: 20,
      theadList: [
        {
          key: 'selection'
        },
        {
          title: this.$t('page.title'),
          key: 'title'
        },
        {
          title: this.$t('page.workordernumber'),
          key: 'serialNumber'
        },
        {
          title: this.$t('page.informant'),
          key: 'ownerName'
        },
        {
          title: this.$t('page.reportingtime'),
          key: 'startTime'
        },
        {
          title: this.$t('page.status'),
          key: 'statusVo'
        }
      ],
      tableData: {},
      relationProcessTaskIdList: [], //选择被关联的工单列表
      relatedKeyword: null, //关联工单过滤条件
      noDataText: this.$t('term.process.selectrelationdialogtip')
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    if (this.channelUuid) {
      this.getRelarelationList(this.channelUuid);
    }
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getRelarelationList(id) {
      //获取关系
      let data = {
        sourceChannelUuid: id,
        isActive: 1,
        processTaskId: this.processTaskId
      };
      this.$api.process.relation.relarelationSelect(data).then(res => {
        if (res.Status == 'OK') {
          let relarelationSelectList = res.Return.list;
          this.relarelationSelectList = relarelationSelectList;
          if (relarelationSelectList.length > 0) {
            this.channelTypeRelationId = relarelationSelectList[0].value;
            this.searchTask(1);
          }
          if (relarelationSelectList.length > 3) {
            this.preRelarelationList = relarelationSelectList.slice(0, 3);
            this.moreRelarelationList = relarelationSelectList.slice(3);
          } else {
            this.preRelarelationList = relarelationSelectList;
          }
        }
      });
    },
    searchTask(currentPage) {
      //搜索可关联的工单
      this.loadingShow = true;
      let data = {
        currentPage: currentPage,
        pageSize: this.pageSize,
        // channelUuid: this.channelUuid,
        //linbq 工单不应重复关联
        processTaskId: this.processTaskId,
        keyword: this.keyword,
        channelTypeRelationId: this.channelTypeRelationId
      };
      this.$api.process.relation.searchTaskList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.loadingShow = false;
        }
      });
    },
    getPageData(currentPage) {
      this.searchTask(currentPage);
    },
    changePageSize(size) {
      this.pageSize = size;
      this.searchTask();
    },
    changeRelationId(obj) {
      this.channelTypeRelationId = obj.value;
      this.moreSelectText = this.$t('page.more');
      this.moreSelectValue = null;
      this.updateTable();
    },
    changeMoreRelarelation(obj) {
      //选择更多关系
      if (obj) {
        this.moreSelectText = obj.text;
        this.moreSelectValue = obj.value;
        this.channelTypeRelationId = obj.value;
        this.updateTable();
      }
    },
    updateTable() {
      this.keyword = null;
      this.relationProcessTaskIdList.splice(0);
      if (this.$refs.taskTable) {
        this.$refs.taskTable.clearSelected();
      }
      this.searchTask(1);
    },
    updateSelected(selectedlist, allSelectList) {
      this.relationProcessTaskIdList = allSelectList.map(e => {
        return e.id;
      });
    },
    relatedTaskOk() {
      //确认关联
      let data = {
        processTaskId: this.processTaskId,
        channelTypeRelationId: this.channelTypeRelationId,
        relationProcessTaskIdList: this.relationProcessTaskIdList
      };
      this.$api.process.relation.saveTaskRelation(data).then(res => {
        if (res.Status == 'OK') {
          this.relatedTaskModal = false;
          this.$emit('updateRelation');
        }
      });
    },
    close(needRefresh) {
      this.relatedTaskModal = needRefresh;
      this.$emit('close');
    }
  },
  computed: {},
  watch: {
    isShow: {
      handler(val) {
        if (val) {
          this.relatedTaskModal = val;
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.related-task {
  .search-box {
    padding-bottom: 16px;
    position: relative;
  }
  .search-right {
    display: inline-block;
    width: 240px;
    position: absolute;
    right: 0;
    top: 0;
  }
  .select-style {
    position: relative;
    width: 100px;
    display: inline-block;
    text-align: center;
    height: 32px;
    line-height: 32px;
    border: 1px solid;
    border-left: 0;
    padding: 0 8px;
    cursor: pointer;
    &.active {
      &::before {
        content: '';
        display: block;
        position: absolute;
        width: 1px;
        height: 32px;
        left: 0;
        top: 0;
        background: @primary-color;
      }
    }
    &:first-child {
      border-left: 1px solid;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      &.active {
        &::before {
          left: -1px;
        }
      }
    }
    &:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    &.more-btn {
      position: relative;
      border-left: 0;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      > i {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
  .related-main {
    position: relative;
    .number-box {
      padding: 10px 0 0 10px;
    }
    .select-number {
      position: absolute;
      bottom: 10px;
      left: 0;
    }
  }
}
</style>
