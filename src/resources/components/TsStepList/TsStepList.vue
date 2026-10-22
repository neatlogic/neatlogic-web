<template>
  <ol class="ts-step-list">
    <li
      v-for="(item, index) in itemList"
      :key="item[itemKey]"
      class="ts-step-list-item"
      :class="{ 'is-expanded': value === item[itemKey] }"
    >
      <span class="ts-step-list-number" aria-hidden="true">{{ index + 1 }}</span>
      <div
        class="ts-step-list-header"
        role="button"
        tabindex="0"
        :aria-expanded="value === item[itemKey] ? 'true' : 'false'"
        @click="toggle(item)"
        @keydown.enter.prevent="toggle(item)"
        @keydown.space.prevent="toggle(item)"
      >
        <span class="ts-step-list-chevron" :class="value === item[itemKey] ? 'tsfont-down' : 'tsfont-right'" aria-hidden="true"></span>
        <div class="ts-step-list-title">
          <slot
            name="header"
            :item="item"
            :index="index"
            :isExpanded="value === item[itemKey]"
          ></slot>
        </div>
        <div v-if="$scopedSlots.meta" class="ts-step-list-meta">
          <slot
            name="meta"
            :item="item"
            :index="index"
            :isExpanded="value === item[itemKey]"
          ></slot>
        </div>
      </div>
      <div v-if="value === item[itemKey]" class="ts-step-list-content">
        <slot
          name="content"
          :item="item"
          :index="index"
          :isExpanded="true"
        ></slot>
      </div>
    </li>
  </ol>
</template>
<script>
export default {
  name: 'TsStepList',
  props: {
    itemList: { type: Array, default: () => [] },
    itemKey: { type: String, default: 'id' },
    value: { type: [String, Number], default: null }
  },
  methods: {
    /** 由父组件控制唯一展开项，收起时返回空值。 */
    toggle(item) {
      this.$emit('input', this.value === item[this.itemKey] ? null : item[this.itemKey]);
    }
  }
};
</script>
<style scoped lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.ts-step-list {
  margin: 0;
  padding: 0 0 0 36px;
  list-style: none;
}
.ts-step-list-item {
  position: relative;
  min-width: 0;
  border-bottom: 1px solid var(--dividing-color, @default-dividing);

  &::before {
    position: absolute;
    top: 36px;
    bottom: -36px;
    left: -23px;
    border-left: 1px solid var(--dividing-color, @default-dividing);
    content: '';
  }
  &:last-child {
    border-bottom: 0;
    &::before { display: none; }
  }
}
.ts-step-list-number {
  position: absolute;
  top: 26px;
  left: -36px;
  width: 28px;
  height: 28px;
  line-height: 26px;
  border: 1px solid var(--primary-color, @default-primary-color);
  border-radius: 50%;
  color: var(--primary-color, @default-primary-color);
  text-align: center;
  background: var(--op-color, @default-op);
}
.is-expanded > .ts-step-list-number {
  color: var(--op-color, @default-op);
  background: var(--primary-color, @default-primary-color);
}
.ts-step-list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 80px;
  padding: 16px 0;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--primary-color, @default-primary-color);
    outline-offset: 2px;
  }
}
.ts-step-list-chevron {
  flex: 0 0 auto;
  align-self: flex-start;
  line-height: 24px;
}
.ts-step-list-title {
  flex: 1 1 240px;
  min-width: 0;
  overflow-wrap: anywhere;
}
.ts-step-list-meta {
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px 24px;
  overflow-wrap: anywhere;
}
.ts-step-list-content {
  min-width: 0;
  padding: 0 0 24px 32px;
  overflow-wrap: anywhere;
}
.theme-dark {
  .ts-step-list-item,
  .ts-step-list-item::before { border-color: @dark-dividing; }
  .ts-step-list-number {
    border-color: @dark-primary-color;
    color: @dark-primary-color;
    background: @dark-op;
  }
  .is-expanded > .ts-step-list-number {
    color: @dark-background;
    background: @dark-primary-color;
  }
}
@media (max-width: 1200px) {
  .ts-step-list-header {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ts-step-list-title { flex-basis: calc(100% - 32px); }
  .ts-step-list-meta {
    justify-content: flex-start;
    padding-left: 28px;
  }
  .ts-step-list-content { padding-left: 0; }
}
</style>
