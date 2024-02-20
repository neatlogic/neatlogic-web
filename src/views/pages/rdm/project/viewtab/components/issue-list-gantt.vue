<template>
  <div ref="tableMain" class="main-grid radius-lg" :style="'height: ' + tableHeight + 'px;width: calc(100vw - ' + tableLeft() + ' - 20px);'">
    <div
      ref="divider"
      class="divider"
      :style="'height: ' + (tableHeight - pageHeight) + 'px'"
      @mousedown="startResize"
    ></div>
    <div
      ref="mainTable"
      class="table-parent table-container"
      :style="resizing || dragging ? 'user-select: none;overflow-x:hidden' : ''"
      @scroll="
        e => {
          scrollTable(e.target.scrollTop);
          calcActionPosition();
        }
      "
    >
      <table v-if="issueData && issueData.tbodyList && issueData.tbodyList.length > 0" class="table">
        <thead class="thead">
          <tr>
            <th :colspan="theadList.length">
              <span :class="{ 'text-href': ganttViewMode === 'Day', cursor: ganttViewMode !== 'Day' }" @click="ganttViewMode = 'Day'">{{ $t('page.da') }}</span>
              <Divider type="vertical" />
              <span :class="{ 'text-href': ganttViewMode === 'Week', cursor: ganttViewMode !== 'Week' }" @click="ganttViewMode = 'Week'">{{ $t('page.wee') }}</span>
              <Divider type="vertical" />
              <span :class="{ 'text-href': ganttViewMode === 'Month', cursor: ganttViewMode !== 'Month' }" @click="ganttViewMode = 'Month'">{{ $t('page.month') }}</span>
            </th>
          </tr>
          <tr>
            <th v-for="(th, index) in theadList" :key="index">{{ th.title }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in issueData.tbodyList" :key="row.id" @mouseover="calcActionPosition()">
            <td v-for="th in theadList" :key="th.key" :class="th.key === 'action' ? 'action-tr' : ''">
              <div v-if="th.key === 'checked'">
                <span v-if="checkedIdList && checkedIdList.includes(row.id)" class="text-success">{{ $t('page.iselected') }}</span>
                <Checkbox
                  v-else
                  :value="!!row._selected"
                  :true-value="true"
                  :false-value="false"
                  @on-change="
                    val => {
                      changeChecked(val, row);
                    }
                  "
                ></Checkbox>
              </div>
              <div v-else-if="getAttr(th.key)">
                <AttrViewer
                  v-if="getAttr(th.key).id != 0"
                  :scale="0.8"
                  :attrConfig="getAttr(th.key)"
                  :issueData="row"
                ></AttrViewer>
                <div v-else-if="getAttr(th.key).type === '_name'" :style="{ 'margin-left': (row['_index'] || 0) * 20 + 'px' }">
                  <span><AppIcon :appType="row.appType" :appColor="row.appColor"></AppIcon></span>
                  <span
                    v-if="mode === 'level' && row.childrenCount"
                    class="cursor text-href"
                    :class="{ 'tsfont-down': row['_expand'], 'tsfont-right': !row['_expand'] }"
                    @click="toggleChildIssue(row)"
                  ></span>
                  <span class="overflow">
                    <a href="javascript:void(0)" @click="openIssueDetail(row)">{{ row.name }}</a>
                  </span>
                </div>
                <IssueStatus v-else-if="getAttr(th.key).type === '_status'" :scale="0.8" :issueData="row"></IssueStatus>
                <span v-else-if="getAttr(th.key).type === '_createuser'"><UserCard v-if="row.createUser" :iconSize="20" :uuid="row.createUser"></UserCard></span>
                <span v-else-if="getAttr(th.key).type === '_createdate'">{{ row.createDate | formatDate('yyyy-mm-dd') }}</span>
              </div>
              <div v-else-if="th.key === 'action' && canAction" class="action-div">
                <div class="tstable-action">
                  <ul class="tstable-action-ul" :style="{ right: actionRight + 'px' }">
                    <li v-if="!hideActionMap[row.id.toString()] && (fromId || toId || parentId || row.parentId)" class="tsfont-unbind" @click="unlinkIssue(row)">{{ $t('term.rdm.disconnect') }}</li>
                    <li v-if="!hideActionMap[row.id.toString()]" class="tsfont-inspection" @click="toIssueDetail(row)">{{ $t('page.detail') }}</li>
                    <li v-if="!hideActionMap[row.id.toString()] && (row.isProjectOwner || row.isProjectMember || row.isProjectLeader)" class="tsfont-trash-o" @click="deleteIssue(row)">{{ $t('page.delete') }}</li>
                    <li
                      class="text-href"
                      :class="{ 'tsfont-right': !hideActionMap[row.id.toString()], 'tsfont-left': hideActionMap[row.id.toString()] }"
                      style="padding-right: 0px"
                      @click="toggleActionHide(row.id.toString())"
                    ></li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!--<NoData v-else-if="isShowEmptyTable"></NoData>-->
      <div ref="flag"><!--此div用于判断内容出现滚动条，不要删除--></div>
    </div>
    <div id="gantt" class="gantt-parent" :style="resizing || dragging ? 'user-select: none;' : ''"></div>
    <div v-if="hasPage" class="pager bg-op">
      <Page
        size="small"
        :showSizer="true"
        :showTotal="true"
        :total="issueData.rowNum"
        :current="issueData.currentPage"
        :page-size="issueData.pageSize"
        :page-size-opts="[10, 20, 30, 40]"
        :transfer="true"
        @on-change="searchIssue"
        @on-page-size-change="changePageSize"
      />
    </div>
    <IssueTimeEditDialog v-if="isIssueTimeShow && currentIssue" :issueData="currentIssue" @close="closeIssueTimeEdit"></IssueTimeEditDialog>
  </div>
</template>
<script>
import Gantt from '@/resources/plugins/TsGantt/gantt.js';
import '@/resources/assets/font/tsfonts/tsfont.js';
import '@/resources/assets/font/tsIconfont.js';
export default {
  name: '',
  components: {
    AppIcon: resolve => require(['@/views/pages/rdm/project/viewtab/components/app-icon.vue'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    IssueTimeEditDialog: resolve => require(['@/views/pages/rdm/project/viewtab/components/issuetime-edit-dialog.vue'], resolve)
  },
  props: {
    issueData: { type: Object },
    theadList: { type: Array },
    attrList: { type: Array },
    mode: { type: String },
    checkedIdList: { type: Array },
    canAction: { type: Boolean, default: false },
    parentId: { type: Number }, //父任务id，传入parentId代表这里显示的是子任务
    fromId: { type: Number }, //来源任务id
    toId: { type: Number } //目标任务id
  },
  data() {
    return {
      hideActionMap: {},
      pageHeight: 40, //分页高度
      tableHeight: 0,
      dividerLeft: 500,
      gantt: null,
      ganttViewMode: 'Day',
      actionRight: 0,
      resizing: false,
      isIssueTimeShow: false,
      currentIssue: null,
      dragging: false //甘特图是否拖拽中
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.initTableSize);
    window.addEventListener('mousemove', this.doResize);
    window.addEventListener('mouseup', this.stopResize);
  },
  beforeMount() {},
  mounted() {
    this.initGantt();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initTableSize);
    window.removeEventListener('mousemove', this.doResize);
    window.removeEventListener('mouseup', this.stopResize);
  },
  destroyed() {},
  methods: {
    toggleChildIssue(row) {
      this.$emit('toggleChildIssue', row);
    },
    changeChecked(isSelected, issue) {
      this.$set(issue, '_selected', isSelected);
      this.$emit('selected', this.getSelectedIssueList());
    },
    toIssueDetail(row) {
      this.$emit('toIssue', row);
    },
    deleteIssue(row) {
      this.$emit('deleteIssue', row);
    },
    openIssueDetail(row) {
      this.$emit('openIssue', row);
    },
    searchIssue(currentPage) {
      this.$emit('searchIssue', currentPage);
    },
    changePageSize(pageSize) {
      this.$emit('changePageSize', pageSize);
    },
    //计算表格操作按钮位置
    calcActionPosition() {
      const main = this.$refs['mainTable'];
      if (main) {
        this.actionRight = main.scrollWidth - main.offsetWidth - main.scrollLeft - 20;
        //20是td的宽度，因为是基于td的坐标
      }
    },
    tableLeft() {
      const main = this.$refs['tableMain'];
      if (main) {
        return main.getBoundingClientRect().left;
      }
      return 0;
    },
    toggleActionHide(id) {
      if (this.hideActionMap[id]) {
        this.$delete(this.hideActionMap, id);
      } else {
        this.$set(this.hideActionMap, id, true);
      }
    },
    startResize(e) {
      this.resizing = true;
      this.startX = e.clientX;
      this.oldLeft = this.dividerLeft;
    },
    doResize(e) {
      if (!this.resizing) return;
      const width = this.$refs['tableMain'].offsetWidth;
      let left = e.clientX - this.$refs['tableMain'].getBoundingClientRect().left;
      left = Math.max(200, left);
      left = Math.min(width - 200, left);
      this.$refs['divider'].style.left = left + 'px';
    },
    stopResize() {
      if (this.resizing) {
        if (window.getSelection) {
          if (window.getSelection().empty) {
            // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
          }
        } else if (document.selection) {
          // IE?
          document.selection.empty();
        }
        this.resizing = false;
        this.initTableSize();
      }
    },
    initGantt() {
      if (!this.gantt) {
        this.gantt = new Gantt('#gantt', this.ganttTaskList, {
          need_progress_handler: false,
          header_height: 50,
          column_width: 30,
          step: 24,
          view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
          bar_height: 22,
          bar_corner_radius: 3,
          arrow_curve: 5,
          padding: 18,
          view_mode: 'Day',
          date_format: 'YYYY-MM-DD',
          language: 'zh', // or 'es', 'it', 'ru', 'ptBr', 'fr', 'tr', 'zh', 'de', 'hu'
          custom_popup_html: null,
          on_scroll: t => {
            this.$refs['mainTable'].scrollTop = t;
          },
          on_date_change: this.ganttDateChange,
          on_progress_change: this.ganttProgressChange,
          on_add_task: this.ganttTaskAdd,
          on_drag_start: () => {
            this.dragging = true;
          },
          on_drag_end: () => {
            this.dragging = false;
          }
        });
      } else {
        this.gantt.refresh(this.ganttTaskList);
      }
      this.initTableSize();
    },
    ganttDateChange(task) {
      if (this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
        const issue = this.issueData.tbodyList.find(d => d.id === parseInt(task.id));
        if (issue) {
          this.$set(issue, 'startDate', this.$utils.getDateByFormat(task._start, 'yyyy-MM-dd'));
          this.$set(issue, 'endDate', this.$utils.getDateByFormat(task._end, 'yyyy-MM-dd'));
          this.$api.rdm.issue.saveIssue(issue).then(res => {
            if (res.Status == 'OK') {
              this.$Message.success(this.$t('message.savesuccess'));
            }
          });
        }
      }
    },
    ganttProgressChange(task) {},
    ganttTaskAdd(task) {
      this.isIssueTimeShow = true;
      const currentIssueId = parseInt(task.id, 10);
      this.currentIssue = this.issueData.tbodyList.find(d => d.id === currentIssueId);
    },
    closeIssueTimeEdit(needRefresh) {
      this.isIssueTimeShow = false;
      this.currentIssue = null;
      if (needRefresh) {
        this.searchIssue();
      }
    },
    initTableSize() {
      //确保页面渲染完毕，加上nextTick
      const offset = 6;
      this.$nextTick(() => {
        const main = this.$refs['tableMain'];
        const divider = this.$refs['divider'];
        const flag = this.$refs['flag'];
        const height = Math.min(flag.getBoundingClientRect().bottom + this.pageHeight + offset, window.innerHeight - 20) - main.getBoundingClientRect().top;
        let ganttHeight = height - this.pageHeight;
        this.tableHeight = height;
        const dividerLeft = divider.getBoundingClientRect().left - main.getBoundingClientRect().left;
        main.style.gridTemplateColumns = `${dividerLeft}px ${main.offsetWidth - dividerLeft}px`;
        if (this.gantt) {
          this.gantt.setHeight(ganttHeight); //减去底部分页
          this.gantt.setWidth(main.offsetWidth - dividerLeft);
        }
        this.calcActionPosition();
      });
    },
    getAttr(key) {
      for (let i = 0; i < this.attrList.length; i++) {
        const attr = this.attrList[i];
        if (attr.id && attr.id.toString() === key) {
          return attr;
        } else if (attr.type === key) {
          return attr;
        }
      }
      return null;
    },
    scrollTable(scrollTop) {
      this.gantt.setScrollTop(scrollTop);
    },
    unlinkIssue(row) {
      this.$emit('unlinkIssue', row);
    }
  },
  filter: {},
  computed: {
    hasPage() {
      return this.issueData && this.issueData.rowNum > 0;
    },
    ganttTaskList() {
      const tasks = [];
      if (this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
        this.issueData.tbodyList.forEach(t => {
          let progress = 0;
          if (t.timecost && t.costList && t.costList.length > 0) {
            let sum = 0;
            t.costList.forEach(c => {
              sum += c.timecost;
            });
            progress = Math.min((sum / t.timecost) * 100, 100);
          }

          tasks.push({
            id: t.id.toString(),
            name: t.name,
            start: t.startDate || t.createDate,
            end: t.endDate,
            progress: progress
          });
        });
      }
      return tasks;
    }
  },
  watch: {
    ganttViewMode(val) {
      if (this.gantt) {
        this.gantt.change_view_mode(val);
      }
    },
    ganttTaskList: {
      handler: function(val) {
        this.initGantt();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@td-bg-color,@th-bg-color,@border-color,@spliter-color,@title-color,@td-bg-hover-color) {
  .divider {
    background-color: darken(@th-bg-color, 5);
  }
  .divider:hover {
    background-color: @spliter-color;
  }
  .table th,
  td {
    white-space: nowrap;
  }
  .table {
    border-collapse: collapse;
    width: 100%;
  }
  .table th {
    color: @title-color;
    font-size: 12px;
    font-weight: normal;
    padding: 0px 9px;
    height: 29px;
    line-height: 29px;
  }
  .table td {
    position: relative;
    padding: 9px;
    height: 40px;
    border-bottom: 1px solid @border-color;
  }
  .table tr:hover td {
    background: @td-bg-hover-color;
  }
  .table tbody {
    background: @td-bg-color;
  }
  .thead {
    position: sticky;
    top: 0;
    height: 60px;
    background: @th-bg-color;
    z-index: 999;
  }
  .tstable-action-ul {
    background: @td-bg-hover-color;
  }
}

html {
  .theme(@default-blockbg,
  @default-th-bg-color,
  @default-background,
  @default-primary-color,
  @default-title,
  @default-table-stripe-color);
  &.theme-dark {
    .theme(@dark-blockbg,
    @dark-th-bg-color,
    @dark-background,
    @dark-primary-color,
    @dark-title,
    @dark-table-stripe-color);
  }
}
.main-grid {
  display: grid;
  overflow: hidden;
  position: relative;
  grid-template-columns: 1fr 1fr;
  .divider {
    width: 3px;
    border-radius: 2px;
    cursor: ew-resize;
    position: absolute;
    left: 50%;
    top: 0;
    z-index: 9999;
  }
}
.table-parent {
  overflow: hidden;
}
.table-parent:hover {
  overflow: auto;
}
.pager {
  height: 40px;
  line-height: 40px;
  text-align: right;
  grid-column: 1 / -1;
}
</style>
