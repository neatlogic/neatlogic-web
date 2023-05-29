<template>
  <div>
    <TsContain>
      <template slot="top">
        <Row :gutter="16">
          <Col span="9">
            <Button type="primary" @click="sysnIssue">同步需求</Button>
          </Col>
          <Col span="4">
            <FormSelect v-model="systemUuid" placeholder="请选择系统" v-bind="systemConf"></FormSelect>
          </Col>
          <Col span="5">
            <FormSelect v-model="subsystemUuid" placeholder="请选择子系统" v-bind="subsystemConf"></FormSelect>
          </Col>
          <Col span="6">
            <Input
              v-model.trim="keyword"
              prefix="i-icon ts-search"
              placeholder="关键字"
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
import FormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: '',
  components: {
    TsContain: resolve => require(['@/resources/components/TsContain/TsContain.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    IssueAsyn: resolve => require(['./overview/issue-asyn'], resolve),
    FormSelect
  },
  props: [''],
  data() {
    let _this = this;
    return {
      keyword: '',
      systemUuid: '',
      subsystemUuid: '',
      syncSourceList: [],
      tabledata: {
        theadList: [{
          title: '需求编号',
          key: 'no'
        }, {
          title: '名称',
          key: 'name'
        }, {
          title: '处理人',
          key: 'lcu'
        }, {
          title: '状态',
          key: 'status'
        }, {
          title: '系统',
          key: 'systemVo'
        }, {
          title: '子系统',
          key: 'subSystemVo'
        }, {
          title: '更新时间',
          key: 'issueUpdateTime'
        }, {
          title: '来源',
          key: 'sourceUuid'
        }],
        tbodyList: []
      },
      showEdit: false,
      systemConf: {
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.getSearch();
        }
      },
      subsystemConf: {
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/subsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.getSearch();
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

  watch: {
  }

};

</script>
<style lang='less'>

</style>
