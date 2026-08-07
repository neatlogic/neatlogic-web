<template>
  <div :class="['workbench-preview-widget', `is-${mode}`, `is-${viewType}`]">
    <template v-if="viewType === 'welcome'">
      <div class="preview-welcome">
        <div class="preview-welcome__symbol bg-primary-grey text-primary radius-lg flex-center">
          <i class="tsfont-night"></i>
        </div>
        <div class="preview-welcome__copy overflow">
          <div class="preview-welcome__title overflow">
            {{ $t('term.workbench.previewgreeting', {
              greeting: $t('term.workbench.eveninggreeting'),
              name: $t('term.workbench.systemadministrator')
            }) }}
          </div>
          <div class="preview-welcome__description text-grey overflow">
            {{ previewDate }} · {{ $t('term.workbench.eveningprompt') }}
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
      <template v-slot:name="{ row }">
        <span class="preview-service-name overflow text-action">
          <i class="tsfont-ip-list text-primary mr-xs"></i>
          <span class="overflow">{{ row.name }}</span>
        </span>
      </template>
      <template v-slot:priority="{ row }">
        <span :class="row.priorityTone ? `text-${row.priorityTone}` : 'text-grey'">
          {{ row.priority }}
        </span>
      </template>
    </TsTable>

    <WorkbenchQuickGrid
      v-else-if="viewType === 'shortcut'"
      :items="demo.quickList"
      :limit="mode === 'card' ? 4 : 6"
      :columnCount="mode === 'card' ? 2 : 3"
    ></WorkbenchQuickGrid>

    <template v-else-if="viewType === 'distribution'">
      <WorkbenchMetricGroup :metrics="visibleMetrics" compact class="mb-sm"></WorkbenchMetricGroup>
      <WorkbenchDistribution :items="demo.distributionList"></WorkbenchDistribution>
    </template>

    <div v-else class="preview-unknown flex-center text-grey text-center">
      <span class="tsfont-warning-o mr-xs"></span>
      <span>{{ unknownReason }}</span>
    </div>
  </div>
</template>

<script>
import WorkbenchDistribution from './display/WorkbenchDistribution.vue';
import WorkbenchMetricGroup from './display/WorkbenchMetricGroup.vue';
import WorkbenchQuickGrid from './display/WorkbenchQuickGrid.vue';
import { getWorkbenchPreviewDemo } from '../utils/workbench-preview-demo.js';

const SUPPORTED_PRESENTATION_TYPE_LIST = [
  'table',
  'shortcut',
  'distribution',
  'welcome'
];

export default {
  name: 'WorkbenchPreviewWidget',
  components: {
    WorkbenchDistribution,
    WorkbenchMetricGroup,
    WorkbenchQuickGrid,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    presentation: { type: Object, default: () => ({ type: 'unknown' }) },
    mode: { type: String, default: 'card' }
  },
  computed: {
    viewType() {
      const type = this.presentation && this.presentation.type;
      return SUPPORTED_PRESENTATION_TYPE_LIST.includes(type) ? type : 'unknown';
    },
    unknownReason() {
      if (this.presentation && this.presentation.unavailableReason) {
        return this.presentation.unavailableReason;
      }
      return this.$t('term.workbench.nopreviewdefinition');
    },
    demo() {
      return getWorkbenchPreviewDemo(this.viewType, this.presentation && this.presentation.previewKey);
    },
    previewDate() {
      const locale = this.$i18n.locale === 'en' ? 'en-US' : 'zh-CN';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(new Date(2026, 6, 31));
    },
    visibleMetrics() {
      return this.demo.metricList.slice(0, this.mode === 'card' ? 2 : 4);
    },
    visibleTableList() {
      return this.demo.tableList.slice(0, this.mode === 'card' ? 2 : 4);
    },
    tableTheadList() {
      return (this.demo.tableTheadList || []).filter(column => {
        return this.mode !== 'card' || column.cardVisible !== false;
      });
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

.preview-service-name {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
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

.preview-unknown {
  width: 100%;
  height: 100%;
  min-height: 44px;
  padding: 8px;
  box-sizing: border-box;
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
  ::v-deep .quick-description {
    display: none;
  }

  ::v-deep .metric-value {
    font-size: 17px;
  }

  ::v-deep .quick-item {
    min-height: 40px;
    padding: 4px;
  }
}
</style>
