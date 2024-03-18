
<template>
  <div class="task-markrepeat">
    <div v-if="actionConfig.markrepeat" class="add-top">
      <span class="tsfont-plus text-href" @click="addItem()">{{ $t('term.process.repeatedevent') }}</span>
    </div>
    <div v-if="list.length >0">
      <div v-for="(item,index) in list" :key="index" class="item-list border-color">
        <div class="item-detail">
          <div class="item-box overflow">
            <span class="text-grey fz10">{{ $t('term.process.tasktitle') }}</span>
            <span class="text-href overflow" :title="item.title" @click="toTaskdetail(item.id)">{{ item.title }}</span>
          </div>
          <div class="item-box overflow">
            <span class="text-grey fz10">
              {{ $t('page.workordernumber') }}
            </span>
            <span class="item-serialNumber overflow">
              <span class="text-href" @click="toTaskdetail(item.id)">{{ item.serialNumber }}</span> 
              <i v-clipboard="item.serialNumber" v-clipboard:success="clipboardSuc" class="tsfont-copy text-action"></i>
            </span>
          </div>
          <div class="item-box overflow">
            <span class="text-grey fz10">
              {{ $t('page.status') }}
            </span>
            <span>{{ item.statusVo.text }}</span>
          </div>
          <div class="del-relation tsfont-unbind bg-block text-action" @click="deleteItem(item)">{{ $t('term.process.unbind') }}</div>
        </div>
      </div>
    </div>
    <TsDialog
      :isShow.sync="showDialog"
      type="slider"
      width="large"
      :title="$t('term.process.repeatedevent')"
      :okBtnDisable="okBtnDisable"
      @on-ok="saveData()"
      @on-close="close()"
    >
      <div class="dialog-box">
        <div class="clearfix search-right">
          <div class="float-right">
            <TsFormInput
              v-model="keyword"
              :placeholder="$t('term.process.tasktitle')"
              search
              clearable
              border="border"
              @on-enter="searchDataList(1)"
              @on-clear="searchDataList(1)"
            ></TsFormInput>
          </div>
        </div>
        <TsTable
          ref="taskTable"
          v-model="selectedlist"
          v-bind="tableData"
          :theadList="theadList"
          keyName="id"
          selectedRemain
          multiple
          :loading="loadingShow"
          :fixedHeader="false"
          @getSelected="updateSelected"
          @changeCurrent="searchDataList"
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
      </div>
    </TsDialog>
    <TsDialog
      :isShow.sync="validDialog"
      width="medium"
      :title="$t('term.process.repeatedevent')"
      :fixedHeader="false"
      @on-ok="saveOk"
    >
      <div class="dialog-box">
        <div class="tip-block">
          <span class="tsfont-danger-o text-primary btn-icon"></span>
          <span>{{ $t('term.process.repeatedeventtip') }}</span>
        </div>
        <TsTable :theadList="showthead(theadList)" :tbodyList="validRepeatList" :fixedHeader="false">
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
      </div>
    </TsDialog>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  directives: {clipboard},
  filters: {
  },
  props: {
    processTaskId: [Number, String],
    repeatList: Array,
    actionConfig: Object
  },
  data() {
    return {
      list: [],
      showDialog: false,
      keyword: '',
      loadingShow: true,
      pageSize: 10,
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
      repeatProcessTaskIdList: [],
      selectedlist: [],
      validRepeatList: [], //校验返回重复事件
      validDialog: false,
      okBtnDisable: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getRepeatList() {
      //重复事件列表
      if (this.processTaskId) {
        let data = {
          needPage: false,
          processTaskId: this.processTaskId
        };
        this.$api.process.processtask.getRepeatList(data).then(res => {
          if (res.Status == 'OK') {
            this.list = res.Return.tbodyList || [];
            if (!this.actionConfig.markrepeat && !this.list.length) {
              this.$emit('closeRepeatTab');
            }
          }
        });
      }
    },
    addItem() {
      this.searchDataList(1);
      this.okBtnDisable = true;
      this.showDialog = true;
    },
    close() {
      this.showDialog = false;
      this.selectedlist = [];
      this.repeatProcessTaskIdList = [];
    },
    deleteItem(item) {
      let _this = this;
      this.$createDialog({
        title: this.$t('page.warning'),
        content: this.$t('dialog.content.unbindconfirm'),
        btnType: 'error',
        'on-ok': function(vnode) {
          let data = {
            processTaskId: item.id
          };
          _this.$api.process.processtask.deleteRepeat(data).then(res => {
            _this.$Message.success(this.$t('message.executesuccess'));
            vnode.isShow = false;
            _this.getRepeatList();
          });
        }
      });
    },
    searchDataList(currentPage) {
      this.loadingShow = true;
      let data = {
        keyword: this.keyword,
        processTaskId: this.processTaskId,
        pageSize: this.pageSize,
        currentPage: currentPage || 1

      };
      this.$api.process.processtask.getForRepeatList(data).then(res => {
        if (res.Status == 'OK') {
          this.tableData = res.Return;
          this.loadingShow = false;
        }
      });
    },
    updateSelected(selectedlist) {
      this.selectedlist = selectedlist;
      this.okBtnDisable = !selectedlist.length;
    },
    changePageSize(pageSize) {
      this.pageSize = pageSize;
      this.searchDataList(1);
    },
    saveData(list) { //保存重复事件：若被勾选的工单，已被标记过为重复工单，需二次弹窗提示
      let data = {
        processTaskId: this.processTaskId,
        repeatProcessTaskIdList: list || this.selectedlist
      };
      this.$api.process.processtask.saveRepeat(data).then(res => {
        if (res.Status == 'OK') {
          this.validRepeatList = res.Return || [];
          if (this.validRepeatList.length > 0) {
            this.validDialog = true;
            this.repeatProcessTaskIdList = this.validRepeatList.map(i => {
              return i.id;
            });
          } else {
            this.showDialog = false;
            this.getRepeatList();
          }
        }
      });
    },
    saveOk() { //被勾选的工单，已被标记过为重复工单，二次弹窗保存
      this.saveData(this.repeatProcessTaskIdList);
      this.validDialog = false;
      this.showDialog = false;
    },
    clipboardSuc() {
      this.$Message.success(this.$t('message.executesuccess'));
    },
    toTaskdetail(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    }
  },
  computed: {
    showthead() {
      return (list) => {
        let newTheadList = list.filter(i => {
          return i.key != 'selection';
        });
        return newTheadList;
      };
    }
  },
  watch: {
    repeatList: {
      handler(val) {
        this.list = val ? this.$utils.deepClone(val) : [];
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less' scoped>
.task-markrepeat {
  padding: 16px;
  overflow-y: auto;
  .item-list{
    position: relative;
    padding: 16px 0;
    &:not(:last-of-type){
      border-bottom:1px solid;
    }
    &:hover {
      .del-relation {
        display: block;
      }
    }
    .del-relation {
      position: absolute;
      right: 16px;
      top: 16px;
      display: none;
    }
    .item-detail{
      display: flex;
      align-items: center;
      .item-box{
        width: 33%;
        padding-right: 10px;
        display: flex;
        align-items: center;
        >.text-grey{
          padding-right: 10px;
        }
        .item-serialNumber{
          position: relative;
          padding-right: 20px;
          i{
            position: absolute;
            right: -2px;
            top: 0;
          }
        }
      }
    }
  }
}
.dialog-box{
  .search-right{
    padding-bottom: 16px;
    .float-right{
      width: 340px;
    }
  }
  .tip-block{
    padding-bottom: 10px;
  }
}
</style>
