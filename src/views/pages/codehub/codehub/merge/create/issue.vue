<template>
  <div v-if="srcBranch && targetBranch">
    <div>
      <div class="input-border" style="padding:0 16px;margin-bottom:10px;">
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
          v-bind="tabledata"
          :tbodyList="getTbody(tabledata.tbodyList)"
          :height="tableheight()"
          @changeCurrent="changeCurrent"
          @changePageSize="changePageSize"
          @getSelected="getSelected"
        >
          <template slot="sourceUuid" slot-scope="{row}">
            {{ getsource(row.sourceUuid) }}
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
                <li class="ts-list" @click="viewIssue(row.uuid)"> {{ $t('page.detail') }} </li>
              </ul>
            </div>
          </template>
        </TsTable>
      </div>
      <div class="input-border" style="padding:0 16px;margin-top:10px;margin-bottom:10px;">
        <Row :gutter="16">
          <Col span="20">
            <Input
              v-model.trim="addItem"
              type="textarea"
              autosize
              :placeholder="$t('term.codehub.inputissuesnumberdesc')"
              @on-enter="addIssue()"
            />
          </Col>
          <Col span="4">
            <Button type="primary" @click="addIssue()">{{ $t('term.codehub.addmergeissues') }}</Button>
          </Col>
        </Row>
      </div>
    </div>
    <div v-if="allIssue(selectIssuelist,addLi) && allIssue(selectIssuelist,addLi).length>0" style="padding-top:10px;">
      <TsTable v-bind="showtabledata" :tbodyList="allIssue (selectIssuelist,addLi)||[]">
        <template slot="sourceUuid" slot-scope="{row}">
          {{ getsource(row.sourceUuid) }}
        </template>
        <template slot="isValid" slot-scope="{row}">
          <span v-if="row.isValid===1" class="text-success">{{ $t('term.codehub.effectivedemand') }}</span>
          <span v-else-if="row.isValid === 0" class="text-warning">{{ $t('term.codehub.invaliddemand') }}</span>
          <span v-else-if="row.isValid === null" class="ts-spinner loading text-primary"></span>
        </template>  
        <template slot="issueUpdateTime" slot-scope="{row}">
          {{ row.issueUpdateTime |formatDate }}
        </template>
        <template slot="action" slot-scope="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="ts-trash" @click="deleteIssue(row.no)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>        
      </TsTable>
    </div>
    <div class="input-border padding-md"><Input v-model="description" type="textarea" :placeholder="$t('term.codehub.mergerequestdesc')" /></div>
  </div>
  <div v-else class="text-tip text-center" style="line-height:2">{{ $t('term.codehub.selectoriginbranchandtargetbranch') }}</div>
</template>

<script>
// 需求型的mr创建先获取需求状态再获取其他字段
import mixins from './createmixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  mixins: [mixins],
  props: {
    versionid: [String, Number],
    versiondata: Object,
    srcBranch: [String, Number],
    issueNoList: Array
  },
  data() {
    return {
      isEdit: false, //是否编辑
      addItem: '', //手动输入的需求号
      addLi: [], //手动添加的不在原来的需求列表里的数据
      height: '600px',
      tabledata: {
        theadList: [{
          key: 'selection'
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
          key: 'sourceUuid'
        }
        ],
        rowKey: 'no',
        selectedRemain: true,
        classKey: 'isValid',
        cancelAxios: null //取消接口调用用
      }
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
          if (this.tabledata && this.tabledata.tbodyList && this.tabledata.tbodyList.length) {
            let tableli = this.tabledata.tbodyList.map((t) => {
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
    deleteIssue(uuid) {
      if (this.addLi.length > 0 && this.addLi.indexOf(uuid) > -1) {
        let li = this.addLi.filter((ad) => {
          return ad != uuid;
        });
        this.addLi = li;
        let totalIssue = this.totalIssue(this.selectIssuelist, li);
        this.$forceUpdate();
        this.$emit('getIsuuelist', totalIssue);
      } else if (this.selectIssuelist.length && this.selectIssuelist.indexOf(uuid) > -1) {
        this.selectIssuelist = this.selectIssuelist.filter(s => {
          return s != uuid;
        });        
        if (this.$refs.showtable) {
          this.$refs.showtable.removeSelectlist(uuid);
        }
      }
    },
    getList(srcBranch) {
      //获取需求列表（不含有效性）
      let param = {};
      if (this.versionid) {
        Object.assign(param, {versionUuid: this.versionid});
      }
      this.keyword && Object.assign(param, {keyword: this.keyword});
      this.tabledata.pageSize && Object.assign(param, {pageSize: this.tabledata.pageSize});
      this.tabledata.currentPage && Object.assign(param, {currentPage: this.tabledata.currentPage});
      this.isLoad = true;
      this.$api.codehub.merge.getIssuelist(param).then((res) => {
        this.isLoad = false;
        if (res && res.Status == 'OK') {
          this.$set(this.tabledata, 'pageCount', res.Return.pageCount);
          this.$set(this.tabledata, 'rowNum', res.Return.rowNum);
          this.$set(this.tabledata, 'pageSize', res.Return.pageSize);
          this.$set(this.tabledata, 'currentPage', res.Return.currentPage);
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
          this.$set(this.tabledata, 'tbodyList', tbodylist);
          this.getVaildlist(tbodylist);
        } else {
          this.$set(this.tabledata, 'tbodyList', []);
        }
      }).catch((error) => {
        this.$set(this.tabledata, 'tbodyList', []);
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
      let _this = this;
      let param = {};
      let list = resList.map((r) => {
        return r.no;
      });
      if (this.versiondata.subsystemUuid) {
        Object.assign(param, {subsystemUuid: this.versiondata.subsystemUuid});//需补充

        this.$utils.setCookie(this.versiondata.subsystemUuid + '_searchCommitCount', this.maxSearchCount);
      }
      //repositoryUuid
      if (this.targetBranch) {
        Object.assign(param, {targetBranch: this.targetBranch});
      }
      Object.assign(param, {srcBranch: this.srcBranch});
      //Object.assign(param, {searchCommitCount: parseInt(this.maxSearchCount)});
      Object.assign(param, {issueList: list || []});
      Object.assign(param, {searchCommitCount: parseInt(this.maxSearchCount)});
        
      this.tabledata.pageSize && Object.assign(param, {pageSize: this.tabledata.pageSize});
      this.tabledata.currentPage && Object.assign(param, {currentPage: this.tabledata.currentPage});
      //取消正在搜索的请求
      let cancel = this.cancelAxios;
      cancel && cancel.cancel();
      const CancelToken = this.$https.CancelToken;
      this.cancelAxios = CancelToken.source();
      this.tabledata.tbodyList && (resList = this.tabledata.tbodyList);
      this.$api.merge.getVaildlist(param, { cancelToken: _this.cancelAxios.token }).then((res) => {
        //this.$api.codehub.merge.getList(param).then(res => {//这里待确定究竟调哪个获取需求的接口
        if (res && res.Status == 'OK') {
          let newlist = res.Return.list || [];
          _this.tabledata.tbodyList.forEach((l) => {
            Object.assign(l, {
              isValid: 0              
            });
            newlist.forEach((n) => {
              if (l.no == n.issueNo) {
                Object.assign(l, {
                  isValid: 1              
                });
              }
            });
          });
          _this.$forceUpdate();
        }
      });
    }
  },
  filter: {},
  computed: {
    getTbody() {
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
        let tlist = this.tabledata.tbodyList || [];
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
