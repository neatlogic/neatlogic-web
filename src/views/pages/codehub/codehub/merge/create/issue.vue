<template>
  <div v-if="srcBranch && targetBranch">
    <div>
      <div class="input-border mb-sm">
        <Row :gutter="16">
          <Col span="18">
            <Checkbox v-model="isValid">{{ $t('term.codehub.effectivedemand') }}</Checkbox>
            <span class="ml-10">{{ $t('term.codehub.retrievesubmissionlogs') }}</span>
            <Input
              v-model="maxSearchCount"
              number
              type="number"
              min="1"
              style="width:60px;"
              @on-change="getVaildlist()"
            />
            <span class="ml-10">{{ $t('page.strip') }}</span>
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
          :theadList="theadList"
          :height="tableheight()"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template slot="sourceId" slot-scope="{row}">
            {{ getsource(row.sourceId) }}
          </template>
          <template slot="isValid" slot-scope="{row}">
            <span v-if="row.isValid===1" class="text-success">{{ $t('term.codehub.effectivedemand') }}</span>
            <span v-else-if="row.isValid === 0" class="text-warning">{{ $t('term.codehub.invaliddemand') }}</span>
            <span v-else-if="row.isValid === null" class="ts-spinner loading text-primary"></span>
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
    <div v-if="allIssue(selectIssuelist,addLi) && allIssue(selectIssuelist,addLi).length>0" class="pt-sm">
      <TsTable v-bind="showtabledata" :tbodyList="allIssue (selectIssuelist,addLi)||[]">
        <template slot="sourceId" slot-scope="{row}">
          {{ getsource(row.sourceId) }}
        </template>
        <template slot="isValid" slot-scope="{row}">
          <span v-if="row.isValid ===1" class="text-success">{{ $t('term.codehub.effectivedemand') }}</span>
          <span v-else-if="row.isValid === 0" class="text-warning">{{ $t('term.codehub.invaliddemand') }}</span>
          <span v-else-if="row.isValid === null" class="ts-spinner loading text-primary"></span>
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
      height: '600px'
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
    //取消正在搜索的请求
    let cancel = this.cancelAxios;
    cancel && cancel.cancel();
  },
  destroyed() {},
  methods: {
    addIssue() {
      let addlist = [];
      try {
        if (this.addItem) {
          let list = [];
          if (this.addItem.indexOf(',') > -1) {
            list = this.addItem.split(',');
          } else {
            list = [this.addItem];
          }
          list = list.map(l => {
            return l.replace(/\s+/g, '');
          }).filter(l => {
            return l != '';
          });
          //先过滤掉已经在上面的table列表里的
          if (this.tableData && this.tableData.tbodyList && this.tableData.tbodyList.length) {
            let tableli = this.tableData.tbodyList.map((t) => {
              return t.no;
            });
            addlist = list.filter((l) => {
              return tableli.indexOf(l) == -1;
            });
            //不相等就是有上面的table的数据，要把属于table的数组先取出来，再在选中列表加上没加上的
            if (addlist.length != list.length) {
              let morelist = list.filter((l) => {
                return tableli.indexOf(l) > -1;
              });
              if (morelist && morelist.length > 0) {
                morelist.forEach((m) => {
                  if (this.selectIssuelist.indexOf(m) == -1) {
                    this.selectIssuelist.push(m);
                  }
                });
              }
            }
          } else if (list && list.length > 0) {
            addlist = list;
          }
        }
      } catch (error) {
        console.log(error);
      }
      this.addLi = this.totalIssue(this.addLi, addlist);
      let totalIssue = this.totalIssue(this.selectIssuelist, this.addLi);
      this.$emit('getIsuuelist', totalIssue);
      this.$nextTick(() => {
        this.addItem = '';
      });
    },
    totalIssue(li1, li2) {
      return Array.from(new Set(li1.concat(li2)));
    },
    deleteIssue(id) {
      if (this.addLi.length > 0 && this.addLi.indexOf(id) > -1) {
        let li = this.addLi.filter((ad) => {
          return ad != id;
        });
        this.addLi = li;
        let totalIssue = this.totalIssue(this.selectIssuelist, li);
        this.$emit('getIsuuelist', totalIssue);
      } else if (this.selectIssuelist.length && this.selectIssuelist.indexOf(id) > -1) {
        this.selectIssuelist = this.selectIssuelist.filter(s => {
          return s != id;
        });        
        if (this.$refs.showtable) {
          this.$refs.showtable.removeSelectlist(id);
        }
      }
    },
    getList(srcBranch) {
      //获取需求列表（不含有效性）
      let param = {
        versionId: this.versionId,
        keyword: this.keyword,
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      this.isLoad = true;
      this.$api.codehub.merge.getIssuelist(param).then((res) => {
        this.isLoad = false;
        if (res && res.Status == 'OK') {
          this.$set(this.tableData, 'pageCount', res.Return.pageCount);
          this.$set(this.tableData, 'rowNum', res.Return.rowNum);
          this.$set(this.tableData, 'pageSize', res.Return.pageSize);
          this.$set(this.tableData, 'currentPage', res.Return.currentPage);
          let tbodylist = res.Return.list || [];
          if (tbodylist && tbodylist.length > 0) {
            //单独添加是否有效的字段
            tbodylist.forEach((t) => {
              Object.assign(t, {
                isValid: null
              });
            });
            this.$emit('getIssue', true);
          } else {
            this.$emit('getIssue', false);
          }
          this.$set(this.tableData, 'tbodyList', this.filterValidTbodyList(tbodylist));
          this.getVaildlist(tbodylist);
        } else {
          this.$set(this.tableData, 'tbodyList', []);
        }
      }).catch((error) => {
        this.$set(this.tableData, 'tbodyList', []);
        this.isLoad = false;
      }); 
    },
    getVaildlist() {
      let resList = [];
      if (!this.srcBranch || !this.targetBranch) {
        return;
      }
      if (this.type == 'issue' && this.maxSearchCount < 1) {
        this.$Message.error(this.$t('term.codehub.issueslogmaxcount'));
        return;
      }
      let list = resList.map((r) => {
        return r.no;
      });
      let param = {
        srcBranch: this.srcBranch,
        issueList: list || [],
        searchCommitCount: parseInt(this.maxSearchCount),
        currentPage: this.tableData.currentPage,
        pageSize: this.tableData.pageSize
      };
      if (this.versionData.appModuleId) {
        this.$set(param, 'appModuleId', this.versionData.appModuleId);
        this.$utils.setCookie(this.versionData.appModuleId + '_searchCommitCount', this.maxSearchCount);
      }
      if (this.targetBranch) {
        this.$set(param, 'targetBranch', this.targetBranch);
      }
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      this.tableData.tbodyList && (resList = this.tableData.tbodyList);
      this.$api.codehub.merge.getVaildlist(param, { cancelToken: this.cancelAxios.token }).then((res) => {
        if (res && res.Status == 'OK') {
          let newlist = res.Return.list || [];
          this.tableData.tbodyList.forEach((l) => {
            Object.assign(l, {
              isValid: 0              
            });
            newlist.forEach((n) => { // 需求有效性，需求编号和commit的需求编号相同，就设置需求的有效性
              if (l.no == n.issueNo) {
                Object.assign(l, {
                  isValid: 1              
                });
              }
            });
          });
        }
      });
    }
  },
  filter: {},
  computed: {
    filterValidTbodyList() {
      // 过滤有效需求
      return function(tbodyList) {
        let list = [];
        if (tbodyList && tbodyList.length > 0) {
          list = tbodyList.filter(tbody => {
            return this.isValid ? tbody.isValid : tbody;
          });
        }
        return list;
      };
    },
    allIssue() {
      return function(selectIssuelist, li) {
        let issueList = this.totalIssue(selectIssuelist, li);
        let tlist = this.tableData.tbodyList || [];
        let totalIssue = issueList.map(to => {
          let totalLi = tlist.filter(tbody => {
            return tbody.no == to;
          });
          return totalLi.length > 0 ? totalLi[0] : {
            no: to
          };
        });
        return totalIssue;        
      };
    }
  },
  watch: {
    srcBranch(val) {
      this.selectIssuelist = [];
      this.addLi = [];
      this.$emit('getIsuuelist', []);
      this.getVaildlist();
    },
    targetBranch() {
      this.selectIssuelist = [];
      this.addLi = [];
      this.$emit('getIsuuelist', []);
      this.getVaildlist();      
    }
  }
};

</script>
<style lang='less' scoped>
</style>
