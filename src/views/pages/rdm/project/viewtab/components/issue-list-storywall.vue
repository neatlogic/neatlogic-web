<template>
  <div>
    <div
      v-if="finalStatusList.length > 0"
      ref="divMain"
      :style="{ height: height + 'px', 'user-select': isDragging ? 'none' : 'auto', cursor: isDragging ? 'grabbing' : 'grab' }"
      class="divContainer"
      @mousedown.stop="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @click.stop
    >
      <div
        v-for="(status, index) in finalStatusList"
        :key="index"
        class="divStatus bg-op-linear radius-md"
        :class="{ 'mr-md': index < finalStatusList.length - 1 }"
      >
        <div v-if="draggingStatus && draggingStatus.id != status.id && !allowPutStatus[status.id.toString()]" class="forbidden-mask radius-md padding">
          <h3 class="text-error">{{ $t('term.rdm.forbiddentransfer') }}</h3>
        </div>
        <h3 class="text-grey ml-md mr-md mt-md mr-md">{{ status.label }}</h3>
        <div class="status-item mt-sm padding">
          <draggable
            v-bind="dragOptions"
            tag="div"
            class="dataSource-ul"
            :list="getIssueByStatus(status)"
            :group="{
              name: 'issue-' + status.id,
              pull: true,
              put: () => {
                return allowPut(status);
              }
            }"
            handle=".tsfont-option-vertical"
            :forceFallback="false"
            @start="
              e => {
                moveStart(status, e);
              }
            "
            @end="moveEnd"
            @add="
              e => {
                dropIssue(status, e);
              }
            "
          >
            <div
              v-for="(issue, iindex) in getIssueByStatus(status)"
              :key="issue.id"
              :issueId="issue.id"
              :issue="issue"
              :appId="issue.appId"
              :class="iindex < getIssueByStatus(status).length - 1 ? 'mb-nm' : ''"
              class="cursor click-item radius-sm border-color-base issue-item padding-md bg-grey"
              @mousedown.stop
              @click="openIssueDetail(issue)"
            >
              <div class="overflow">
                <span class="tsfont-option-vertical text-grey" style="cursor: move" @mousedown.stop></span>
                <span><AppIcon :appType="issue.appType" size="small" :appColor="issue.appColor"></AppIcon></span>
                <span
                  class="cursor text-href"
                  @mousedown.stop
                  @click.stop="toIssueDetail(issue)"
                >{{ issue.name }}</span>
              </div>
              <div class="mt-xs mb-xs text-grey fz10">{{ issue.createDate | formatDate('yyyy-mm-dd') }}</div>
              <div class="flex">
                <div class="left"><UserCard v-for="(user, uindex) in issue.userList" :key="uindex" :uuid="user.uuid"></UserCard></div>
                <div class="right">
                  <span :style="{ color: issue.priorityColor }" class="mr-xs">●</span>
                  <span>{{ issue.priorityName }}</span>
                </div>
              </div>
            </div>
          </draggable>
        </div>
      </div>
    </div>
    <div v-if="hasPage" class="pager">
      <Page
        size="small"
        :showTotal="true"
        :total="issueData.rowNum"
        :current="issueData.currentPage"
        :page-size="issueData.pageSize"
        :transfer="true"
        @on-change="searchIssue"
        @on-page-size-change="changePageSize"
      />
    </div>
    <TsDialog
      v-if="isTransferReady && requiredAttrList.length > 0 && draggingIssue"
      v-bind="dialogConfig"
      @on-ok="save"
      @on-close="
        isTransferReady = false;
        requiredAttrList = [];
      "
    >
      <template v-slot>
        <div>
          <TsFormItem
            v-for="(attr, index) in requiredAttrList"
            :key="index"
            class="relative"
            :label="attr.label"
            labelPosition="left"
            :required="true"
            :labelWidth="80"
          >
            <AttrHandler
              ref="attrHandler"
              :projectId="projectId"
              :attrConfig="attr"
              :issueData="draggingIssue"
            ></AttrHandler>
          </TsFormItem>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
import draggable from 'vuedraggable';

export default {
  name: '',
  components: {
    draggable,
    AttrHandler: () => import('@/views/pages/rdm/project/attr-handler/attr-handler.vue'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    AppIcon: () => import('@/views/pages/rdm/project/viewtab/components/app-icon.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue')
  },
  props: {
    projectId: { type: Number },
    app: { type: Object },
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
      height: 0,
      dragOptions: {
        animation: 150,
        scroll: true,
        disabled: false,
        ghostClass: 'ghost'
      },
      dialogConfig: {
        type: 'modal',
        title: '',
        isShow: true
      },
      allowPutStatus: {},
      draggingStatus: null,
      draggingIssue: null,
      statusRel: null,
      isDragging: false,
      oldX: 0,
      requiredAttrList: [],
      isTransferReady: false, //是否可以填写流转表单
      isCalcing: false //是否正在查询关系依赖
    };
  },
  beforeCreate() {},
  created() {
    this.init();
  },
  beforeMount() {},
  mounted() {
    this.initHeight();
    window.addEventListener('resize', this.initHeight);
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.initHeight);
  },
  destroyed() {},
  methods: {
    startDrag(e) {
      this.isDragging = true;
      this.oldX = e.clientX;
    },
    onDrag(e) {
      if (this.isDragging) {
        this.$refs['divMain'].scrollLeft += this.oldX - e.clientX;
        this.oldX = e.clientX;
      }
    },
    endDrag() {
      this.isDragging = false;
    },
    valid() {
      let isValid = true;
      if (this.$refs['attrHandler']) {
        this.$refs['attrHandler'].forEach(handler => {
          if (!handler.valid()) {
            isValid = false;
          }
        });
      }
      return isValid;
    },
    save() {
      if (this.draggingIssue && this.valid()) {
        this.$api.rdm.issue
          .saveIssue(this.draggingIssue)
          .then(async res => {
            if (this.issueData && this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
              for (let i = 0; i < this.issueData.tbodyList.length; i++) {
                if (this.issueData.tbodyList[i].id === this.draggingIssue.id) {
                  this.$set(this.issueData.tbodyList[i], 'status', this.draggingIssue.status);
                  this.$set(this.issueData.tbodyList[i], 'statusName', this.draggingIssue.statusName);
                  this.$set(this.issueData.tbodyList[i], 'statusLabel', this.draggingIssue.statusLabel);
                  this.$set(this.issueData.tbodyList[i], 'statusColor', this.draggingIssue.statusColor);
                }
              }
              this.$Message.success(this.$t('message.updatesuccess'));
            }
          })
          .finally(() => {
            this.draggingIssue = null;
          });
      }
    },
    init() {
      //初始化状态列表，默认全部不可拖入。
      if (this.finalStatusList && this.finalStatusList.length > 0) {
        this.finalStatusList.forEach(s => {
          this.$set(this.allowPutStatus, s.id.toString(), true);
        });
      }
    },
    allowPut(status) {
      return !this.isCalcing && this.allowPutStatus[status.id.toString()];
    },
    moveStart(status, e) {
      this.draggingIssue = this.getIssueById(e.item.attributes.issueId.value);
      this.draggingStatus = status;
      this.isCalcing = true;
      this.isTransferReady = false;
      this.requiredAttrList = [];
      this.$api.rdm.status
        .getStatusByAppId(this.draggingIssue.appId, { status: status.id })
        .then(res => {
          for (let s in this.allowPutStatus) {
            this.$set(this.allowPutStatus, s, false);
          }
          if (res.Return && res.Return.length > 0) {
            res.Return.forEach(status => {
              this.$set(this.allowPutStatus, status.id.toString(), true);
            });
          }
        })
        .finally(() => {
          this.isCalcing = false;
        });
    },
    moveEnd() {
      for (let s in this.allowPutStatus) {
        this.$set(this.allowPutStatus, s, true);
      }
    },
    getIssueById(issueId) {
      if (this.issueData && this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
        for (let i = 0; i < this.issueData.tbodyList.length; i++) {
          //这里的issue是字符串，不能用===
          if (this.issueData.tbodyList[i].id == issueId) {
            return this.$utils.deepClone(this.issueData.tbodyList[i]);
          }
        }
      }
      return null;
    },
    async dropIssue(status) {
      if (status && this.draggingIssue && this.draggingStatus && this.draggingStatus.id != status.id) {
        this.draggingIssue.status = status.id;
        this.draggingIssue.statusName = status.name;
        this.draggingIssue.statusLabel = status.label;
        this.draggingIssue.statusColor = status.color;
        this.dialogConfig.title = this.draggingStatus.label + '->' + status.label;
        let attrList;
        await this.$api.rdm.app.searchAppAttr({ appId: this.draggingIssue.appId, isActive: 1 }).then(res => {
          attrList = res.Return;
        });
        await this.$api.rdm.status
          .getStatusRel({
            appId: this.draggingIssue.appId,
            fromStatusId: this.draggingStatus.id,
            toStatusId: status.id
          })
          .then(res => {
            const statusRel = res.Return;
            if (statusRel && statusRel.config && statusRel.config.requiredAttrList && statusRel.config.requiredAttrList.length > 0 && attrList && attrList.length > 0) {
              attrList.forEach(attr => {
                if (statusRel.config.requiredAttrList.find(ra => ra.attrId === attr.id)) {
                  attr.isRequired = 1;
                  this.requiredAttrList.push(attr);
                }
              });
            }
          })
          .finally(() => {
            this.isTransferReady = true;
          });
      }
      if (this.requiredAttrList.length === 0) {
        this.save();
      }
    },
    openIssueDetail(row) {
      this.$emit('openIssue', row);
    },
    initHeight() {
      const main = this.$refs['divMain'];
      if (main) {
        this.height = window.innerHeight - main.getBoundingClientRect().top - 20;
        if (this.hasPage) {
          this.height = this.height - 40;
        }
      }
    },
    toIssueDetail(row) {
      this.$emit('toIssue', row);
    },
    deleteIssue(row) {
      this.$emit('deleteIssue', row);
    },
    searchIssue(currentPage) {
      this.$emit('searchIssue', currentPage);
    },
    changePageSize(pageSize) {
      this.$emit('changePageSize', pageSize);
    }
  },
  filter: {},
  computed: {
    hasPage() {
      return this.issueData && this.issueData.rowNum > 0;
    },
    finalStatusList() {
      const statusList = [];
      if (this.app && this.app.statusList) {
        if (this.getIssueByStatus({ id: 0 }).length > 0) {
          statusList.push({ id: 0, name: '', label: this.$t('page.nostatus') });
        }
        statusList.push(...this.app.statusList);
      }
      return statusList;
    },
    getIssueByStatus() {
      return status => {
        const issueList = [];
        if (this.issueData && this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
          this.issueData.tbodyList.forEach(issue => {
            if ((issue.id && issue.status === status.id) || !issue.status) {
              issueList.push(issue);
            }
          });
        }
        return issueList;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import '~@/resources/assets/css/variable.less';
html {
  .theme(@default-mongolia);

  &.theme-dark {
    .theme(@dark-mongolia);
  }
}
.flex {
  display: flex;
  justify-content: space-between;
}
.left {
  flex-grow: 1; /* 左边div占用剩余空间 */
}
.right {
  width:auto;
}
.theme(@mongolia-color) {
  .forbidden-mask {
    background: @mongolia-color;
  }
}
.forbidden-mask {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  border: 2px solid red;
  text-align: center;
  z-index: 999;
}
.divContainer {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}
.status-item {
  width: 100%;
  overflow-y: auto;
  height: calc(100% - 40px);
}
.divStatus {
  width: 300px;
  display: inline-block;
  height: 100%;
  position: relative;
}
.issue-item {
  border-width: 1px;
  border-style: solid;
  height: 100px;
  width: 100%;
}
.pager {
  height: 40px;
  line-height: 40px;
  text-align: right;
  grid-column: 1 / -1;
}
</style>
