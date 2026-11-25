<template>
  <section class="category-documents">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <header v-if="title" class="category-heading">
      <h1>{{ title }}</h1>
      <span v-if="tableData.rowNum > 0" class="document-count">
        {{ $tc('term.documentonline.documentcount', tableData.rowNum) }}
      </span>
    </header>
    <div class="document-entries">
      <DocumentonlineEntry
        v-for="item in list"
        :key="item.filePath"
        :item="item"
        paper
        @select="$emit('getDetail', $event)"
      />
    </div>
    <div v-if="tableData.currentPage < tableData.pageCount" class="mt-nm text-center">
      <Button :loading="loadingShow" @click="changePage">{{ $t('page.viewmore') }}</Button>
    </div>
    <NoData v-if="!loadingShow && !list.length" class="mt-lg" />
  </section>
</template>

<script>
export default {
  components: {
    DocumentonlineEntry: () => import('./documentonline-entry.vue')
  },
  props: {
    upwardNameList: {type: Array, default: () => []}
  },
  data() {
    return {
      loadingShow: false,
      tableData: {},
      list: []
    };
  },
  methods: {
    getDocumentList(currentPage = 1) {
      const list = this.list;
      this.loadingShow = true;
      this.$api.documentonline.getDocumentList({
        currentPage,
        upwardNameList: this.upwardNameList,
        extendedSummary: true
      }).then(res => {
        if (this.list === list && res.Status === 'OK') {
          this.tableData = res.Return || {};
          list.push(...(this.tableData.tbodyList || []));
        }
      }).finally(() => {
        if (this.list === list) {
          this.loadingShow = false;
        }
      });
    },
    changePage() {
      if (!this.loadingShow) {
        this.getDocumentList(this.tableData.currentPage + 1);
      }
    }
  },
  computed: {
    title() {
      return this.upwardNameList[this.upwardNameList.length - 1];
    }
  },
  watch: {
    upwardNameList: {
      immediate: true,
      handler(path) {
        this.list = [];
        this.tableData = {};
        this.loadingShow = false;
        if (path.length) {
          this.getDocumentList();
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';

.category-documents {
  padding-block: clamp(20px, 4vw, 40px);
  padding-inline: clamp(@space-normal, 2vw, @space-lg);
}
.category-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin-bottom: 18px;
  h1 {
    color: var(--help-ink);
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 650;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
}
.document-count {
  color: var(--help-muted);
}
.document-entries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 152px), 1fr));
  gap: @space-normal;
}
@media (max-width: 420px) {
  .document-entries {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: @space-md;
  }
}
</style>
