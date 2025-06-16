<template>
  <TsTable
    v-if="issueData && issueData.tbodyList && issueData.tbodyList.length > 0"
    ref="mainTable"
    :theadList="theadList"
    v-bind="issueData"
    :sortOrder="sortData"
    :sortList="sortList"
    :fixedHeader="fixedHeader"
    multiple
    @changeCurrent="searchIssue"
    @changePageSize="changePageSize"
    @getSelected="getSelected"
    @updateSort="updateSort"
  >
    <template v-slot:checked="{ row }">
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
    </template>
    <template v-for="(attr, index) in attrList" :slot="attr.id ? attr.id.toString() : attr.type" slot-scope="{ row }">
      <div :key="index">
        <AttrViewer
          v-if="attr.id != 0"
          :scale="0.8"
          :attrConfig="attr"
          :issueData="row"
        ></AttrViewer>
        <div v-else-if="attr.type === '_name'" :style="{ 'margin-left': (row['_index'] || 0) * 20 + 'px' }">
          <span><AppIcon :appType="row.appType" :appColor="row.appColor"></AppIcon></span>
          <span
            v-if="mode === 'level' && row.childrenCount"
            class="cursor text-href"
            :class="{ 'tsfont-drop-down': row['_expand'], 'tsfont-drop-right': !row['_expand'] }"
            @click="toggleChildIssue(row)"
          ></span>
          <span class="overflow">
            <a href="javascript:void(0)" @click="openIssueDetail(row)">
              <span v-if="!issueData.wordList || issueData.wordList === 0">{{ row.name }}</span>
              <span v-else v-html="highlightKeywords(row.name, issueData.wordList)"></span>
            </a>
          </span>
        </div>
        <IssueStatus v-else-if="attr.type === '_status'" :scale="0.8" :issueData="row"></IssueStatus>
        <span v-else-if="attr.type === '_createuser'"><UserCard v-if="row.createUser" :iconSize="20" :uuid="row.createUser"></UserCard></span>
        <span v-else-if="attr.type === '_createdate'">{{ row.createDate | formatDate('yyyy-mm-dd') }}</span>
      </div>
    </template>
    <template v-if="canAction" slot="action" slot-scope="{ row }">
      <div class="tstable-action">
        <ul class="tstable-action-ul">
          <li v-if="fromId || toId || parentId || row.parentId" class="tsfont-unbind" @click="unlinkIssue(row)">{{ $t('term.rdm.disconnect') }}</li>
          <li class="tsfont-inspection" @click="toIssueDetail(row)">{{ $t('page.detail') }}</li>
          <li v-if="row.isProjectOwner || row.isProjectMember || row.isProjectLeader" class="tsfont-trash-o" @click="deleteIssue(row)">{{ $t('page.delete') }}</li>
        </ul>
      </div>
    </template>
  </TsTable>
</template>
<script>
export default {
  name: '',
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    AppIcon: () => import('@/views/pages/rdm/project/viewtab/components/app-icon.vue'),
    AttrViewer: () => import('@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    IssueStatus: () => import('@/views/pages/rdm/project/viewtab/components/issue-status.vue')
  },
  props: {
    issueData: { type: Object },
    sortData: { type: Array },
    theadList: { type: Array },
    attrList: { type: Array },
    sortList: { type: Array },
    mode: { type: String },
    checkedIdList: { type: Array },
    canAction: { type: Boolean, default: false },
    parentId: { type: Number }, //父任务id，传入parentId代表这里显示的是子任务
    fromId: { type: Number }, //来源任务id
    toId: { type: Number }, //目标任务id
    fixedHeader: {
      // 固定表头，默认true
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
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
    newWindowOpen(row) {
      const { appType = '', projectId = null, appId = null, id = null} = row || {};
      const path = `${appType}-detail/${projectId}/${appId}/${id}`;
      window.open(HOME + '/rdm.html#/' + path, '_blank');
    },
    highlightKeywords(text, wordList) {
      if (!wordList || wordList.length === 0) return text;
      const escapedWords = wordList.map(word => this.escapeRegExp(word));
      const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi'); // 匹配关键字，忽略大小写
      return text.replace(regex, '<span class="highlight text-error">$1</span>'); // 使用span加上高亮样式
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义正则特殊字符
    },
    updateSort(sort) {
      this.$emit('updateSort', sort);
    },
    getSelectedIssueList() {
      const itemList = [];
      if (this.issueData.tbodyList && this.issueData.tbodyList.length > 0) {
        this.issueData.tbodyList.forEach(item => {
          if (item._selected) {
            itemList.push(item);
          }
        });
      }
      return itemList;
    },
    getSelected(idList, itemList) {
      this.$emit('selected', itemList);
    },
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
      if (row && row.parentId) {
        // 子需求新标签页打开
        this.newWindowOpen(row);
      } else {
        this.$emit('openIssue', row);
      }
    },
    searchIssue(currentPage) {
      this.$emit('searchIssue', currentPage);
    },
    changePageSize(pageSize) {
      this.$emit('changePageSize', pageSize);
    },
    unlinkIssue(row) {
      this.$emit('unlinkIssue', row);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
::v-deep .highlight {
  font-weight: bold;
  /* 保证和普通文字对齐 */
  line-height: 1; /* 确保高亮的行高与文字一致 */
  vertical-align: baseline; /* 水平对齐方式 */
}
</style>
