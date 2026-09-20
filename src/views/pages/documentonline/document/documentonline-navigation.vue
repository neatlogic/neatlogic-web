<template>
  <div class="document-navigation">
    <Tabs :value="currentTab" :animated="false" @input="$emit('update:currentTab', $event)">
      <TabPane :label="$t('page.catalogue')" name="headings">
        <NoData v-if="!headings.length" />
        <ul v-else>
          <li
            v-for="heading in headings"
            :key="heading.id"
            class="pb-sm"
            :style="{'padding-left': ((heading.level - minimumLevel) * 12) + 'px'}"
          >
            <button
              type="button"
              class="navigation-link"
              :class="anchorPointId === heading.id ? 'text-href' : 'text-default'"
              :title="heading.text"
              :aria-current="anchorPointId === heading.id ? 'location' : null"
              @click="$emit('select-heading', heading.id)"
            >{{ heading.text }}</button>
          </li>
        </ul>
      </TabPane>
      <TabPane :label="$t('term.process.relateknowledge')" name="file">
        <button
          v-for="(item,index) in list"
          :key="index"
          type="button"
          class="navigation-link text-tip-active pb-nm"
          :title="item.fileName"
          @click="$emit('select-document', item)"
        >
          {{ item.fileName }}
        </button>
        <button
          v-if="tableData.currentPage < tableData.pageCount"
          type="button"
          class="navigation-link text-href"
          @click="$emit('load-more')"
        >{{ $t('page.viewmore') }}</button>
      </TabPane>
    </Tabs>
  </div>
</template>
<script>
export default {
  props: {
    headings: { type: Array, default: () => [] },
    anchorPointId: String,
    currentTab: String,
    list: { type: Array, default: () => [] },
    tableData: { type: Object, default: () => ({}) }
  },
  computed: {
    minimumLevel() {
      return this.headings.length ? Math.min(...this.headings.map(heading => heading.level)) : 1;
    }
  }
};
</script>
<style lang="less" scoped>
.document-navigation {
  height: 100%;
  overflow: auto;
  padding: 0 16px;
}
.navigation-link {
  display: block;
  width: 100%;
  border: 0;
  background: none;
  text-align: left;
  cursor: pointer;
  font: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.navigation-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
</style>
