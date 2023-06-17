<template>
  <div>
    <TsTable
      class="audit-table"
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
        <span v-if="row.attrName && row.attrName === 'file'">
          {{ $t('page.accessory') }}
        </span>
      </template>
      <div slot="oldValue" slot-scope="{ row }" style="white-space: normal">
        <AttrViewer v-if="row.appAttr" :attrConfig="row.appAttr" :valueList="row.oldValue"></AttrViewer>
        <div v-else-if="row.attrName && row.attrName === 'name'">
          <span v-if="row.oldValue && row.oldValue.length > 0">{{ row.oldValue[0] }}</span>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'content'">
          <div v-if="row.oldValue && row.oldValue.length > 0">
            <ContentHandler :issueData="{ appType: appData.type, content: row.oldValue[0] }" :readonly="true"></ContentHandler>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'status'">
          <IssueStatus v-if="row.oldValue && row.oldValue.length > 0" :status="row.oldValue[0]"></IssueStatus>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'file'">
          <div v-if="row.oldValue && row.oldValue.length > 0">
            <Tag
              v-for="(file, index) in row.oldValue"
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
      <div slot="newValue" slot-scope="{ row }" style="white-space: normal">
        <AttrViewer v-if="row.appAttr" :attrConfig="row.appAttr" :valueList="row.newValue"></AttrViewer>
        <div v-else-if="row.attrName && row.attrName === 'name'">
          <span v-if="row.newValue && row.newValue.length > 0">{{ row.newValue[0] }}</span>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'content'">
          <div v-if="row.newValue && row.newValue.length > 0">
            <ContentHandler :issueData="{ appType: appData.type, content: row.newValue[0] }" :readonly="true"></ContentHandler>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'status'">
          <IssueStatus v-if="row.newValue && row.newValue.length > 0" :status="row.newValue[0]"></IssueStatus>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName === 'file'">
          <div v-if="row.newValue && row.newValue.length > 0">
            <Tag
              v-for="(file, index) in row.newValue"
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
    ContentHandler: resolve => require(['@/views/pages/rdm/project/content-handler/content-handler.vue'], resolve),
    IssueStatus: resolve => require(['@/views/pages/rdm/project/viewtab/components/issue-status.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    AttrViewer: resolve => require(['@/views/pages/rdm/project/attr-viewer/attr-viewer.vue'], resolve)
  },
  directives: { download },
  props: {
    issueId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      searchParam: { issueId: this.issueId, pageSize: 10 },
      issueAuditData: {},
      attrList: [],
      appData: {},
      theadList: [
        { key: 'index', title: this.$t('page.ordernumber') },
        { key: 'inputTime', title: this.$t('term.rdm.changetime') },
        { key: 'inputUser', title: this.$t('term.rdm.editor') },
        { key: 'inputFromName', title: this.$t('term.rdm.changetype') },
        { key: 'attr', title: this.$t('term.rdm.changeattr') },
        { key: 'oldValue', title: this.$t('term.rdm.beforechange') },
        { key: 'newValue', title: this.$t('term.rdm.afterchange') }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getAppById();
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
    getAppById() {
      if (this.appId) {
        this.$api.rdm.app.getAppById(this.appId).then(res => {
          this.appData = res.Return;
          this.attrList = this.appData.attrList;
        });
      }
    },
    /*searchAppAttr() {
      if (this.appId) {
        this.$api.rdm.app.searchAppAttr({ appId: this.appId }).then(res => {
          this.attrList = res.Return;
        });
      }
    },*/
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
<style lang="less" scoped>
/deep/ td {
  vertical-align: top !important;
}
</style>
