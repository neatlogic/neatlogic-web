<template>
  <div v-if="srcBranch && targetBranch">
    <div>
      <div class="mb-sm">
        <Row :gutter="16">
          <Col span="18">
            <Checkbox v-model="isValid">{{ $t('term.codehub.effectivedemand') }}</Checkbox>
            <span class="ml-xs">{{ $t('term.codehub.retrievesubmissionlogs') }}</span>
            <Input
              v-model="maxSearchCount"
              number
              type="number"
              min="1"
              style="width:60px;"
              @on-change="getValidList()"
            />
            <span class="ml-sm">{{ $t('page.strip') }}</span>
          </Col>
          <Col span="6">
          </Col>
        </Row>
      </div>
      <Loading v-if="isLoad" loadingShow></Loading>
      <div v-else :class="'issue-'+isValid">
        <TsTable
          ref="showtable"
          v-model="selectIssuelist"
          v-bind="tableData"
          :theadList="issueTheadList"
          :tbodyList="filterValidIssuesList(tableData.tbodyList)"
          :height="tableheight()"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template slot="sourceId" slot-scope="{row}">
            {{ getSourceName(row.sourceId) }}
          </template>
          <template slot="isValid" slot-scope="{row}">
            <span :class="getClassNameByValid(row.isValid)">{{ getTextByValid(row.isValid) }}</span>
          </template>      
          <template slot="issueUpdateTime" slot-scope="{row}">
            {{ row.issueUpdateTime |formatDate }}
          </template>
          <template slot="handleUserId" slot-scope="{row}">
            {{ row.handleUserId || row.issueCreator }}
          </template>
          <template slot="action" slot-scope="{ row }">
            <div class="tstable-action">
              <ul class="tstable-action-ul">
                <li class="ts-list" @click="viewIssue(row.id)"> {{ $t('page.detail') }} </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
      <div class="mt-sm mb-sm">
        <Row :gutter="16">
          <Col span="20">
            <TsFormInput
              v-model.trim="addItem"
              :placeholder="$t('term.codehub.inputissuesnumberdesc')"
              :rows="1"
              type="textarea"
              border="border"
              @on-enter="addIssue()"
            ></TsFormInput>
          </Col>
          <Col span="4">
            <Button type="primary" @click="addIssue()">{{ $t('term.codehub.addmergeissues') }}</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div v-if="allIssue(selectIssuelist,addLi) && allIssue(selectIssuelist,addLi).length>0" class="pt-sm pb-sm">
      <TsTable v-bind="selectedTableData" :tbodyList="allIssue(selectIssuelist,addLi)||[]">
        <template slot="sourceId" slot-scope="{row}">
          {{ getSourceName(row.sourceId) }}
        </template>
        <template slot="isValid" slot-scope="{row}">
          <span :class="getClassNameByValid(row.isValid)">{{ getTextByValid(row.isValid) }}</span>
        </template>  
        <template slot="issueUpdateTime" slot-scope="{row}">
          {{ row.issueUpdateTime |formatDate }}
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-trash-o" @click="deleteIssue(row.no)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>        
      </TsTable>
    </div>
    <div>
      <TsFormInput
        v-model="description"
        :placeholder="$t('term.codehub.mergerequestdesc')"
        type="textarea"
        border="border"
        maxlength="1024"
      ></TsFormInput>
    </div>
  </div>
  <div v-else class="text-tip text-center" style="line-height:2">{{ $t('term.codehub.selectoriginbranchandtargetbranch') }}</div>
</template>

<script>
// 需求型的mr创建先获取需求状态再获取其他字段
import mixins from './createmixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      isEdit: false, //是否编辑
      addItem: '', //手动输入的需求号
      addLi: [], //手动添加的不在原来的需求列表里的数据
      issueTheadList: [{
        key: 'selection',
        multiple: true // 多选
      }, {
        title: this.$t('term.codehub.issuesnumber'),
        key: 'no'
      }, {
        title: this.$t('page.description'),
        key: 'name'
      }, {
        title: this.$t('page.responsibleperson'),
        key: 'handleUserId'
      }, {
        title: this.$t('page.effectiveness'),
        key: 'isValid'
      }, {
        title: this.$t('page.status'),
        key: 'status'
      }, {
        title: this.$t('page.updatetime'),
        key: 'issueUpdateTime'
      }, {
        title: this.$t('page.source'),
        key: 'sourceId'
      }
      ]
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
  beforeDestroy() {
    this.cancelPreviousRequest();
  },
  destroyed() {},
  methods: {
    addIssue() {
      if (!this.addItem) return;

      const addlist = this.addItem.split(',').map(l => l.trim()).filter(l => l !== '');

      const tableNoSet = new Set(this.tableData?.tbodyList?.map(t => t.no));

      const addlistWithoutExisting = addlist.filter(l => !tableNoSet.has(l));
      const addlistInTable = addlist.filter(l => tableNoSet.has(l));

      this.selectIssuelist.push(...addlistInTable);
      this.addLi = this.totalIssue(this.addLi, addlistWithoutExisting);
      const totalIssue = this.totalIssue(this.selectIssuelist, this.addLi);
      this.$emit('getIsuuelist', totalIssue);
      this.addItem = '';
    },
    totalIssue(li1, li2) {
      return Array.from(new Set(li1.concat(li2)));
    },
    deleteIssue(id) {
      if (this.addLi.includes(id)) {
        this.addLi = this.addLi.filter(ad => ad !== id);
        const totalIssue = this.totalIssue(this.selectIssuelist, this.addLi);
        this.$emit('getIsuuelist', totalIssue);
      } else if (this.selectIssuelist.includes(id)) {
        this.selectIssuelist = this.selectIssuelist.filter(s => s !== id);
        if (this.$refs.showtable) {
          this.$refs.showtable.removeSelectlist(id);
        }
      }
    },
    getList(srcBranch) {
      const param = {
        versionId: this.versionId,
        keyword: this.keyword,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };

      this.isLoad = true;
      this.$api.codehub.merge.getIssuelist(param)
        .then((res) => {
          this.isLoad = false;
          if (res && res.Status === 'OK' && res.Return) {
            const { pageCount = 0, rowNum = 0, pageSize = 20, currentPage = 1, list = [] } = res.Return;

            this.tableData.pageCount = pageCount;
            this.tableData.rowNum = rowNum;
            this.tableData.pageSize = pageSize;
            this.tableData.currentPage = currentPage;

            const tbodylist = list || [];
            if (tbodylist.length > 0) {
              tbodylist.forEach((t) => {
                Object.assign(t, {
                  isValid: null
                });
              });
              this.$emit('getIssue', true);
            } else {
              this.$emit('getIssue', false);
            }

            const filteredList = this.filterValidIssuesList(tbodylist);
            this.tableData.tbodyList = filteredList;
            this.getValidList(filteredList);
          } else {
            this.tableData.tbodyList = [];
          }
        })
        .catch((error) => {
          this.tableData.tbodyList = [];
          this.isLoad = false;
        });
    },
    getValidList() {
      let resList = this.tableData.tbodyList || [];

      if (!this.srcBranch || !this.targetBranch) {
        return;
      }

      if (this.type === 'issue' && this.maxSearchCount < 1) {
        this.$Message.error(this.$t('term.codehub.issueslogmaxcount'));
        return;
      }

      let list = resList.map((r) => r.no);

      let param = {
        srcBranch: this.srcBranch,
        issueList: list || [],
        searchCommitCount: parseInt(this.maxSearchCount),
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };

      if (this.versionData.appModuleId) {
        param.appModuleId = this.versionData.appModuleId;
        this.$utils.setCookie(`${this.versionData.appModuleId}_searchCommitCount`, this.maxSearchCount);
      }

      if (this.targetBranch) {
        param.targetBranch = this.targetBranch;
      }

      this.cancelPreviousRequest();

      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();

      this.$api.codehub.merge
        .getVaildlist(param, { cancelToken: this.cancelAxios.token })
        .then((res) => {
          if (res && res.Status === 'OK') {
            let newlist = res.Return.list || [];

            resList.forEach((l) => {
              Object.assign(l, {
                isValid: 0
              });

              newlist.forEach((n) => {
                if (l.no === n.issueNo) {
                  Object.assign(l, {
                    isValid: 1
                  });
                }
              });
            });
          }
        });
    },
    cancelPreviousRequest() {
      const cancel = this.cancelAxios;
      cancel && cancel.cancel();
    },
    resetList() {
      if (this.selectIssuelist.length > 0 || this.addLi.length > 0) {
        this.selectIssuelist = [];
        this.addLi = [];
        this.$emit('getIsuuelist', []);
      }
    }
  },
  filter: {},
  computed: {
    filterValidIssuesList() {
      // 过滤有效需求列表
      return (tbodyList) => {
        if (!tbodyList || tbodyList.length === 0) {
          return [];
        }

        return tbodyList.filter((tbody) => this.isValid ? tbody.isValid : tbody);
      };
    },
    allIssue() {
      return function(selectIssuelist, li) {
        if (!selectIssuelist || !li) {
          return [];
        }

        let issueList = this.totalIssue(selectIssuelist, li);
        let tlist = this.tableData.tbodyList || [];

        return issueList.map(to => {
          let totalLi = tlist.filter(tbody => tbody.no === to);
          return totalLi.length > 0 ? totalLi[0] : { no: to };
        });
      };
    }
  },
  watch: {
    srcBranch(val) {
      this.resetList();
      this.getValidList();
    },
    targetBranch() {
      this.resetList();
      this.getValidList();   
    }
  }
};

</script>
<style lang='less' scoped>
</style>
