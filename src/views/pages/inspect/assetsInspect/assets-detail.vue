<template>
  <div>
    <TsContain :isRightSiderHide="isHistoryHide" :rightWidth="180">
      <template v-slot:navigation>
        <span v-if="$hasBack()" class="text-action tsfont-left" @click="$back()">{{ $getFromPage() }}</span>
      </template>
      <template v-slot:topLeft>
        <div class="action-group">
          <span v-if="reportData && reportData._report_time" class="action-item tsfont-formtime text-default">{{ reportData._report_time | formatDate }}</span>
          <span class="text-grey action-item">
            <UserCard :uuid="reportData && reportData._execuser" hideAvatar></UserCard>
          </span>
          <span v-if="searchParam.id" class="action-item">
            <span class="text-info">
              {{ $t('term.inspect.lookingthroughreport') }}
            </span>
          </span>
        </div>
      </template>
      <template v-slot:topRight>
        <div class="bar-top-right action-group text-right">
          <span class="action-item tsfont-history" @click="isHistoryHide = !isHistoryHide">{{ $t('term.inspect.historyreport') }}</span>
          <span v-if="isDownloading" class="action-item tsfont-download disable" :title="$t('page.downloadloadingtip')">
            {{ $t('page.export') }}
            <Icon type="ios-loading" size="18" class="loading"></Icon>
          </span>
          <Dropdown v-if="!isDownloading" placement="bottom-start">
            <span class="action-item tsfont-download">
              {{ $t('page.export') }}
              <Icon type="ios-arrow-down"></Icon>
            </span>
            <DropdownMenu slot="list">
              <DropdownItem v-download="downloadConfig('pdf')">
                PDF
              </DropdownItem>
              <DropdownItem v-download="downloadConfig('word')">
                WORD
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </template>
      <template v-slot:right>
        <div ref="historyList">
          <HistoryList
            :id="searchParam.id"
            :resourceId="searchParam.resourceId"
            :height="historyHeight"
            @change="selectHistory"
          ></HistoryList>
        </div>
      </template>
      <template v-slot:content>
        <Loading v-if="isLoading" :loadingShow="isLoading"></Loading>
        <!--告警摘要-->
        <div v-if="!$utils.isEmpty(outlineData)" type="info" class="bg-op radius-lg padding mt-xs mb-nm">
          <span
            v-for="(outline, level, index) in outlineData"
            :key="index"
            class="mr-nm"
            :class="outline.cssClass"
          >
            <Poptip trigger="hover" placement="right-start" width="650">
              <div class="cursor h4" @click="scrollToTarget(outline)">
                <span class="tsfont-warning-s">{{ outline.name }}:</span>
                <span>
                  <b>{{ outline.alertList.length }}</b>
                </span>
              </div>
              <div slot="content">
                <TsTable :tbodyList="outline.alertList" :theadList="outlineTheadList">
                  <template v-slot:level="{ row }">
                    <span :class="outline.cssClass">{{ row.level }}</span>
                  </template>
                  <template v-slot:desc="{ row }">
                    <span>{{ row.ruleName }}</span>
                    <span>(</span>
                    <span :class="outline.cssClass">{{ row.fieldValue }}</span>
                    <span>)</span>
                  </template>
                  <template v-slot:ruleName="{ row }">
                    <span class="text-href" @click="toThresholdRuleDetail(row)">{{ row.ruleName }}</span>
                  </template>
                </TsTable>
              </div>
            </Poptip>
          </span>
        </div>
        <!--报告详情-->
        <div class="content-grid">
          <div
            v-for="(field, index) in fieldList"
            :key="index"
            class="item"
            :class="{ 'item-row': field.type === 'JsonArray' || field.type === 'JsonObject' || field.type === 'Text' }"
          >
            <div class="title overflow text-grey" :class="getFieldClass(field.name)" :title="field.desc + '(' + field.name + ')'">
              <span>{{ field.desc }}</span>
            </div>
            <div v-if="field.type === 'JsonArray'" class="ts-table-wrapper-div">
              <TsTable
                v-if="getFieldValue(field.name)"
                :fixedHeader="false"
                :theadList="getFieldTheadList(field)"
                :tbodyList="getFieldValue(field.name)"
              >
                <template v-for="(head, hindex) in getFieldTheadList(field)" :slot="head.key" slot-scope="scope">
                  <div :key="hindex">
                    <span :id="field.name + '_' + scope.index + '_' + head.key" :class="getFieldClass(field.name + '.' + scope.index + '.' + head.key)" style="word-break:break-all;white-space:normal">{{ scope.row[head.key] }}</span>
                  </div>
                </template>
              </TsTable>
              <span v-else>-</span>
            </div>
            <div v-else-if="field.type === 'JsonObject'" class="ts-table-wrapper-div">
              <TsTable
                v-if="!$utils.isEmpty(getFieldValue(field.name))"
                :fixedHeader="false"
                :theadList="getFieldTheadList(field)"
                :tbodyList="[getFieldValue(field.name)]"
              >
                <template v-for="(head, hindex) in getFieldTheadList(field)" :slot="head.key" slot-scope="scope">
                  <div :key="hindex">
                    <span :id="field.name + '_' + scope.index + '_' + head.key" :class="getFieldClass(field.name + '.' + scope.index + '.' + head.key)" style="word-break:break-all;white-space:normal">{{ scope.row[head.key] }}</span>
                  </div>
                </template>
              </TsTable>
              <span v-else>-</span>
            </div>
            <div v-else class="content">
              <span :id="field.name" :class="getFieldClass(field.name)">{{ getFieldValue(field.name) == null ? '-' : getFieldValue(field.name) }}</span>
            </div>
          </div>
        </div>
        <NoData v-if="$utils.isEmpty(outlineData) && $utils.isEmpty(fieldList)"></NoData>
      </template>
    </TsContain>
    <!-- 历史报告 -->
    <!--<HistoryDialog v-if="isHistoryDialogShow && searchParam.resourceId" :resourceId="searchParam.resourceId" @close="isHistoryDialogShow = false"></HistoryDialog>-->
  </div>
</template>
<script>
import download from '@/resources/directives/download.js';

export default {
  name: '',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable.vue'], resolve),
    //HistoryDialog: resolve => require(['./history-dialog.vue'], resolve),
    HistoryList: resolve => require(['./history-list.vue'], resolve)
  },
  directives: { download },
  props: {},
  data() {
    return {
      isLoading: false,
      historyHeight: 500,
      isHistoryHide: true,
      searchParam: {},
      reportData: {},
      isHistoryDialogShow: false,
      isDownloading: false,
      currentTarget: '',
      outlineTheadList: [
        {
          title: this.$t('page.level'),
          key: 'level'
        },
        {
          title: this.$t('term.inspect.alarmprompt'),
          key: 'desc'
        },
        {
          title: this.$t('term.inspect.ruleid'),
          key: 'ruleSeq'
        },
        {
          title: this.$t('term.inspect.rulename'),
          key: 'ruleName'
        },
        {
          title: this.$t('term.inspect.applicationofrule'),
          key: 'ruleBelongtoApp'
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.searchParam.resourceId = parseInt(this.$route.params.id);
    //this.searchParam.id = this.$route.query.id; //mongodb中的insection id，查询历史报告时需要使用此参数
    this.getReportData();
    window.addEventListener('resize', this.calcHistoryHeight);
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      this.calcHistoryHeight();
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.calcHistoryHeight);
  },
  destroyed() {},
  methods: {
    calcHistoryHeight() {
      //20是padding之类的高度
      this.historyHeight = document.body.clientHeight - (this.$refs['historyList'] && this.$refs['historyList'].getBoundingClientRect().top) - 20;
    },
    selectHistory(id) {
      if (this.searchParam.id === id) {
        this.searchParam.id = null;
      } else {
        this.searchParam.id = id;
      }
      this.getReportData();
    },
    scrollToTarget(outline) {
      if (!this.currentTarget) {
        const alert = outline.alertList[0];
        this.$utils.jumpTo('#' + alert.path, 'smooth');
        this.currentTarget = alert.path;
      } else {
        let hasFound = false;
        let currentIndex = 0;
        for (let i = 0; i < outline.alertList.length; i++) {
          const alert = outline.alertList[i];
          if (this.currentTarget === alert.path) {
            hasFound = true;
            currentIndex = i;
            break;
          }
        }
        if (!hasFound) {
          this.$utils.jumpTo('#' + outline.alertList[0].path, 'smooth');
          this.currentTarget = outline.alertList[0].path;
        } else {
          if (currentIndex == outline.alertList.length - 1) {
            currentIndex = 0;
          } else {
            currentIndex += 1;
          }
          this.$utils.jumpTo('#' + outline.alertList[currentIndex].path, 'smooth');
          this.currentTarget = outline.alertList[currentIndex].path;
        }
      }
    },
    getFieldClass(fieldpath) {
      if (fieldpath) {
        const fieldName = fieldpath.toLowerCase();
        for (let key in this.fieldAlertLevel) {
          if (key === fieldName || key.startsWith(fieldName + '.')) {
            const alertLevel = this.fieldAlertLevel[key];
            return alertLevel.cssClass;
          }
        }
      }
      return null;
    },
    getReportData() {
      this.isLoading = true;
      this.$api.inspect.assetsInspect
        .getReportList(this.searchParam)
        .then(res => {
          this.reportData = res.Return;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getFieldValue(field) {
      if (this.reportData) {
        if (typeof this.reportData[field] != 'undefined') {
          return this.reportData[field];
        }
      }
      return null;
    },
    getFieldTheadList(field) {
      if (field.subset) {
        return field.subset.map(d => {
          return {
            key: d.name,
            title: d.desc
          };
        });
      }
    },
    toThresholdRuleDetail(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        if (row.flag == 'globalRule') {
          this.$router.push({
            path: '/definition-detail',
            query: {name: row.name, ruleId: row.ruleId }
          });
        } else if (row.flag == 'appRule') {
          this.$router.push({
            path: '/rule-of-threshold-detail',
            query: { name: row.name, ruleId: row.ruleId, appSystemId: row.appSystemId }
          });
        }
      }
    },
    handleRule(item) {
      // ruleSeq规则：
      // 内置：#01，#02，这种0开头的是内置规则
      // 全局规则：#1，#2，#3， 这种小于5000的是全局规则
      // 应用规则：MyApp#5001, YourApp#5002，这种事应用简称开头的是应用规则
      let ruleFlag = '';
      let appRule = item.ruleSeq ? (item.ruleSeq.split('#') ? item.ruleSeq.split('#')[1] : '') : '';
      let globalRule = item.ruleSeq && item.ruleSeq.split('#0') ? item.ruleSeq.split('#0').length : 0;
      if (appRule > 5000) {
        ruleFlag = 'appRule';
      } else if (globalRule == 1) {
        ruleFlag = 'globalRule';
      } else if (globalRule > 1) {
        ruleFlag = 'internalRule';
      }
      return {ruleFlag: ruleFlag, ruleId: appRule};
    }
  },
  filter: {},
  computed: {
    downloadConfig() {
      return type => {
        return {
          url: '/api/binary/inspect/report/export',
          method: 'post',
          params: {
            resourceId: this.searchParam.resourceId,
            id: this.searchParam.id,
            type: type
          },
          changeStatus: status => {
            if (status == 'start') {
              this.isDownloading = true;
            } else if (status == 'success' || status == 'error') {
              this.isDownloading = false;
            }
          }
        };
      };
    },
    fieldAlertLevel() {
      const alertLevelData = {};
      if (this.reportData && this.reportData['_inspect_result']) {
        const inspectResult = this.reportData['_inspect_result'];
        const alertFields = inspectResult['alertFields'];
        const inspectStatus = this.reportData['inspectStatus'];
        if (alertFields && alertFields.length > 0) {
          alertFields.forEach(element => {
            const key = element.alertField
              .replace('$.', '')
              .replace(/\[/g, '.')
              .replace(/\]/g, '')
              .toLowerCase();
            alertLevelData[key] = { level: element.alertLevel };
            if (inspectStatus && inspectStatus[element.alertLevel.toLowerCase()]) {
              const status = inspectStatus[element.alertLevel.toLowerCase()];
              alertLevelData[key]['cssClass'] = status['cssClass'];
            }
          });
        }
      }
      return alertLevelData;
    },
    //需要展示的字段
    fieldList() {
      if (this.reportData && this.reportData.fields) {
        return this.reportData.fields.filter(d => !d.name.startsWith('_'));
      }
      return null;
    },
    //告警概要信息
    outlineData() {
      const outlineData = {};
      if (this.reportData && this.reportData['_inspect_result']) {
        const inspectResult = this.reportData['_inspect_result'];
        const alertList = inspectResult['alerts'];
        const thresholds = inspectResult['thresholds'];
        const inspectStatus = this.reportData['inspectStatus'];

        if (alertList && alertList.length > 0) {
          alertList.forEach(alert => {
            if (!outlineData[alert['ruleLevel']]) {
              outlineData[alert['ruleLevel']] = {
                level: alert['ruleLevel'],
                alertList: []
              };
              if (inspectStatus && inspectStatus[alert['ruleLevel'].toLowerCase()]) {
                const status = inspectStatus[alert['ruleLevel'].toLowerCase()];
                outlineData[alert['ruleLevel']]['name'] = status['text'];
                outlineData[alert['ruleLevel']]['cssClass'] = status['cssClass'];
              }
            }
            const alertList = outlineData[alert['ruleLevel']]['alertList'];
            const outline = {
              level: alert['ruleLevel'],
              path: alert['jsonPath']
                .replace('$.', '')
                .replace(/\./g, '_')
                .replace(/\[/g, '_')
                .replace(/\]/g, ''),
              ruleName: alert['ruleName'],
              fieldValue: alert['fieldValue'],
              flag: this.handleRule(alert).ruleFlag, 
              ruleSeq: alert['ruleSeq'],
              ruleId: this.handleRule(alert).ruleId,
              ruleBelongtoApp: this.handleRule(alert).ruleFlag == 'appRule' ? (alert['ruleSeq'] && alert['ruleSeq'].split('#') ? alert['ruleSeq'].split('#')[0] : '-') : '-', // 规则所属应用
              appSystemId: this.handleRule(alert).ruleFlag == 'appRule' ? (alert['ruleSeq'] && thresholds[alert['ruleSeq']] && thresholds[alert['ruleSeq']]['appSystemId']) : '',
              name: inspectResult['name'],
              thresholds: (thresholds[alert['ruleName']] && thresholds[alert['ruleName']]['rule']) || '-'
            };
            alertList.push(outline);
          });
        }
      }
      return outlineData;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.content-grid {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
  .item-row {
    grid-column-start: 1;
    grid-column-end: 3;
  }
  .item {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 150px auto;
    .title {
      text-align: right;
      padding: 3px;
    }
    .content {
      padding: 3px;
      word-break: break-all;
    }
  }
  .ts-table-wrapper-div {
    width: 100%;
    overflow-y: scroll;
  }
}
</style>
