<template>
  <div>
    <TsTable
      v-bind="issueAuditData"
      :theadList="theadList"
      :fixedHeader="false"
      @changeCurrent="searchAudit"
      @changePageSize="changePageSize"
    >
      <template v-slot:index="{ row, index }">
        <span :class="row.id">{{ index + 1 }}</span>
      </template>
      <template v-slot:inputTime="{ row }">
        {{ row.inputTime | formatDate }}
      </template>
      <template v-slot:inputUser="{ row }">
        <UserCard :uuid="row.inputUser"></UserCard>
      </template>
      <template v-slot:attr="{ row }">
        <span v-if="row.attrId && getAttrById(row.attrId)">
          {{ getAttrById(row.attrId).label }}
        </span>
        <span v-if="row.attrName && row.attrName === 'name'">
          {{ $t('page.name') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'status'">
          {{ $t('page.status') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'status'">
          {{ $t('page.status') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'file'">
          {{ $t('page.accessory') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'iteration'">
          {{ $t('term.rdm.iteration') }}
        </span>
      </template>
      <div slot="oldValue" slot-scope="{ row }" style="white-space:normal">
        <AttrViewer v-if="row.appAttr" :attrConfig="row.appAttr" :valueList="row.oldValue"></AttrViewer>
        <div v-else-if="row.attrName && row.attrName === 'name'">
          <span v-if="row.oldValue && row.oldValue.length > 0">{{ row.oldValue[0] }}</span>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'status'">
          <IssueStatus v-if="row.oldValue && row.oldValue.length > 0" :status="row.oldValue[0]"></IssueStatus>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'file'">
          <div v-if="row.oldValue && row.oldValue.length > 0">
            <Tag
              v-for="(file,index) in row.oldValue"
              :key="index"
              v-download="download(file.id)"
              class="tsfont-attachment cursor"
            >
              {{ file.name }}
            </Tag>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </div>
      <div slot="newValue" slot-scope="{ row }" style="white-space:normal">
        <AttrViewer v-if="row.appAttr" :attrConfig="row.appAttr" :valueList="row.newValue"></AttrViewer>
        <div v-else-if="row.attrName && row.attrName === 'name'">
          <span v-if="row.newValue && row.newValue.length > 0">{{ row.newValue[0] }}</span>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'status'">
          <IssueStatus v-if="row.newValue && row.newValue.length > 0" :status="row.newValue[0]"></IssueStatus>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'file'">
          <div v-if="row.newValue && row.newValue.length > 0">
            <Tag
              v-for="(file,index) in row.newValue"
              :key="index"
              v-download="download(file.id)"
              class="tsfont-attachment cursor"
            >
              {{ file.name }}
            </Tag>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
      </div>
    </TsTable>
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve)
  },
  directives: {download},
  props: {
    issueId: { type: Number },
    appId: {type: Number}
  },
  data() {
    return {
      searchParam: { issueId: this.issueId, pageSize: 10 },
      issueAuditData: {},
      attrList: [],
      theadList: [
        { key: 'index', title: '序号' },
        { key: 'inputTime', title: '变更时间' },
        { key: 'inputUser', title: '变更人' },
        { key: 'inputFromName', title: '变更方式' },
        { key: 'attr', title: '变更属性' },
        { key: 'oldValue', title: '变更前' },
        { key: 'newValue', title: '变更后' }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchAppAttr();
    this.searchAudit(1);
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
    download(id) {
      return {
        url: 'api/binary/file/download',
        params: {
          id: id
        }
      };
    },
    getAttrById(id) {
      if (this.attrList && this.attrList.length > 0) {
        return this.attrList.find(d => d.id === id);
      }
      return null;
    },
    searchAppAttr() {
      if (this.appId) {
        this.$api.rdm.app.searchAppAttr({ appId: this.appId }).then(res => {
          this.attrList = res.Return;
        });
      }
    },
    changePageSize(pageSize) {
      this.searchParam.pageSize = pageSize;
      this.searchAudit(1);
    },
    searchAudit(currentPage) {
      if (currentPage) {
        this.searchParam.currentPage = currentPage;
      }
      this.$api.rdm.issueaudit.searchIssueAudit(this.searchParam).then(res => {
        this.issueAuditData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
