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
        :can-drag="false"
        :height="tableHeight"
        :show-pager="false"
      >
        <template v-slot:name="{ row }">
          <span class="service-name align-center text-href" @click.stop="toCatalog(row)">
            <i :class="[row.icon || 'tsfont-ip-list', 'service-icon text-primary mr-sm']"></i>
            <span class="overflow">{{ row.name }}</span>
          </span>
        </template>
        <template v-slot:desc="{ row }">
          <span class="overflow">{{ row.desc || '-' }}</span>
        </template>
      </TsTable>
    </div>
  </WorkbenchCard>
</template>

<script>
import WorkbenchCard from '@/views/components/portal/components/display/WorkbenchCard.vue';

const PORTAL_WIDGET_NAME = 'processFavoriteService';

export default {
  name: 'ProcessFavoriteService',
  components: {
    WorkbenchCard,
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue')
  },
  props: {
    widget: { type: Object },
    title: { type: String, default: '收藏服务' },
    description: { type: String, default: '' },
    showTitle: { type: Boolean, default: true },
    config: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      loading: false,
      error: '',
      sourceList: [],
      tableHeight: 160,
      resizeObserver: null,
      theadList: [
        { key: 'name', title: '服务名称' },
        { key: 'desc', title: '描述' }
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
      const catalogId = row.id || row.uuid || row.channelUuid;
      const path = catalogId ? `/catalog-overview?catalogId=${catalogId}` : '/catalog-overview';
      if (MODULEID === 'process') {
        this.$router.push(path);
      } else {
        window.location.href = `${HOME}/process.html#${path}`;
      }
    },
    loadData() {
      this.loading = true;
      this.error = '';
      this.$api.common.searchWorkbenchWidgetData({
        handler: 'process.favoritedServiceList',
        portalWidgetName: PORTAL_WIDGET_NAME,
        param: {}
      }).then(res => {
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '收藏服务加载失败');
        }
        const result = res.Return || {};
        this.sourceList = Array.isArray(result.tbodyList) ? result.tbodyList : [];
      }).catch(error => {
        this.sourceList = [];
        this.error = (error && (error.Message || error.message)) || '收藏服务加载失败';
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
    list() {
      const limit = Number(this.config.limit) || this.sourceList.length;
      return this.sourceList.slice(0, limit);
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
  max-width: 100%;
}
.service-icon {
  flex: none;
}
</style>
