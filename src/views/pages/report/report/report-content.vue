<template>
  <div class="report-content">
    <Alert>
      <div class="report-content-top">
        <div class="report-content-help">
          <Poptip
            v-if="editMode === 'xml'"
            v-model="isHelpShow"
            trigger="hover"
            placement="right"
            width="800"
            :transfer="true"
            :title="$t('term.report.datasourceconfigexample')"
          >
            <a href="javascript:void(0)">{{ $t('term.report.datasourceconfigexample') }}</a>
            <div slot="content" style="height:600px;">
              <div>
                <Tag><strong>&lt;</strong><i class="text-grey tsfont-arrow-right"></i><strong>&amp;lt;</strong></Tag>
                <Tag><strong>&gt;</strong><i class="text-grey tsfont-arrow-right"></i><strong>&amp;gt;</strong></Tag>
                <Tag><strong>&</strong><i class="text-grey tsfont-arrow-right"></i><strong>&amp;amp;</strong></Tag>
                <Tag><strong>"</strong><i class="text-grey tsfont-arrow-right"></i><strong>&amp;quot;</strong></Tag>
                <Tag><strong>'</strong><i class="text-grey tsfont-arrow-right"></i><strong>&amp;apos;</strong></Tag>
              </div>
              <TsCodemirror
                ref="datasourceHelp"
                :value="datasourceHelp"
                codeMode="xml"
                :isReadOnly="true"
              ></TsCodemirror>
            </div>
          </Poptip>
        </div>
        <div v-if="editMode === 'graph' && isSyncingSqlGraph" class="report-content-query action-group">
          <div v-if="isSyncingSqlGraph" class="action-item text-grey">
            <Icon type="ios-loading" size="14" class="loading"></Icon>
            {{ $t('term.report.configsyncing') }}
          </div>
        </div>
        <RadioGroup v-model="editMode" type="button" @on-change="changeEditMode">
          <Radio label="xml">XML</Radio>
          <Radio label="graph">Graph</Radio>
        </RadioGroup>
      </div>
    </Alert>
    <div v-if="editMode === 'xml' && reportData.paramList && reportData.paramList.length > 0" class="mb-xs">
      <i
        v-for="(param, index) in reportData.paramList"
        :key="index"
        v-clipboard="param.name"
        v-clipboard:success="clipboardSuc"
        class="ivu-tag ivu-tag-size-default ivu-tag-default ivu-tag-checked"
      >{{ param.label }}({{ param.name }})</i>
    </div>
    <div v-if="sqlGraphSyncErrorList.length > 0" class="text-error mb-xs">
      <div v-for="(error, index) in sqlGraphSyncErrorList" :key="index">{{ error }}</div>
    </div>
    <div v-if="editMode === 'xml'">
      <TsCodemirror
        codeMode="xml"
        :value.sync="sql"
        height="500px"
      ></TsCodemirror>
    </div>
    <div v-else class="sqlgraph-layout">
      <div class="sqlgraph-left border-base-right">
        <div class="search-box">
          <Input
            v-model="tableKeyword"
            search
            clearable
            :placeholder="$t('term.report.searchtable')"
            @on-search="searchTable"
            @on-clear="searchTable"
          ></Input>
        </div>
        <div class="table-list">
          <div
            v-for="table in tableList"
            :key="table.moduleId + '_' + table.name"
            class="table-item border-base-bottom"
            @mousedown.stop="startDragTable(table, $event)"
            @dblclick="addTable(table)"
          >
            <div class="overflow">
              <div class="text-title overflow">{{ table.label || table.name }}</div>
              <div class="text-grey overflow">{{ table.moduleId }} · {{ table.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="sqlgraph-center">
        <ReportEditor
          ref="reportEditor"
          v-model="graphData"
          height="calc(100vh - 260px)"
          @node:selected="selectNode"
          @node:unselected="clearSelected"
          @edge:selected="selectEdge"
          @edge:unselected="clearSelected"
          @join:change="syncGraphConfig"
          @change="changeGraph"
        ></ReportEditor>
      </div>
      <div class="sqlgraph-right border-base-left">
        <div v-if="selectedNodeData" class="right-section">
          <div class="section-title">{{ selectedNodeData.alias }} · {{ selectedNodeData.tableName }}</div>
          <CheckboxGroup v-model="selectedFieldKeyList" @on-change="changeSelectedFields">
            <Checkbox
              v-for="field in selectedNodeData.fields"
              :key="selectedNodeData.alias + '.' + field.name"
              :label="selectedNodeData.alias + '.' + field.name"
            >
              {{ field.name }}
            </Checkbox>
          </CheckboxGroup>
        </div>
        <div v-if="selectedEdge" class="right-section">
          <div class="section-title">JOIN</div>
          <Select v-model="selectedJoinData.joinType" @on-change="updateSelectedJoin">
            <Option value="INNER JOIN">INNER JOIN</Option>
            <Option value="LEFT JOIN">LEFT JOIN</Option>
          </Select>
          <Select
            v-model="selectedJoinData.sourceField"
            class="mt-xs"
            filterable
            clearable
            transfer
            :placeholder="$t('term.report.sourcefield')"
            @on-change="updateSelectedJoin"
          >
            <Option
              v-for="field in sourceJoinFieldList"
              :key="'source_' + field.name"
              :value="field.name"
              :label="field.name"
            >
              <span>{{ field.name }}</span>
              <span class="text-grey join-field-type">{{ field.type }}</span>
            </Option>
          </Select>
          <Select
            v-model="selectedJoinData.targetField"
            class="mt-xs"
            filterable
            clearable
            transfer
            :placeholder="$t('term.report.targetfield')"
            @on-change="updateSelectedJoin"
          >
            <Option
              v-for="field in targetJoinFieldList"
              :key="'target_' + field.name"
              :value="field.name"
              :label="field.name"
            >
              <span>{{ field.name }}</span>
              <span class="text-grey join-field-type">{{ field.type }}</span>
            </Option>
          </Select>
        </div>
        <div v-if="!isGraphComponentSelected && paramOptionList.length > 0" class="right-section">
          <ReportFilterList
            :value="queryConfig.filters"
            :fieldList="graphFieldOptionList"
            :paramList="paramOptionList"
            @change="changeFilters"
          ></ReportFilterList>
        </div>
        <div v-if="!isGraphComponentSelected" class="right-section">
          <ReportOrderList
            :value="queryConfig.orders"
            :fieldList="graphFieldOptionList"
            @change="changeOrders"
          ></ReportOrderList>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
import TsCodemirror from '@/resources/plugins/TsCodemirror/TsCodemirror.vue';
import ReportEditor from './sqlgraph/report-editor.vue';
import ReportFilterList from './sqlgraph/report-filter-list.vue';
import ReportOrderList from './sqlgraph/report-order-list.vue';
import { replaceToken, tokenizeContent } from './contenteditor/content-tokenizer';

const DEFAULT_QUERY_ID = 'queryData';
const DEFAULT_QUERY_LABEL_KEY = 'term.report.querydata';

export default {
  name: '',
  components: {
    TsCodemirror,
    ReportEditor,
    ReportFilterList,
    ReportOrderList
  },
  directives: { clipboard },
  props: {
    reportData: { type: Object }
  },
  data() {
    return {
      isHelpShow: false,
      editMode: this.getDefaultEditMode(this.reportData),
      sql: this.reportData.sql,
      tableKeyword: '',
      tableList: [],
      graphData: { version: 1, nodes: [], joins: [] },
      selectedNodeData: null,
      selectedEdge: null,
      selectedJoinData: {},
      syncSequence: 0,
      sqlGraphSyncErrorList: [],
      isSyncingSqlGraph: false,
      queryConfig: {
        id: DEFAULT_QUERY_ID,
        label: this.$t(DEFAULT_QUERY_LABEL_KEY),
        fields: [],
        filters: [],
        orders: [],
        page: {
          needPage: false,
          pageSize: 20
        }
      },
      datasourceHelp:
        `<mapper>
          <resultMap id="dataMap" type="java.util.LinkedHashMap">
            <id column="id" property="${this.$t('term.report.taskid')}"/>
            <result column="title" property="${this.$t('page.title')}"/>
            <result column="status" property="${this.$t('page.status')}"/>
            <result column="start_time" property="${this.$t('page.reportingtime')}"/>
            <result column="end_time" property="${this.$t('page.completetime')}"/>
            <result column="owner" property="${this.$t('page.informant')}"/>
            <result column="serial_number" property="${this.$t('page.workordernumber')}"/>
            <collection property="stepList" javaType="java.util.List" ofType="java.util.LinkedHashMap">
              <id column="stepId" property="${this.$t('term.report.stepid')}"/>
              <result column="name" property="${this.$t('term.report.stepname')}"/>
            </collection>
          </resultMap>
          <select id="getProcessTaskList" resultMap="dataMap">
            SELECT
              a.id,
              a.title,
              a.status,
              a.start_time,
              a.end_time,
              a.owner,
              a.serial_number,
              b.id AS stepId,
              b.name
            FROM processtask a
            JOIN processtask_step b
            <where>
              <if test="keyword != null and keyword != ''">
                AND a.title LIKE CONCAT('%',#{keyword},'%')
              </if>
              <if test="statusList != null and statusList.size() > 0">
                AND a.status IN
                <foreach collection="statusList" item="status" open="(" separator="," close=")">
                  #{status}
                </foreach>
              </if>
              <if test="startTimeRange != null and startTimeRange.size() > 1">
                AND a.start_time &gt;= startTimeRange[0] AND a.start_time &lt;= startTimeRange[1]
              </if>
            </where>
          </select>
        </mapper>`
    };
  },
  created() {
    this.initGraphConfig(this.reportData.sqlGraphConfig);
  },
  mounted() {
    if (this.editMode === 'graph') {
      this.searchTable();
    }
  },
  methods: {
    getDefaultEditMode(reportData) {
      if (reportData && reportData.sqlEditMode) {
        return reportData.sqlEditMode;
      }
      return reportData && reportData.id && reportData.sql ? 'xml' : 'graph';
    },
    initGraphConfig(config) {
      if (!config) {
        this.queryConfig = this.normalizeQueryConfig({
          fields: [],
          filters: [],
          orders: [],
          page: {
            needPage: false,
            pageSize: 20
          }
        });
        this.graphData = { version: 1, nodes: [], joins: [] };
        return;
      }
      try {
        const configObj = typeof config === 'string' ? JSON.parse(config) : config;
        if (configObj.graphData) {
          const query = configObj.queryConfig || ((configObj.queries || [])[0]) || {};
          this.queryConfig = this.normalizeQueryConfig(Object.assign({}, this.queryConfig, query));
          this.graphData = configObj.graphData;
          return;
        }
        this.queryConfig = this.normalizeQueryConfig(Object.assign({}, this.queryConfig, {
          fields: configObj.fields || this.queryConfig.fields,
          filters: configObj.filters || this.queryConfig.filters,
          orders: configObj.orders || this.queryConfig.orders,
          page: configObj.page || this.queryConfig.page
        }));
        this.graphData = configObj;
      } catch (e) {
        this.graphData = { version: 1, nodes: [], joins: [] };
      }
    },
    changeEditMode(mode) {
      this.$emit('setSqlEditMode', mode);
      if (mode === 'graph') {
        this.searchTable();
        this.analyzeXmlToGraph();
      } else if (mode === 'xml') {
        const config = this.buildSqlGraphConfig();
        this.$emit('setSqlGraphConfig', JSON.stringify(config));
        this.buildXmlFromGraph(config);
      }
    },
    searchTable() {
      this.$api.report.report.searchSqlTable({
        keyword: this.tableKeyword,
        needPage: false
      }).then(res => {
        this.tableList = res.Return.tbodyList || [];
      });
    },
    startDragTable(table, event) {
      this.getTableDetail(table).then(tableDetail => {
        this.$refs.reportEditor && this.$refs.reportEditor.startDrag(tableDetail, event);
      });
    },
    addTable(table) {
      this.getTableDetail(table).then(tableDetail => {
        this.$refs.reportEditor && this.$refs.reportEditor.addTableNode(tableDetail);
      });
    },
    getTableDetail(table) {
      return this.$api.report.report.getSqlTable({
        moduleId: table.moduleId,
        name: table.name
      }).then(res => res.Return);
    },
    selectNode(data) {
      this.selectedNodeData = data;
      this.selectedEdge = null;
      this.selectedJoinData = {};
    },
    selectEdge(edge) {
      this.selectedEdge = edge;
      this.selectedNodeData = null;
      this.selectedJoinData = this.$utils.deepClone(edge.getData() || {});
    },
    clearSelected() {
      this.selectedNodeData = null;
      this.selectedEdge = null;
      this.selectedJoinData = {};
    },
    changeGraph(graphData) {
      this.graphData = graphData;
      this.cleanQueryConfigByGraph();
      this.syncGraphConfig();
    },
    changeSelectedFields(fieldKeyList) {
      const currentAlias = this.selectedNodeData.alias;
      this.queryConfig.fields = this.queryConfig.fields.filter(field => field.tableAlias !== currentAlias);
      fieldKeyList.forEach(fieldKey => {
        const fieldName = fieldKey.split('.')[1];
        const field = (this.selectedNodeData.fields || []).find(item => item.name === fieldName);
        this.queryConfig.fields.push({
          tableAlias: currentAlias,
          fieldName: fieldName,
          property: field && field.description ? field.description.split('，')[0].replace(/。$/, '') : fieldName
        });
      });
      this.syncGraphConfig();
    },
    updateSelectedJoin() {
      if (this.selectedEdge) {
        this.selectedEdge.setData(this.selectedJoinData);
        this.syncGraphConfig();
      }
    },
    changeFilters(filterList) {
      this.queryConfig.filters = filterList || [];
      this.syncGraphConfig();
    },
    changeOrders(orderList) {
      this.queryConfig.orders = orderList || [];
      this.syncGraphConfig();
    },
    cleanQueryConfigByGraph() {
      const fieldKeySet = new Set(this.graphFieldOptionList.map(field => field.value));
      const paramNameSet = new Set(this.paramOptionList.map(param => param.value));
      this.queryConfig.filters = (this.queryConfig.filters || []).filter(filter => fieldKeySet.has(`${filter.tableAlias || filter.alias}.${filter.fieldName || filter.name}`));
      this.queryConfig.filters = this.queryConfig.filters.filter(filter => paramNameSet.has(filter.paramName));
      this.queryConfig.orders = (this.queryConfig.orders || []).filter(order => fieldKeySet.has(`${order.tableAlias || order.alias}.${order.fieldName || order.name}`));
    },
    normalizeQueryConfig(config) {
      const queryConfig = Object.assign({}, config || {});
      queryConfig.id = DEFAULT_QUERY_ID;
      queryConfig.label = this.$t(DEFAULT_QUERY_LABEL_KEY);
      queryConfig.fields = queryConfig.fields || [];
      queryConfig.filters = queryConfig.filters || [];
      queryConfig.orders = queryConfig.orders || [];
      queryConfig.page = Object.assign({ needPage: false, pageSize: 20 }, queryConfig.page || {});
      return queryConfig;
    },
    getJoinNodeData(alias, type) {
      if (alias) {
        const node = (this.graphData.nodes || []).find(item => {
          const data = item.data || item;
          return data.alias === alias;
        });
        if (node) {
          return node.data || node;
        }
      }
      if (!this.selectedEdge) {
        return {};
      }
      const edgeNode = type === 'source' ? this.selectedEdge.getSourceNode() : this.selectedEdge.getTargetNode();
      return edgeNode ? edgeNode.getData() || {} : {};
    },
    buildSqlGraphConfig() {
      this.cleanQueryConfigByGraph();
      const queryConfig = this.normalizeQueryConfig(this.queryConfig);
      this.queryConfig = queryConfig;
      return {
        version: 1,
        graphData: this.graphData,
        queryConfig: queryConfig,
        queries: [
          {
            id: DEFAULT_QUERY_ID,
            label: this.$t(DEFAULT_QUERY_LABEL_KEY),
            nodes: (this.graphData.nodes || []).map(node => Object.assign({}, node.data, { id: node.id })),
            joins: (this.graphData.joins || []).map(join => join.data || join),
            fields: queryConfig.fields,
            filters: queryConfig.filters,
            orders: queryConfig.orders,
            page: queryConfig.page
          }
        ]
      };
    },
    syncGraphConfig() {
      const config = this.buildSqlGraphConfig();
      this.$emit('setSqlGraphConfig', JSON.stringify(config));
      this.syncDefaultGraphTableContent(config);
      this.sqlGraphSyncErrorList = [];
    },
    syncDefaultGraphTableContent(config) {
      if (this.editMode !== 'graph') {
        return;
      }
      const content = this.reportData.content || '';
      const tableConfig = this.getDefaultDrawTableConfig(config);
      if (!content.trim()) {
        this.$emit('setContent', '${drawTable(' + JSON.stringify(tableConfig) + ')}');
        return;
      }
      const tokenList = tokenizeContent(content);
      const tableToken = tokenList.find(token => token.name === 'drawTable' && token.parsed && token.config && token.config.data === DEFAULT_QUERY_ID);
      if (!tableToken) {
        return;
      }
      const nextConfig = Object.assign({}, tableToken.config);
      if (tableConfig.column) {
        nextConfig.header = tableConfig.header;
        nextConfig.column = tableConfig.column;
      }
      const nextContent = replaceToken(content, tableToken, '${drawTable(' + JSON.stringify(nextConfig) + ')}');
      if (nextContent !== content) {
        this.$emit('setContent', nextContent);
      }
    },
    getDefaultDrawTableConfig(config) {
      const query = (config.queries || [])[0] || {};
      const page = query.page || {};
      const columnList = Array.isArray(query.fields)
        ? query.fields.map(field => field.property || field.fieldName || field.name).filter(Boolean)
        : [];
      const tableConfig = {
        data: DEFAULT_QUERY_ID,
        title: this.$t(DEFAULT_QUERY_LABEL_KEY),
        needPage: !!page.needPage,
        pageSize: page.pageSize || 20,
        disableXss: 0
      };
      if (columnList.length > 0) {
        tableConfig.header = columnList.join(',');
        tableConfig.column = columnList.join(',');
      }
      return tableConfig;
    },
    buildXmlFromGraph(config) {
      if (!config || !config.graphData || !Array.isArray(config.graphData.nodes) || config.graphData.nodes.length === 0) {
        return;
      }
      const sequence = ++this.syncSequence;
      this.isSyncingSqlGraph = true;
      this.$api.report.report.buildSqlGraphSql({
        sqlGraphConfig: config
      }).then(res => {
        if (sequence !== this.syncSequence) {
          return;
        }
        const result = res.Return || {};
        const errorList = result.errorList || [];
        this.sqlGraphSyncErrorList = errorList;
        if (errorList.length === 0 && result.sql) {
          this.sql = result.sql;
          this.$emit('setSql', result.sql);
        }
      }).catch(error => {
        if (sequence !== this.syncSequence) {
          return;
        }
        this.sqlGraphSyncErrorList = [error && error.Message ? error.Message : this.$t('message.executefailed')];
      }).finally(() => {
        if (sequence === this.syncSequence) {
          this.isSyncingSqlGraph = false;
        }
      });
    },
    analyzeXmlToGraph() {
      if (!this.sql) {
        return;
      }
      const config = this.buildSqlGraphConfig();
      const sequence = ++this.syncSequence;
      this.isSyncingSqlGraph = true;
      this.$api.report.report.analyzeSqlGraphXml({
        sql: this.sql,
        sqlGraphConfig: config
      }).then(res => {
        if (sequence !== this.syncSequence) {
          return;
        }
        const result = res.Return || {};
        this.sqlGraphSyncErrorList = result.errorList || [];
        if (result.sqlGraphConfig) {
          this.initGraphConfig(result.sqlGraphConfig);
          this.$emit('setSqlGraphConfig', JSON.stringify(result.sqlGraphConfig));
        }
      }).catch(error => {
        if (sequence !== this.syncSequence) {
          return;
        }
        this.sqlGraphSyncErrorList = [error && error.Message ? error.Message : this.$t('message.executefailed')];
      }).finally(() => {
        if (sequence === this.syncSequence) {
          this.isSyncingSqlGraph = false;
        }
      });
    },
    clipboardSuc: function() {
      this.$Message.success(this.$t('message.copysuccess'));
    }
  },
  computed: {
    isGraphComponentSelected() {
      return !!(this.selectedNodeData || this.selectedEdge);
    },
    selectedFieldKeyList: {
      get() {
        if (!this.selectedNodeData) {
          return [];
        }
        return this.queryConfig.fields
          .filter(field => field.tableAlias === this.selectedNodeData.alias)
          .map(field => `${field.tableAlias}.${field.fieldName}`);
      },
      set() {}
    },
    sourceJoinFieldList() {
      const sourceData = this.getJoinNodeData(this.selectedJoinData.sourceTable, 'source');
      return sourceData.fields || [];
    },
    targetJoinFieldList() {
      const targetData = this.getJoinNodeData(this.selectedJoinData.targetTable, 'target');
      return targetData.fields || [];
    },
    graphFieldOptionList() {
      const fieldList = [];
      (this.graphData.nodes || []).forEach(node => {
        const data = node.data || node;
        const tableAlias = data.alias;
        if (!tableAlias) {
          return;
        }
        const tableLabel = data.label || data.tableLabel || data.tableName || data.name;
        const tableName = data.tableName || data.name;
        (data.fields || []).forEach(field => {
          if (!field || !field.name) {
            return;
          }
          fieldList.push({
            value: `${tableAlias}.${field.name}`,
            text: `${tableAlias} · ${tableLabel} · ${field.name}`,
            tableAlias: tableAlias,
            tableName: tableName,
            tableLabel: tableLabel,
            fieldName: field.name,
            type: field.type,
            description: field.description
          });
        });
      });
      return fieldList;
    },
    paramOptionList() {
      const typeTextMap = {
        forminput: this.$t('term.report.paraminput'),
        formselect: this.$t('term.report.paramselect'),
        formselects: this.$t('term.report.parammultiselect'),
        formcheckbox: this.$t('term.report.paramcheckbox'),
        formradio: this.$t('term.report.paramradio'),
        formdaterange: this.$t('term.report.paramdaterange'),
        formdate: this.$t('term.report.paramdate')
      };
      return (this.reportData && this.reportData.paramList ? this.reportData.paramList : [])
        .filter(param => param && param.name)
        .map(param => {
          const typeText = typeTextMap[param.type] || param.type || this.$t('page.condition');
          return {
            value: param.name,
            text: `${param.label || param.name} · ${param.name} · ${typeText}`,
            label: param.label || param.name,
            type: param.type,
            typeText: typeText
          };
        });
    }
  },
  watch: {
    isHelpShow: {
      handler: function(val) {
        if (val) {
          this.$nextTick(() => {
            const editor = this.$refs.datasourceHelp;
            editor && editor.refresh();
          });
        }
      }
    },
    sql: {
      handler: function(val) {
        this.$emit('setSql', val);
      }
    },
    'reportData.paramList': {
      handler: function() {
        if (this.editMode === 'graph') {
          const before = JSON.stringify(this.queryConfig.filters || []);
          this.cleanQueryConfigByGraph();
          if (before !== JSON.stringify(this.queryConfig.filters || [])) {
            this.syncGraphConfig();
          }
        }
      },
      deep: true
    },
    reportData: {
      handler: function(val) {
        if (val) {
          this.sql = val.sql;
          this.editMode = this.getDefaultEditMode(val);
          this.initGraphConfig(val.sqlGraphConfig);
        } else {
          this.sql = '';
          this.editMode = 'graph';
          this.queryConfig = this.normalizeQueryConfig({
            fields: [],
            filters: [],
            orders: [],
            page: {
              needPage: false,
              pageSize: 20
            }
          });
          this.graphData = { version: 1, nodes: [], joins: [] };
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.report-content {
  .report-content-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    user-select: none;
  }
  .report-content-help {
    flex: 1;
    min-width: 0;
  }
  .sqlgraph-layout {
    display: grid;
    grid-template-columns: 240px minmax(360px, 1fr) 260px;
    min-height: 500px;
    height: calc(100vh - 260px);
    border: 1px solid var(--border-color);
  }
  .sqlgraph-left,
  .sqlgraph-right {
    min-width: 0;
    overflow: auto;
    background: var(--blockbg);
    user-select: none;
  }
  .sqlgraph-center {
    min-width: 0;
    min-height: 0;
  }
  .search-box {
    padding: 8px;
  }
  .table-list {
    max-height: 452px;
    overflow: auto;
  }
  .table-item {
    display: flex;
    align-items: center;
    min-height: 54px;
    padding: 8px 10px;
    cursor: grab;
  }
  .right-section {
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
    ::v-deep input,
    ::v-deep textarea,
    ::v-deep .CodeMirror,
    ::v-deep .ivu-input,
    ::v-deep .ivu-input-number,
    ::v-deep .ivu-checkbox-wrapper,
    ::v-deep .ivu-select {
      user-select: text;
    }
  }
  .section-title {
    margin-bottom: 8px;
    font-weight: bold;
  }
  .join-field-type {
    float: right;
  }
}
</style>
