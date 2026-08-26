<template>
  <WorkbenchCard
    :title="showTitle ? title : ''"
    :loading="loading"
    :error="error"
    :empty="isEmpty"
    :subtitle="description"
  >
    <div ref="tableWrap" class="favorited-service-table">
      <TsTable
        :theadList="theadList"
        :tbodyList="list"
        :rowNum="rowNum"
        :currentPage="currentPage"
        :pageSize="pageSize"
        :defaultShowSize="pageSize"
        :height="tableHeight"
        :show-pager="true"
        :show-sizer="false"
        @changeCurrent="changeCurrent"
      >
        <template v-slot:name="{ row }">
          <span class="service-name align-center text-href" @click.stop="toCatalog(row)">
            <i :class="[row.icon || 'tsfont-ip-list', 'service-icon text-primary mr-sm']"></i>
            <span class="overflow">{{ row.name }}</span>
          </span>
        </template>
        <template v-slot:action="{ row }">
          <div class="tstable-action">
            <ul class="tstable-action-ul">
              <li class="tsfont-edit" @click="toEdit(row)">{{ $t('page.edit') }}</li>
            </ul>
          </div>
        </template>
      </TsTable>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';
import { $t } from '@/resources/init.js';
import {
  PROCESS_FAVORITE_SERVICE_HANDLER,
  PROCESS_FAVORITE_SERVICE_WIDGET_NAME
} from '../utils/process-widget-constants.js';

export default {
  name: 'ProcessFavoriteService',
  components: {
    WorkbenchCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    widget: { type: Object },
    title: { type: String, default: () => $t('term.workbench.favoriteservices') },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: [],
      rowNum: 0,
      currentPage: 1,
      tableHeight: 160,
      resizeObserver: null,
      theadList: [
        { key: 'name', title: this.$t('page.servicename') },
        { key: 'action' }
      ]
    };
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTableHeight();
      this.bindResize();
    });
  },
  beforeDestroy() {
    this.unbindResize();
  },
  methods: {
    toCatalog(row) {
      const path = `/task-dispatch?uuid=${row.uuid}`;
      if (MODULEID === 'process') {
        this.$router.push(path);
      } else {
        window.location.href = `${HOME}/process.html#${path}`;
      }
    },
    toEdit(row) {
      const path = `/catalog-manage?uuid=${row.uuid}`;
      if (MODULEID === 'process') {
        this.$router.push(path);
      } else {
        window.location.href = `${HOME}/process.html#${path}`;
      }
    },
    changeCurrent(page) {
      this.currentPage = Math.max(1, Number(page) || 1);
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.error = '';
      this.$api.tenant.workbench.searchWorkbenchWidgetData({
        handler: PROCESS_FAVORITE_SERVICE_HANDLER,
        portalWidgetName: PROCESS_FAVORITE_SERVICE_WIDGET_NAME,
        param: {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          isAuthenticate: 1
        }
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || this.$t('term.workbench.favoriteservicesloadfailed'));
        }
        const result = res.Return || {};
        this.sourceList = Array.isArray(result.tbodyList) ? result.tbodyList : [];
        this.rowNum = Number(result.rowNum) || 0;
        this.currentPage = Math.max(1, Number(result.currentPage) || this.currentPage);
      }).catch(error => {
        this.sourceList = [];
        this.rowNum = 0;
        this.error = (error && (error.Message || error.message)) || this.$t('term.workbench.favoriteservicesloadfailed');
      }).finally(() => {
        this.loading = false;
        this.$nextTick(() => {
          this.updateTableHeight();
          this.bindResize();
        });
      });
    },
    bindResize() {
      this.unbindResize();
      if (window.ResizeObserver && this.$refs.tableWrap) {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateTableHeight();
        });
        this.resizeObserver.observe(this.$refs.tableWrap);
      } else {
        window.addEventListener('resize', this.updateTableHeight);
      }
    },
    unbindResize() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      } else {
        window.removeEventListener('resize', this.updateTableHeight);
      }
    },
    updateTableHeight() {
      const el = this.$refs.tableWrap;
      if (el) {
        this.tableHeight = Math.max(el.clientHeight, 80);
      }
    }
  },
  computed: {
    isEmpty() {
      return !this.list.length;
    },
    pageSize() {
      const pageSize = Number(this.config.pageSize);
      return Math.max(1, Math.min(100, pageSize || 6));
    },
    list() {
      return this.sourceList;
    }
  },
  watch: {
    pageSize() {
      this.currentPage = 1;
      this.loadData();
    }
  }
};
</script>

<style lang="less" scoped>
.favorited-service-table {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.service-name {
  display: inline-flex;
  max-width: calc(100% - 48px);
}
.service-icon {
  flex: none;
}
</style>
