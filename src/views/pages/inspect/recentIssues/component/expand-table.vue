
<template>
  <div class="job-expand-table-box">
    <TsTable
      :hideAction="false"
      :showPager="false"
      :showTotal="false"
      :theadList="theadList"
      :tbodyList="tbodyList"
      height="auto"
    >
      <template slot="alertLevel" slot-scope="{row}">
        <div class="level-width" :class="getLevelClass(row.alertLevel)">{{ row.alertLevel }}</div>
      </template>
      <template slot="alertObject" slot-scope="{row}">
        <div v-if="typeof row.alertObject == 'string'" class="warnobj-width overflow" :title="row.alertObject">{{ row.alertObject }}</div>
        <ul v-else>
          <li>
            <Tooltip
              transfer
              theme="light"
              max-width="400"
            >
              <div class="warnobj-width overflow"> {{ getWarnString(row.alertObject) }}</div>
              <div slot="content">
                <div v-for="(item, index) in getWarnList(row.alertObject)" :key="index" class="pb-xs">
                  {{ item.text }}：{{ item.value }}
                </div>
              </div>
            </Tooltip>
          </li>
        </ul>
      </template>
      <template slot="ruleName" slot-scope="{row}">
        <Poptip v-if="row.flag == 'internalRule'" :title="$t('page.rule')" :content="row.alertRule">
          <span class="text-href">{{ row.alertTips }}</span>
        </Poptip>
        <span v-else class="text-href" @click="toInspectionDetail(row)">{{ row.alertTips }}</span>
      </template>
    </TsTable>
  </div>
</template>
<script>
export default {
  name: 'ExpandTable', // 内嵌表格
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  filters: {
  },
  props: {
    inspectResultList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      tbodyList: [],
      theadList: [
        {
          title: this.$t('page.level'),
          key: 'alertLevel',
          type: 'slot',
          width: 60
        },
        {
          title: this.$t('term.inspect.alarmprompt'),
          key: 'alertTips',
          maxLength: 100
        },
        {
          title: this.$t('term.inspect.alarmobjectvalue'),
          key: 'alertValue',
          maxLength: 50
        },
        {
          title: this.$t('term.inspect.alarmobject'),
          key: 'alertObject'
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
          key: 'appSystemName'
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
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getLevelClass(level) {
      let cssClass = {
        normal: 'text-success', // 正常
        warn: 'text-warning', // 告警
        critical: 'text-error', // 严重
        fatal: 'text-error' // 致命
      };
      return level ? cssClass[level.toLowerCase()] : '';
    },
    getWarnString(warnObj) {
      let warnStr = '';
      if (!this.$utils.isEmptyObj(warnObj)) {
        for (let key in warnObj) {
          warnStr += key ? `${[key]}: ${warnObj[key]},` : '';
        }
      }
      return warnStr;
    },
    getWarnList(warnObj) {
      let warnList = [];
      if (!this.$utils.isEmptyObj(warnObj)) {
        for (let key in warnObj) {
          warnList.push({
            text: key,
            value: warnObj[key]
          });
        }
      }
      return warnList;
    },
    toInspectionDetail(row) {
      if (row && !this.$utils.isEmptyObj(row)) {
        if (row.flag == 'globalRule') {
          // 跳转到全局阈值规则页面
          this.$router.push({
            path: '/definition-detail',
            query: {name: row.collectionName, ruleId: row.ruleId }
          });
        } else if (row.flag == 'appRule') {
          // 跳转到应用阈值规则页面
          this.$router.push({
            path: '/rule-of-threshold-detail',
            query: { name: row.collectionName, ruleId: row.ruleId, appSystemId: row.appSystemId}
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
  computed: {},
  watch: {
    inspectResultList: {
      handler(list) {
        this.tbodyList = [];
        if (list && !this.$utils.isEmpty(list)) {
          list.forEach((item) => {
            if (item) {
              this.tbodyList.push({
                ...item,
                flag: this.handleRule(item).ruleFlag,
                ruleId: this.handleRule(item).ruleId,
                appSystemName: this.handleRule(item).ruleFlag == 'appRule' ? (item.ruleSeq.split('#') && item.ruleSeq.split('#')[0]) : '-'
              });
            }
          });
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>

<style lang="less" scoped>
.job-expand-table-box {
    &.tstable-container .tstable-body th  {
    height: 32px !important;
  }
  .level-width {
    width: 60px;
  }
  .warnobj-width {
    width: 200px;
  }
}
</style>
