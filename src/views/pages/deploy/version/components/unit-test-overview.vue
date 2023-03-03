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
          :sm="12"
          :md="12"
          :lg="12"
          :xl="8"
          :xxl="6"
          class="mb-nm"
        >
          <div class="bg-op radius-lg padding chart-height">
            <PieChart
              :axiosParams="{ versionId: versionId, name: 'unit_test',
                              chart: 'last_code_test_result' }"
              title="最新一次代码测试结果"
            ></PieChart>
          </div>
        </Col>
        <Col
          :xs="12"
          :sm="12"
          :md="12"
          :lg="12"
          :xl="8"
          :xxl="12"
          class="mb-nm"
        >
          <div class="bg-op radius-lg padding chart-height">
            <LineChart
              :axiosParams="{versionId: versionId, name: 'unit_test',
                             chart: 'last_five_incremental_coverage_rate'}"
              title="最新五次增量覆盖率(%)"
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
          class="mb-nm"
        >
          <div class="bg-op radius-lg padding chart-height">
            <BarChart
              :axiosParams="{versionId: versionId, name: 'unit_test',
                             chart: 'last_five_full_coverage_rate'}"
              title="最新五次全量覆盖率(%)"
            ></BarChart>
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
          label: '成功率[成功/失败]',
          textName: 'testSuccessDensity',
          value: ''
        },
        {
          label: '全量分支覆盖率',
          textName: 'branchCoverage',
          value: ''
        },
        {
          label: '增量分支覆盖率',
          textName: 'newBranchCoverage',
          value: ''
        },
        {
          label: '全量行覆盖率',
          textName: 'lineCoverage',
          value: ''
        },
        {
          label: '增量行覆盖率',
          textName: 'newLineCoverage',
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
        this.$api.deploy.version.getLastUnitTestRecord({versionId: this.versionId}).then((res) => {
          if (res && res.Status == 'OK') {
            let testRecordConfig = res.Return ? {...res.Return[0]} : {};
            this.textList && this.textList.forEach((item) => {
              if (item && testRecordConfig.hasOwnProperty(item.textName)) {
                if (item.textName == 'buildTime') {
                  this.$set(item, 'value', this.$utils.getDateByFormat(testRecordConfig[item.textName]));
                } else if (item.textName == 'testSuccessDensity') {
                  this.$set(item, 'value', testRecordConfig[item.textName] + '%' + '[0/1]');
                } else {
                  this.$set(item, 'value', testRecordConfig[item.textName] + '%');
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
