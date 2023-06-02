<template>
  <div>
    <TsContain>
      <template slot="top">
        <Row :gutter="16">
          <Col span="9">
            <Button type="primary" @click="sysnIssue">{{ $t('term.codehub.syncissues') }}</Button>
          </Col>
          <Col span="4">
            <TsFormSelect v-model="systemUuid" v-bind="systemConf"></TsFormSelect>
          </Col>
          <Col span="5">
            <TsFormSelect v-model="subsystemUuid" v-bind="subsystemConf"></TsFormSelect>
          </Col>
          <Col span="6">
            <Input
              v-model.trim="keyword"
              prefix="i-icon ts-search"
              :placeholder="$t('page.keyword')"
              @keyup.enter.native="getSearch"
            />
          </Col>
        </Row>
      </template>
      <div slot="content">
        <TsTable v-bind="tabledata" @changeCurrent="changeCurrent" @changePageSize="changePageSize">
          <template slot="sourceUuid" slot-scope="{row}">
            {{ getsource(row.sourceUuid) }}
          </template>
          <template slot="issueUpdateTime" slot-scope="{row}">
            {{ row.issueUpdateTime|formatDate }}
          </template>
          <template slot="systemVo" slot-scope="{row}">
            <Tooltip
              v-if="row.systemVo"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.subSystemVo.name }}</div>
              <div slot="content">
                <div>{{ row.subSystemVo.description }}</div>
              </div>
            </Tooltip>  
          </template>
          <template slot="subSystemVo" slot-scope="{row}">
            <Tooltip
              v-if="row.subSystemVo"
              theme="light"
              max-width="300"
              transfer
            >
              <div>{{ row.subSystemVo.name }}</div>
              <div slot="content">
                <div>{{ row.subSystemVo.description }}</div>
              </div>
            </Tooltip>  
          </template>
        </TsTable>
      </div>
    </TsContain>
    <IssueAsyn
      v-if="showEdit"
      :isShow="showEdit"
      :sourceList="syncSourceList"
      @close="saveAsyn"
    ></IssueAsyn>
  </div>
</template>

<script>
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    IssueAsyn: resolve => require(['./overview/issue-asyn'], resolve)
  },
  props: [''],
  data() {
    return {
      keyword: '',
      systemUuid: '',
      subsystemUuid: '',
      syncSourceList: [],
      tabledata: {
        theadList: [{
          title: this.$t('term.codehub.issuesnumber'),
          key: 'no'
        }, {
          title: this.$t('page.name'),
          key: 'name'
        }, {
          title: this.$t('term.process.dealwithuser'),
          key: 'lcu'
        }, {
          title: this.$t('page.status'),
          key: 'status'
        }, {
          title: this.$t('page.system'),
          key: 'systemVo'
        }, {
          title: this.$t('page.subsystem'),
          key: 'subSystemVo'
        }, {
          title: this.$t('page.updatetime'),
          key: 'issueUpdateTime'
        }, {
          title: this.$t('page.source'),
          key: 'sourceUuid'
        }],
        tbodyList: []
      },
      showEdit: false,
      systemConf: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: (val) => {
          this.getSearch();
        }
      },
      subsystemConf: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appmodule/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: (val) => {
          this.getSearch();
        }        
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getSouce();
    this.getList();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    sysnIssue() {
      this.showEdit = true;
    },
    saveAsyn() {
      this.showEdit = false;
      this.getList();
    },
    changePageSize(size) {
      this.tabledata.pageSize = size;
      this.getList();
    },
    changeCurrent(page) {
      this.tabledata.currentPage = page;
      this.getList();
    },
    getSearch() {
      this.tabledata.currentPage = 1;
      this.getList();
    },
    getList() {
      let param = {};
      this.tabledata.pageSize && Object.assign(param, {pageSize: this.tabledata.pageSize});
      this.tabledata.currentPage && Object.assign(param, {currentPage: this.tabledata.currentPage});
      if (this.subsystemUuid) {
        Object.assign(param, {subsystemUuid: this.subsystemUuid});
      }
      if (this.systemUuid) {
        Object.assign(param, {systemUuid: this.systemUuid});
      }
      if (this.keyword) {
        Object.assign(param, {keyword: this.keyword});
      }
      this.$api.codehub.issue.getList(param).then(res => {
        if (res && res.Status == 'OK') {
          this.$set(this.tabledata, 'pageCount', res.Return.pageCount);
          this.$set(this.tabledata, 'rowNum', res.Return.rowNum);
          this.$set(this.tabledata, 'pageSize', res.Return.pageSize);
          this.$set(this.tabledata, 'currentPage', res.Return.currentPage);
          this.$set(this.tabledata, 'tbodyList', res.Return.list);
        } else {
          this.$set(this.tabledata, 'tbodyList', []);
        }
      });
    },
    getSouce() {
      this.$api.codehub.issue.getSource({type: 'issue'}).then(res => {
        if (res && res.Status == 'OK') {
          this.syncSourceList = res.Return.syncSourceList;
        }
      });
    }
  },
  filter: {},
  computed: {
    getsource() {
      return function(uuid) {
        let txt = '';
        this.syncSourceList.forEach(sync => {
          if (sync.uuid == uuid) {
            txt = sync.source;
          }
        });
        return txt;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less'>
</style>
