<template>
  <div ref="codeScanContent" :style="{height: remainHeight + 'px', overflowY: 'auto'}">
    <Loading
      :loadingShow="loadingShow"
      type="fix"
    ></Loading>
    <header class="bg-op radius-lg pt-nm pl-nm pr-nm">
      <TsRow :gutter="16">
        <Col
          v-for="(item, index) in textList"
          :key="index"
          :xs="12"
          :sm="8"
          :md="6"
          :lg="4"
          :xl="4"
          :xxl="4"
          class="mb-nm"
        >
          <div class="text-grey mb-xs">{{ item.label }}</div>
          <div>{{ item.value || '-' }}</div>
        </Col>
      </TsRow>
    </header>
    <article class="mt-nm">
      <TsRow :gutter="16">
        <Col
          :xs="12"
          :sm="8"
          :md="8"
          :lg="8"
          :xl="8"
          :xxl="6"
        >
          <div class="bg-op radius-lg padding chart-height">
            <PieChart
              :title="$t('term.deploy.thelatestcodeproblem')"
              :axiosParams="{ versionId: versionId, name: 'code_scan',
                              chart: 'last_code_issue' }"
            ></PieChart>
          </div>
        </Col>
        <Col
          :xs="12"
          :sm="8"
          :md="8"
          :lg="8"
          :xl="8"
          :xxl="12"
        >
          <div class="bg-op radius-lg padding chart-height">
            <LineChart
              :title="$t('term.deploy.latestfifthcommentratestatistics')"
              :axiosParams="{versionId: versionId, name: 'code_scan',
                             chart: 'last_five_annotation_rate'}"
            ></LineChart>
          </div>
        </Col>
        <Col
          :xs="12"
          :sm="8"
          :md="8"
          :lg="8"
          :xl="8"
          :xxl="6"
        >
          <div class="bg-op radius-lg padding chart-height">
            <BarChart
              :title="$t('term.deploy.thelatestfivecodestatistics')"
              :axiosParams="{versionId: versionId, name: 'code_scan',
                             chart: 'last_five_code_statistics'}"
            ></BarChart>
          </div>
        </Col>
      </TsRow>
      <TsRow :gutter="16" class="mt-nm">
        <Col
          :xs="12"
          :sm="12"
          :md="12"
          :lg="12"
          :xl="12"
          :xxl="12"
        >
          <div class="bg-op radius-lg padding chart-height">
            <LineChart
              :title="$t('term.deploy.codequalitytrend')"
              :axiosParams="{versionId: versionId, name: 'code_scan',
                             chart: 'code_quality_trend'}"
            ></LineChart>
          </div>
        </Col>
        <Col
          :xs="12"
          :sm="12"
          :md="12"
          :lg="12"
          :xl="12"
          :xxl="12"
        >
          <div class="bg-op radius-lg padding chart-height">
            <LineChart
              :title="$t('term.deploy.coderepeatability')"
              :axiosParams="{versionId: versionId, name: 'code_scan',
                             chart: 'code_repeatability'}"
            ></LineChart>
          </div>
        </Col>
      </TsRow>
    </article>
  </div>
</template>
<script>
import * as components from './charts/index.js';
export default {
  name: '',
  components: {
    ...components
  },
  props: {
    versionId: {
      // 版本ID
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loadingShow: true,
      lastCodeTestResult: '', // 最新一次代码测试结果
      remainHeight: 100,
      textList: [
        {
          label: this.$t('term.autoexec.executiontime'),
          textName: 'buildTime',
          value: ''
        },
        {
          label: this.$t('term.deploy.massvalve'),
          textName: 'alertStatus',
          value: ''
        },
        {
          label: this.$t('term.deploy.totalproblem'),
          textName: 'totalProblem',
          value: ''
        },
        {
          label: this.$t('term.deploy.newaddproblem'),
          textName: 'newAddProblem',
          value: ''
        },
        {
          label: this.$t('term.deploy.bugs'),
          textName: 'bugs',
          value: ''
        },
        {
          label: this.$t('term.deploy.newbugs'),
          textName: 'newBugs',
          value: ''
        },
        {
          label: this.$t('term.deploy.newreliabilityrating'),
          textName: 'newReliabilityRating',
          value: ''
        },
        {
          label: this.$t('term.deploy.overallvulnerability'),
          textName: 'vulnerabilities',
          value: ''
        },
        {
          label: this.$t('term.deploy.overallvulnerability'),
          textName: 'newVulnerabilities',
          value: ''
        },
        {
          label: this.$t('term.deploy.debt'),
          textName: 'sqaleIndex',
          value: ''
        },
        {
          label: this.$t('term.deploy.newdebt'),
          textName: 'newTechnicalDebt',
          value: ''
        },
        {
          label: this.$t('term.deploy.maintainablerateofnewcode'),
          textName: 'newMaintainabilityRating',
          value: ''
        },
        {
          label: this.$t('term.deploy.overallcodeflavor'),
          textName: 'codeSmells',
          value: ''
        },
        {
          label: this.$t('term.deploy.overallsecurityhotspot'),
          textName: 'securityHotspots',
          value: ''
        },
        {
          label: this.$t('term.deploy.newcodeodor'),
          textName: 'newCodeSmells',
          value: ''
        },
        {
          label: this.$t('term.deploy.newsecurityhotspot'),
          textName: 'newSecurityHotspots',
          value: ''
        },
        {
          label: this.$t('term.deploy.numberofnewlinesofcode'),
          textName: 'newLines',
          value: ''
        },
        {
          label: this.$t('term.deploy.totallinesofcode'),
          textName: 'lines',
          value: ''
        },
        {
          label: this.$t('term.deploy.validlineofcode'),
          textName: 'ncloc',
          value: ''
        },
        {
          label: this.$t('term.deploy.linecommentrate'),
          textName: 'commentLinesDensity',
          value: ''
        },
        {
          label: this.$t('term.deploy.apicommentrate'),
          textName: 'publicDocumentedApiDensity',
          value: ''
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getTestRecordList();
  },
  beforeMount() {},
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.codeScanContent) {
        this.remainHeight = window.innerHeight - this.$refs.codeScanContent.getBoundingClientRect().top - 16;
      }
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getTestRecordList() {
      // 获取最后一次单元测试记录数据
      if (this.versionId) {
        const addPercentFieldList = ['newReliabilityRating', 'newMaintainabilityRating', 'commentLinesDensity', 'publicDocumentedApiDensity']; // 添加百分比符号列表
        this.$api.deploy.version.getCodeScanRecord({versionId: this.versionId}).then((res) => {
          if (res && res.Status == 'OK') {
            let testRecordConfig = res.Return ? {...res.Return[0]} : {};
            this.textList && this.textList.forEach((item) => {
              if (item && testRecordConfig.hasOwnProperty(item.textName)) {
                if (item.textName == 'buildTime') {
                  this.$set(item, 'value', this.$utils.getDateByFormat(testRecordConfig[item.textName]));
                } else if (item.textName == 'alertStatus') {
                  this.$set(item, 'value', testRecordConfig[item.textName] == 'ERROR' ? this.$t('page.error') : this.$t('page.normal'));
                } else if (addPercentFieldList.includes(item.textName)) {
                  this.$set(item, 'value', testRecordConfig[item.textName] + '%');
                } else {
                  this.$set(item, 'value', testRecordConfig[item.textName]);
                }
              } else {
                if (item.textName == 'totalProblem') {
                  // 总体问题(阻断/严重/主要)
                  this.$set(item, 'value', `${testRecordConfig['blockerViolations'] || 0}/${testRecordConfig['criticalViolations'] || 0}/${testRecordConfig['majorViolations'] || 0}`);
                } else if (item.textName == 'newAddProblem') {
                  // 新增问题(阻断/严重/主要)
                  this.$set(item, 'value', `${testRecordConfig['newBlockerViolations'] || 0}/${testRecordConfig['newCriticalViolations'] || 0}/${testRecordConfig['newMajorViolations'] || 0}`);
                }
              }
            });
          }
        }).finally(() => {
          this.loadingShow = false;
        });
      } else {
        this.loadingShow = false;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.chart-height {
  height: 300px;
}
</style>
