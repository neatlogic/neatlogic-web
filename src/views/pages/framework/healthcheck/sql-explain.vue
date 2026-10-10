<template>
  <div class="sql-plan border-radius">
    <div class="text-tip mb-md">{{ $t('term.framework.sqlplansubtitle') }}</div>
    <div class="text-tip mb-md">{{ $t('page.database') }}：{{ explainData.databaseName || '—' }}</div>
    <section class="border-base radius-md bg-op mb-md">
      <div class="flex-between padding-sm">
        <strong>{{ $t('term.framework.sqlsstatement') }}</strong>
        <span v-if="sql" class="tsfont-copy text-action" @click="copySql">{{ $t('term.framework.sqlplancopysql') }}</span>
      </div>
      <TsCodemirror
        :value="formattedSql"
        :isReadOnly="true"
        :lineNumbers="true"
        codeMode="sql"
        height="170px"
      ></TsCodemirror>
    </section>
    <template v-if="canAnalyze">
      <div class="sql-plan-summary mb-md">
        <section class="border-base radius-md bg-op padding-sm">
          <div class="text-tip mb-xs">{{ $t('term.framework.sqlplanaccesstables') }}</div>
          <strong class="fz20 text-info">{{ analysis.tableNames.length }}</strong>
          <div class="text-tip mt-xs sql-plan-break">{{ analysis.tableNames.join(' · ') || '—' }}</div>
        </section>
        <section class="border-base radius-md bg-op padding-sm">
          <div class="text-tip mb-xs">{{ $t('term.framework.sqlplanindexaccess') }}</div>
          <strong class="fz20 text-success">{{ analysis.indexedRows.length }} / {{ analysis.accessRows.length }}</strong>
          <div class="text-tip mt-xs">{{ $t('term.framework.sqlplanindexaccesshint') }}</div>
        </section>
        <section class="border-base radius-md bg-op padding-sm">
          <div class="text-tip mb-xs">{{ $t('term.framework.sqlplantemporary') }}</div>
          <strong class="fz20" :class="analysis.temporaryRows.length ? 'text-warning' : 'text-success'">{{ analysis.temporaryRows.length }}</strong>
          <div class="text-tip mt-xs">{{ $t('term.framework.sqlplantemporaryhint') }}</div>
        </section>
      </div>
      <div class="sql-plan-middle mb-md">
        <section class="border-base radius-md bg-op padding-sm">
          <div class="flex-between mb-sm">
            <strong class="tsfont-zirenwu">{{ $t('term.framework.sqlplanaccesspath') }}</strong>
            <span class="text-tip fz10">{{ $t('term.framework.sqlplanpathhint') }}</span>
          </div>
          <SqlExplainGraph
            :planJson="explainData.planJson"
            :rows="rows"
            :theadList="explainData.theadList"
          ></SqlExplainGraph>
        </section>
        <section class="border-base radius-md bg-op padding-sm">
          <strong class="tsfont-zirenwu">{{ $t('term.framework.sqlplanobservations') }}</strong>
          <div v-if="analysis.indexedRows.length" class="mt-md">
            <div class="text-success tsfont-check">{{ $t('term.framework.sqlplanindexobserved', { count: analysis.indexedRows.length }) }}</div>
            <div class="text-tip mt-xs sql-plan-break">{{ indexNames.join(' · ') }}</div>
          </div>
          <div v-if="analysis.temporaryRows.length" class="mt-md">
            <div class="text-warning tsfont-warning-o">{{ $t('term.framework.sqlplantemporaryobserved', { count: analysis.temporaryRows.length }) }}</div>
            <div class="text-tip mt-xs">{{ $t('term.framework.sqlplantemporarynote') }}</div>
          </div>
          <div v-if="analysis.filesortRows.length" class="mt-md">
            <div class="text-warning tsfont-warning-o">{{ $t('term.framework.sqlplanfilesortobserved', { count: analysis.filesortRows.length }) }}</div>
            <div class="text-tip mt-xs">{{ $t('term.framework.sqlplanfilesortnote') }}</div>
          </div>
          <div v-if="analysis.fullScanRows.length" class="mt-md">
            <div class="text-warning tsfont-warning-o">{{ $t('term.framework.sqlplanfullscanobserved', { count: analysis.fullScanRows.length }) }}</div>
            <div class="text-tip mt-xs">{{ $t('term.framework.sqlplanfullscannote') }}</div>
          </div>
          <div class="text-tip tsfont-info-o mt-md">{{ $t('term.framework.sqlplanobservationnote') }}</div>
        </section>
      </div>
    </template>
    <div v-else-if="rows.length" class="text-tip mb-md">{{ $t('term.framework.sqlplanfallback') }}</div>
    <section class="border-base radius-md bg-op padding-sm">
      <div class="flex-between mb-sm">
        <strong class="tsfont-zirenwu">{{ $t('term.framework.sqlplanrawdetails') }}</strong>
        <Poptip
          v-if="canAnalyze"
          placement="left"
          width="460"
          transfer
        >
          <span class="tsfont-info-o text-action">{{ $t('term.framework.sqlplanfieldhelp') }}</span>
          <div slot="content" class="sql-plan-help">
            <div v-for="field in fieldNames" :key="field" class="mb-sm">
              <strong>{{ field }}</strong>
              <div class="text-tip">{{ $t('term.framework.sqlplanfield' + field.toLowerCase()) }}</div>
            </div>
          </div>
        </Poptip>
      </div>
      <!-- 原始EXPLAIN字段完整保留，宽表通过水平滚动查看。 -->
      <div v-if="rows.length" class="sql-plan-table">
        <div :class="{ 'sql-plan-table-inner': tableData.theadList.length >= 9 }">
          <TsTable
            v-bind="tableData"
            :showPager="false"
            :canResize="false"
            :fixedHeader="false"
          >
            <template v-for="header in tableData.theadList" :slot="header.key" slot-scope="{ index }">
              <span :key="header.key" class="sql-plan-break">{{ displayValue(getField(rows[index], header.key)) }}</span>
            </template>
          </TsTable>
        </div>
      </div>
      <NoData v-else></NoData>
    </section>
  </div>
</template>
<script>
import { analyzeExplain, formatSqlForDisplay, readExplainField } from './sql-explain-utils';

const EXPLAIN_FIELDS = ['id', 'select_type', 'table', 'partitions', 'type', 'possible_keys', 'key', 'key_len', 'ref', 'rows', 'filtered', 'Extra'];

export default {
  name: 'SqlExplain',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    SqlExplainGraph: () => import('./sql-explain-graph.vue')
  },
  props: {
    sql: { type: String, default: '' },
    database: { type: String, default: '' },
    explainData: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  methods: {
    getField: readExplainField,
    displayPercent(value) {
      // 缺失过滤率显示占位符，不拼接百分号。
      return value === null || value === undefined || value === '' ? '—' : value + '%';
    },
    copySql() {
      // 复制原始SQL，展示格式化不会改写实际查询文本。
      this.$utils.copyText(null, this.sql);
    },
    displayValue(value) {
      // EXPLAIN空字段用占位符展示，数值0必须保留。
      return value === null || value === undefined || value === '' ? '—' : value;
    }
  },
  computed: {
    rows() {
      return Array.isArray(this.explainData.tbodyList) ? this.explainData.tbodyList : [];
    },
    formattedSql() {
      return formatSqlForDisplay(this.sql);
    },
    analysis() {
      return analyzeExplain(this.rows, this.explainData.theadList);
    },
    canAnalyze() {
      // 可视化仅解释MySQL字段；其他数据库和缺少必要字段的结果保留原表展示。
      return /mysql|mariadb/i.test(this.database) && this.analysis.supported;
    },
    indexNames() {
      return [...new Set(this.analysis.indexedRows.map(row => readExplainField(row, 'key')))];
    },
    fieldNames() {
      return EXPLAIN_FIELDS;
    },
    tableData() {
      // 表头只补充显示宽度，不修改接口原始行及字段定义。
      let headers = Array.isArray(this.explainData.theadList) ? this.explainData.theadList : [];
      // 缺失表头时按返回行的实际字段生成列，未知数据库仍不丢失原始结果。
      if (!headers.length) {
        const names = [...new Set(this.rows.flatMap(row => Object.keys(row || {})))];
        headers = names.map(key => ({ key, title: key }));
      }
      return {
        ...this.explainData,
        theadList: headers.map(header => ({ ...header, width: header.width || (header.key === 'Extra' ? 220 : 115) })),
        // 查询块id可能重复或为空，为表格渲染单独生成唯一键；所有单元格仍读取原始行。
        tbodyList: this.rows.map((row, index) => ({ ...row, uuid: 'sql-explain-row-' + index }))
      };
    }
  }
};
</script>
<style lang="less" scoped>
/* 概览和观察区域无对应公共网格布局，颜色沿用公共主题类。 */
.sql-plan-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.sql-plan-middle {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 12px;
}
.sql-plan-break {
  overflow-wrap: anywhere;
}
.sql-plan-table {
  overflow-x: auto;
}
.sql-plan-table-inner {
  min-width: 1460px;
}
.sql-plan-help {
  max-height: 360px;
  overflow-y: auto;
}
/* 只读表示禁止编辑，不降低SQL代码的阅读对比度。 */
::v-deep .tscodemirror.disabled .CodeMirror-line {
  opacity: 1;
}
@media (max-width: 760px) {
  .sql-plan-middle {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
