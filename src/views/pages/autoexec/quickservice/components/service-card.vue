<template>
  <div
    v-if="compact"
    class="more-item li-hover overflow"
    :title="item.name"
    @click="$emit('select', item)"
  >
    <span class="text title-text">{{ item.name }}</span>
    <div
      v-if="isShowLike"
      class="favorite text-primary"
      :class="{ like: isFavorite, 'text-disabled': pending }"
      :aria-busy="pending"
      @click.stop="requestFavorite"
    >
      <i :class="isFavorite ? 'tsfont-star' : 'tsfont-star-border'"></i>
    </div>
  </div>
  <div
    v-else
    class="list noShadow"
    :class="[item.currentSelected ? 'active border-primary bg-info-grey' : 'bg-op', { collection: isFavorite }]"
    @click="$emit('select', item)"
  >
    <div
      v-if="isShowLike"
      class="favorite text-primary"
      :class="{ like: isFavorite, 'text-disabled': pending }"
      :aria-busy="pending"
      @click.stop="requestFavorite"
    >
      <i :class="isFavorite ? 'tsfont-star' : 'tsfont-star-border'"></i>
    </div>
    <div class="content">
      <div class="title">{{ item.name }}</div>
      <Tooltip
        class="tooltip-box-width mt-xs"
        transfer
        placement="bottom-start"
        :maxWidth="300"
        theme="light"
      >
        <div slot="content" class="tooltip-content">{{ description }}</div>
        <div class="tips text-tip line-2">{{ description }}</div>
      </Tooltip>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ServiceCard',
  props: {
    item: { type: Object, required: true },
    isShowLike: { type: Boolean, default: true },
    compact: Boolean,
    favoriteState: { type: Object, default: () => ({}) },
    favoritePending: { type: Object, default: () => ({}) }
  },
  methods: {
    requestFavorite() {
      if (!this.pending) this.$emit('favorite', { ...this.item, isFavorite: this.isFavorite ? 1 : 0 });
    }
  },
  computed: {
    isFavorite() {
      return !!(Object.prototype.hasOwnProperty.call(this.favoriteState, this.item.id) ? this.favoriteState[this.item.id] : this.item.isFavorite);
    },
    pending() { return !!this.favoritePending[this.item.id]; },
    description() {
      const element = document.createElement('div');
      element.innerHTML = this.item.description || '';
      return element.textContent || '-';
    }
  }
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.noShadow { box-shadow: none !important; border-radius: 10px !important; }
.tooltip-content { white-space: normal; }
.tooltip-box-width { width: 100%; }
.list {
  margin: 8px 0;
  height: 110px;
  padding: 0 40px 0 24px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  .border-radius(2px);
  .transition(200ms all);
  .favorite {
    width: 32px;
    height: 32px;
    position: absolute;
    right: 8px;
    top: 6px;
    text-align: center;
    line-height: 31px;
    .transition(200ms all);
    i { font-size: @font-size-base; }
  }
  &:hover {
    .box-shadow(0px 4px 12px 0px rgba(0, 0, 0, 0.15));
    .favorite { display: block; .border-radius(2px); }
  }
  .content {
    padding: 24px 0;
    overflow: hidden;
    .title { font-size: 14px; height: 20px; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tooltip-wrap { width: 100%; }
  }
}
.favorite { display: none; }
.favorite.like { display: block; }
.more-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 24px;
  height: 40px;
  line-height: 40px;
  .title-text { padding-left: 10px; }
  &:hover .favorite { display: block; }
}
</style>
