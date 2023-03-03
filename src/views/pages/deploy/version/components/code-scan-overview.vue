<template>
  <div>
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
              title="最新一次代码问题"
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
              title="最新五次注释率统计(%)"
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
              title="最新五次代码统计"
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
              title="bug/漏洞/代码异味趋势图"
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
              title="重复度趋势图"
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
      lastCodeTestResult: '', // 最新一次代码测试结果
      textList: [
        {
          label: '执行时间',
          textName: 'buildTime',
          value: ''
        },
        {
          label: '质量阀',
          textName: 'alertStatus',
          value: ''
        },
        {
          label: '总体问题(阻断/严重/主要)',
          textName: 'totalProblem',
          value: ''
        },
        {
          label: '新增问题(阻断/严重/主要)',
          textName: 'newAddProblem',
          value: ''
        },
        {
          label: '总体Bugs',
          textName: 'bugs',
          value: ''
        },
        {
          label: '新增Bugs',
          textName: 'newBugs',
          value: ''
        },
        {
          label: '新代码可靠率',
          textName: 'newReliabilityRating',
          value: ''
        },
        {
          label: '总体漏洞',
          textName: 'vulnerabilities',
          value: ''
        },
        {
          label: '总体漏洞',
          textName: 'newVulnerabilities',
          value: ''
        },
        {
          label: '债务',
          textName: 'sqaleIndex',
          value: ''
        },
        {
          label: '新增债务',
          textName: 'newTechnicalDebt',
          value: ''
        },
        {
          label: '新代码可维护率',
          textName: 'newMaintainabilityRating',
          value: ''
        },
        {
          label: '总体代码味道',
          textName: 'codeSmells',
          value: ''
        },
        {
          label: '总体安全热点',
          textName: 'securityHotspots',
          value: ''
        },
        {
          label: '新增代码异味',
          textName: 'newCodeSmells',
          value: ''
        },
        {
          label: '新增安全热点',
          textName: 'newSecurityHotspots',
          value: ''
        },
        {
          label: '新增代码行数',
          textName: 'newLines',
          value: ''
        },
        {
          label: '代码总行数',
          textName: 'lines',
          value: ''
        },
        {
          label: '代码有效行',
          textName: 'ncloc',
          value: ''
        },
        {
          label: '行注释率',
          textName: 'commentLinesDensity',
          value: ''
        },
        {
          label: 'API注释率',
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
  mounted() {},
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
                  this.$set(item, 'value', testRecordConfig[item.textName] == 'ERROR' ? '错误' : '正常');
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
        });
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
