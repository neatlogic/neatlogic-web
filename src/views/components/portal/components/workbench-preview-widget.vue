<template>
  <div :class="['workbench-preview-widget', `is-${mode}`, `is-${viewType}`]">
    <template v-if="viewType === 'welcome'">
      <div class="preview-welcome">
        <div class="preview-welcome__symbol bg-primary-grey text-primary radius-lg flex-center">
          <i class="tsfont-night"></i>
        </div>
        <div class="preview-welcome__copy overflow">
          <div class="preview-welcome__title overflow">晚上好，系统管理员</div>
          <div class="preview-welcome__description text-grey overflow">
            2026年7月31日 星期五 · 回顾今日进展，安排后续事项
          </div>
        </div>
        <div class="preview-welcome__context">
          <span class="preview-welcome__context-item">
            <i class="tsfont-time text-primary"></i>
            <span>18:27</span>
          </span>
        </div>
        <i class="tsfont-stars preview-welcome__decoration text-primary"></i>
      </div>
    </template>

    <TsTable
      v-else-if="viewType === 'table'"
      :theadList="tableTheadList"
      :tbodyList="visibleTableList"
      :showPager="false"
      :showSizer="false"
      :showTotal="false"
      :canSelectRow="false"
      :disabledHover="true"
      :fixedHeader="false"
      size="small"
      keyName="id"
      class="preview-table"
    >
      <template v-slot:title="{ row }">
        <span class="overflow text-action">{{ row.title }}</span>
      </template>
      <template v-slot:priority="{ row }">
        <span :class="row.priority === '高' ? 'text-error' : row.priority === '中' ? 'text-warning' : 'text-grey'">
          {{ row.priority }}
        </span>
      </template>
    </TsTable>

    <template v-else-if="viewType === 'metric'">
      <WorkbenchMetricGroup :metrics="visibleMetrics" compact></WorkbenchMetricGroup>
      <WorkbenchActionList
        :items="visibleActionList"
        :limit="mode === 'card' ? 2 : 3"
        dense
        class="mt-sm"
      ></WorkbenchActionList>
    </template>

    <WorkbenchQuickGrid
      v-else-if="viewType === 'shortcut'"
      :items="demo.quickList"
      :limit="mode === 'card' ? 4 : 6"
      :columnCount="mode === 'card' ? 2 : 3"
    ></WorkbenchQuickGrid>

    <WorkbenchTimeline
      v-else-if="viewType === 'timeline'"
      :items="demo.timelineList"
      :limit="mode === 'card' ? 2 : 3"
    ></WorkbenchTimeline>

    <template v-else-if="viewType === 'ranking'">
      <WorkbenchSummary :summary="demo.summary" class="mb-sm"></WorkbenchSummary>
      <WorkbenchRankingList :items="demo.rankingList" :limit="mode === 'card' ? 2 : 3"></WorkbenchRankingList>
    </template>

    <template v-else-if="viewType === 'distribution'">
      <WorkbenchMetricGroup :metrics="visibleMetrics" compact class="mb-sm"></WorkbenchMetricGroup>
      <WorkbenchDistribution :items="demo.distributionList"></WorkbenchDistribution>
    </template>

    <WorkbenchProgressList
      v-else-if="viewType === 'progress'"
      :items="demo.progressList"
      :limit="mode === 'card' ? 2 : 4"
    ></WorkbenchProgressList>

    <template v-else-if="viewType === 'trend'">
      <WorkbenchMiniTrend
        :data="demo.trendData"
        value="92%"
        label="近 7 日执行成功率"
        description="较上周提升 4%"
      ></WorkbenchMiniTrend>
      <WorkbenchMetricGroup
        v-if="mode !== 'card'"
        :metrics="visibleMetrics"
        compact
        class="mt-sm"
      ></WorkbenchMetricGroup>
    </template>

    <WorkbenchActionList
      v-else
      :items="visibleActionList"
      :limit="mode === 'card' ? 2 : 4"
      dense
    ></WorkbenchActionList>
  </div>
</template>

<script>
import WorkbenchActionList from './display/WorkbenchActionList.vue';
import WorkbenchDistribution from './display/WorkbenchDistribution.vue';
import WorkbenchMetricGroup from './display/WorkbenchMetricGroup.vue';
import WorkbenchMiniTrend from './display/WorkbenchMiniTrend.vue';
import WorkbenchProgressList from './display/WorkbenchProgressList.vue';
import WorkbenchQuickGrid from './display/WorkbenchQuickGrid.vue';
import WorkbenchRankingList from './display/WorkbenchRankingList.vue';
import WorkbenchSummary from './display/WorkbenchSummary.vue';
import WorkbenchTimeline from './display/WorkbenchTimeline.vue';
import { getWorkbenchPreviewDemo } from '../utils/workbench-preview-demo.js';

export default {
  name: 'WorkbenchPreviewWidget',
  components: {
    WorkbenchActionList,
    WorkbenchDistribution,
    WorkbenchMetricGroup,
    WorkbenchMiniTrend,
    WorkbenchProgressList,
    WorkbenchQuickGrid,
    WorkbenchRankingList,
    WorkbenchSummary,
    WorkbenchTimeline,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    presentationType: { type: String, default: 'list' },
    mode: { type: String, default: 'card' }
  },
  computed: {
    viewType() {
      if (this.widget.type === 'welcomeOverview') {
        return 'welcome';
      }
      if (this.widget.type === 'processTaskSearch') {
        return 'table';
      }
      return this.presentationType || 'list';
    },
    demo() {
      return getWorkbenchPreviewDemo(this.viewType);
    },
    visibleMetrics() {
      return this.demo.metricList.slice(0, this.mode === 'card' ? 2 : 4);
    },
    visibleActionList() {
      return this.demo.actionList.slice(0, this.mode === 'card' ? 2 : 4);
    },
    visibleTableList() {
      return this.demo.tableList.slice(0, this.mode === 'card' ? 2 : 4);
    },
    tableTheadList() {
      const theadList = [
        { key: 'id', title: '工单号' },
        { key: 'title', title: '标题' },
        { key: 'status', title: '状态' },
        { key: 'priority', title: '优先级' }
      ];
      if (this.mode !== 'card') {
        theadList.push({ key: 'time', title: '更新时间' });
      }
      return theadList;
    }
  }
};
</script>

<style lang="less" scoped>
.workbench-preview-widget {
  height: 100%;
  overflow: hidden;
  color: inherit;
}

.is-welcome {
  position: relative;
}

.preview-welcome {
  position: absolute;
  inset: 0;
  min-height: 64px;
  display: grid;
  grid-template-columns: 44px minmax(160px, 1fr) auto;
  gap: 10px;
  align-items: center;
  overflow: hidden;
}

.preview-welcome__symbol {
  width: 44px;
  height: 44px;
  font-size: 21px;
}

.preview-welcome__copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.preview-welcome__title {
  font-size: 17px;
  line-height: 24px;
  font-weight: 700;
}

.preview-welcome__description {
  margin-top: 3px;
  font-size: 11px;
  line-height: 16px;
}

.preview-welcome__context {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.preview-welcome__context-item {
  min-height: 30px;
  padding: 0 8px;
  display: inline-flex;
  gap: 5px;
  align-items: center;
  box-sizing: border-box;
  font-size: 11px;
  white-space: nowrap;
}

.preview-welcome__decoration {
  position: absolute;
  right: 6px;
  top: -8px;
  font-size: 50px;
  opacity: 0.06;
  pointer-events: none;
}

.preview-table {
  min-width: 440px;
  font-size: 12px;
}

.is-card {
  font-size: 11px;

  &.is-welcome {
    .preview-welcome {
      min-height: 0;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      gap: 4px;
    }

    .preview-welcome__symbol {
      width: 20px;
      height: 20px;
      font-size: 11px;
    }

    .preview-welcome__title {
      font-size: 10px;
      line-height: 14px;
    }

    .preview-welcome__description {
      display: none;
    }

    .preview-welcome__context {
      gap: 3px;
    }

    .preview-welcome__context-item {
      min-height: 18px;
      padding: 0 3px;
      gap: 2px;
      font-size: 8px;
    }

    .preview-welcome__decoration {
      display: none;
    }
  }

  .preview-table {
    min-width: 0;
    font-size: 10px;
  }

  ::v-deep .preview-table {
    .tstable-body {
      th,
      td {
        padding: 3px 4px;
        font-size: 10px;
      }
    }
  }

  ::v-deep .metric-label,
  ::v-deep .metric-trend,
  ::v-deep .row-description,
  ::v-deep .quick-description {
    display: none;
  }

  ::v-deep .metric-value {
    font-size: 17px;
  }

  ::v-deep .action-row {
    min-height: 30px;
  }

  ::v-deep .row-icon {
    width: 22px;
    height: 22px;
  }

  ::v-deep .quick-item {
    min-height: 40px;
    padding: 4px;
  }

  ::v-deep .timeline-row {
    min-height: 30px;
  }
}
</style>
