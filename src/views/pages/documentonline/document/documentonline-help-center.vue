<template>
  <main class="help-home">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div class="help-home-body">
      <section class="help-hero">
        <h1>{{ $t('term.documentonline.whathelp') }}</h1>
        <InputSearcher
          v-model="keyword"
          class="hero-search"
          :placeholder="$t('term.documentonline.searchhelp')"
          @change="searchDocument"
        />
      </section>
      <section v-if="moduleList.length" class="help-categories">
        <h2 class="categories-title">{{ $t('term.documentonline.browsebycategory') }}</h2>
        <div class="category-grid">
          <article v-for="category in moduleList" :key="category.firstLevelDirectory" class="category-card">
            <router-link
              :to="{name: 'documentonline-detail', query: {upwardNameList: category.firstLevelDirectory}}"
              class="category-title"
            >
              <span class="category-icon tsfont-folder-o" aria-hidden="true"></span>
              <h3 class="overflow">{{ category.firstLevelDirectory }}</h3>
              <span class="tsfont-right" aria-hidden="true"></span>
            </router-link>
            <ul>
              <li v-for="document in category.tbodyList" :key="document.filePath">
                <router-link
                  :to="{name: 'documentonline-detail', query: {filePath: document.filePath}}"
                  class="category-document overflow"
                  :title="document.fileName"
                >{{ document.fileName }}</router-link>
              </li>
            </ul>
          </article>
        </div>
      </section>
      <NoData v-else-if="!loadingShow" class="mt-lg" />
    </div>
  </main>
</template>

<script>
export default {
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      loadingShow: true,
      moduleList: [],
      keyword: ''
    };
  },
  created() {
    this.$api.documentonline.getDocumentTableList({pageSize: 5}).then(res => {
      if (res.Status === 'OK') {
        this.moduleList = res.Return.tableList || [];
      }
    }).finally(() => {
      this.loadingShow = false;
    });
  },
  methods: {
    searchDocument(value) {
      const searchKeyword = (value || '').trim();
      if (searchKeyword) {
        this.$router.push({name: 'documentonline-search', query: {searchKeyword}});
      }
    }
  }
};
</script>

<style lang="less" scoped>
.help-home-body {
  width: min(100%, 1168px);
  margin: 0 auto;
  padding: clamp(20px, 4vw, 44px) clamp(14px, 3vw, 32px) 52px;
}
.help-hero {
  display: grid;
  justify-items: center;
  gap: 20px;
  padding: clamp(28px, 5vw, 56px) 20px;
  border: 1px solid var(--help-border);
  border-radius: 14px;
  background: linear-gradient(155deg, var(--help-accent-soft), var(--help-surface) 85%);
  text-align: center;
  h1 {
    color: var(--help-ink);
    font-size: clamp(24px, 3.5vw, 34px);
    line-height: 1.35;
    font-weight: 650;
  }
}
.hero-search {
  width: min(100%, 500px);
  ::v-deep .ivu-input {
    height: 44px;
    border-radius: 9px;
    font-size: 14px;
    background: var(--help-surface);
    &::placeholder {
      color: var(--help-muted) !important;
      opacity: 1;
    }
  }
  ::v-deep .ivu-input-prefix {
    display: grid;
    place-items: center;
    i {
      line-height: 1;
    }
  }
}
.help-categories {
  margin-top: 32px;
}
.categories-title {
  margin-bottom: 14px;
  font-size: 19px;
  font-weight: 650;
  color: var(--help-ink);
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.category-card {
  min-width: 0;
  padding: 13px;
  border: 1px solid var(--help-border);
  border-radius: 12px;
  background: var(--help-surface);
}
.category-title {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 4px;
  margin-bottom: 7px;
  border-radius: 7px;
  color: var(--help-ink);
  h3 {
    font-size: 15px;
    font-weight: 650;
  }
  &:hover,
  &:focus-visible {
    background: var(--help-hover);
    color: var(--help-accent);
  }
}
.category-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--help-accent);
  background: var(--help-accent-soft);
}
.category-document {
  display: block;
  padding: 6px 10px;
  border-radius: 6px;
  color: var(--help-muted);
  &:hover,
  &:focus-visible {
    color: var(--help-accent);
    background: var(--help-hover);
  }
}
@media (max-width: 850px) {
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 520px) {
  .category-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
