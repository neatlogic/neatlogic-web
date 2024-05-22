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
      <template v-slot:inputTime="{ row }">
        <span class="fz10">{{ row.inputTime | formatDate }}</span>
      </template>
      <template v-slot:inputUser="{ row }">
        <UserCard :uuid="row.inputUser"></UserCard>
      </template>
      <template v-slot:inputFromName="{ row }">
        <span>{{ row.inputFromName }}</span>
      </template>
      <template v-slot:attr="{ row }">
        <span v-if="row.attrId && getAttrById(row.attrId)">
          {{ getAttrById(row.attrId).label }}
        </span>
        <span v-if="row.attrName && row.attrName === 'name'">
          {{ $t('page.name') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'content'">
          {{ $t('page.content') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'status'">
          {{ $t('page.status') }}
        </span>
        <span v-if="row.attrName && row.attrName === 'file'">
          {{ $t('page.accessory') }}
        </span>
        <span v-if="row.attrName && row.attrName.startsWith('rel_')">
          {{ $t('dialog.title.linktarget', { target: getAppTypeName(row.attrName.replace('rel_', '')) }) }}
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
            <span
              v-for="(file, index) in row.oldValue"
              :key="index"
            ><Tag
              v-if="file"
              v-download="download(file.id)"
              class="tsfont-attachment cursor"
            >
              {{ file.name }}
            </Tag>
            </span>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName.startsWith('rel_')">
          <div v-if="row.oldValue && row.oldValue.length > 0">
            <div v-for="(rel, index) in row.oldValue" :key="index">
              <a class="tsfont-bind fz10 text-grey" @click="toIssueDetail(rel)">
                {{ rel.name }}
              </a>
            </div>
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
            <span
              v-for="(file, index) in row.newValue"
              :key="index"
            ><Tag
              v-if="file"
              v-download="download(file.id)"
              class="tsfont-attachment cursor"
            >
              {{ file.name }}
            </Tag>
            </span>
          </div>
          <span v-else class="text-grey">-</span>
        </div>
        <div v-else-if="row.attrName && row.attrName.startsWith('rel_')">
          <div v-if="row.newValue && row.newValue.length > 0">
            <div v-for="(rel, index) in row.newValue" :key="index">
              <a class="tsfont-bind fz10 text-grey" @click="toIssueDetail(rel)">
                {{ rel.name }}
              </a>
            </div>
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
    ContentHandler: () => import('@/views/pages/rdm/project/content-handler/content-handler.vue'),
    IssueStatus: () => import('@/views/pages/rdm/project/viewtab/components/issue-status.vue'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
    AttrViewer: () => import('@/views/pages/rdm/project/attr-viewer/attr-viewer.vue')
  },
  directives: { download },
  props: {
    projectId: { type: Number },
    issueId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      searchParam: { issueId: this.issueId, pageSize: 10 },
      issueAuditData: {},
      attrList: [],
      appTypeList: [],
      appData: {},
      theadList: [
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
    this.getAllAppTypeList();
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
    getAllAppTypeList() {
      this.$api.rdm.app.getAllAppTypeList().then(res => {
        this.appTypeList = res.Return;
      });
    },
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
    toIssueDetail(row) {
      this.$router.push({ path: '/' + row.appType + '-detail/' + this.projectId + '/' + row.appId + '/' + row.id });
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
  computed: {
    getAppTypeName() {
      return appType => {
        if (this.appTypeList && this.appTypeList.length > 0) {
          const at = this.appTypeList.find(d => d.name === appType);
          if (at) {
            return at.label;
          }
        }
        return null;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
/deep/ td {
  vertical-align: top !important;
}
</style>
