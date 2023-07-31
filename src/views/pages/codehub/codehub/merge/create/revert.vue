<template>
  <div>
    <div>
      <div class="input-border pl-nm pr-nm mb-sm">
        <Row :gutter="16">
          <Col span="18">
            <Checkbox v-model="isValid">{{ $t('term.codehub.effectivedemand') }}</Checkbox>
            <span class="ml-sm">{{ $t('term.codehub.retrievesubmissionlogs') }}</span>
            <Input
              v-model="maxSearchCount"
              number
              type="number"
              min="1"
              style="width:60px;"
              @on-change="getVaildlist()"
            />
            <span class="ml-sm">{{ $t('page.strip') }}</span>
          </Col>
          <Col span="6">
          </Col>
        </Row>
      </div>
      <Loading v-if="isLoad" loadingShow></Loading>
      <div v-else :class="'issue-' + isValid">
        <TsTable
          ref="showtable"
          v-bind="tableData"
          :theadList="theadList"
          :tbodyList="getTbody()"
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
                <li class="ts-list" @click="viewIssue(row.id)">{{ $t('page.detail') }}</li>
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
    <div v-if="allIssue(selectIssuelist,addLi) && allIssue(selectIssuelist,addLi).length>0" class="pt-sm">
      <TsTable v-bind="showtabledata" :tbodyList="allIssue (selectIssuelist,addLi)||[]">
        <template slot="sourceId" slot-scope="{row}">
          {{ getsource(row.sourceId) }}
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
              <li class="ts-trash" @click="deleteIssue(row.no)">{{ $t('page.delete') }}</li>
            </ul>
          </div>
        </template>        
      </TsTable>
    </div>
    <div class="mt-sm">
      <TsFormInput
        v-model="description"
        type="textarea"
        border="border"
        maxlength="1024"
        :placeholder="$t('term.codehub.mergerequestdesc')"
      ></TsFormInput>
    </div>
  </div>
</template>

<script>
import mixins from './createmixin.js';
export default {
  name: '',
  components: {
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  mixins: [mixins],
  props: {},
  data() {
    return {
      isEdit: false, //是否编辑
      addItem: '',
      addLi: []
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
  beforeDestroy() {},
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
          //先过滤掉已经在上面的table列表里的
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
        this.$forceUpdate();
        this.$emit('getIsuuelist', totalIssue);
      } else {
        if (this.$refs.showtable) {
          this.$refs.showtable.removeSelectlist(id);
        }
      }
    }
  },
  filter: {},
  computed: {
    getTbody() {
      return function() {
        let list = [];
        if (this.tableData.tbodyList && this.tableData.tbodyList.length > 0) {
          list = this.tableData.tbodyList.filter(tbody => {
            return this.isValid ? tbody.isValid : tbody;
          });
        }
        return list;
      };
    },
    allIssue() {
      return function(selectIssuelist, li) {
        let issueList = this.totalIssue(selectIssuelist, li);
        let totalIssue = issueList.map(to => {
          let totalLi = this.tableData.tbodyList.filter(tbody => {
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
    }
  }
};
</script>
<style lang='less' scoped>
</style>
