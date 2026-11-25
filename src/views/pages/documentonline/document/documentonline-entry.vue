<template>
  <button
    type="button"
    class="document-entry"
    :class="{'is-paper': paper}"
    :title="paper ? item.fileName : null"
    @click="$emit('select', item)"
  >
    <span class="entry-icon tsfont-file-single" aria-hidden="true"></span>
    <span class="entry-copy">
      <span class="entry-title">{{ item.fileName }}</span>
      <span v-if="paper" class="entry-rule" aria-hidden="true"></span>
      <span v-if="excerpt" class="entry-excerpt" :class="{'line-2': !paper}">{{ excerpt }}</span>
      <span v-if="location" class="entry-location overflow">{{ location }}</span>
    </span>
    <span v-if="!paper" class="entry-arrow tsfont-right" aria-hidden="true"></span>
  </button>
</template>

<script>
export default {
  props: {
    item: {type: Object, required: true},
    showLocation: Boolean,
    paper: Boolean
  },
  computed: {
    excerpt() {
      const text = (this.item.content || '').trim();
      const title = this.item.fileName;
      if (text === title) {
        return '';
      }
      if (text.startsWith(title + ' ')) {
        return text.slice(title.length + 1).trimStart();
      }
      return text;
    },
    location() {
      if (this.showLocation && this.item.upwardNameList) {
        return this.item.upwardNameList.slice(0, -1).join(' / ');
      }
      return '';
    }
  }
};
</script>

<style lang="less" scoped>
.document-entry {
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  padding: 15px;
  background: var(--help-surface);
  border: 1px solid var(--help-border);
  border-radius: 10px;
  color: var(--help-ink);
  font: inherit;
  text-align: start;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    background: var(--help-hover);
    .entry-title,
    .entry-arrow {
      color: var(--help-accent);
    }
  }
  &:focus-visible {
    outline: 2px solid var(--help-accent);
    outline-offset: -2px;
  }
}
.entry-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: var(--help-accent);
  background: var(--help-accent-soft);
}
.entry-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}
.entry-title {
  font-size: 15px;
  line-height: 1.45;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.entry-excerpt,
.entry-location,
.entry-arrow {
  color: var(--help-muted);
}
.entry-excerpt {
  line-height: 1.6;
}
.entry-location {
  font-size: 12px;
}
.entry-arrow {
  align-self: center;
}
.document-entry.is-paper {
  position: relative;
  grid-template-columns: 16px minmax(0, 1fr);
  grid-template-rows: auto 1px minmax(0, 1fr);
  gap: 8px 6px;
  aspect-ratio: 210 / 297;
  min-width: 0;
  min-height: 0;
  padding: 14px 12px;
  border-radius: 5px 0 5px 5px;
  &::after {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 22px;
    height: 22px;
    border-radius: 0 0 0 4px;
    background: linear-gradient(45deg, var(--help-accent-soft) 0 47%, var(--help-background) 51%);
    content: '';
    pointer-events: none;
  }
  &:hover,
  &:focus-visible {
    border-color: var(--help-accent);
    background: var(--help-surface);
  }
  .entry-icon {
    align-self: center;
    width: 16px;
    height: 16px;
    border-radius: 0;
    background: none;
  }
  .entry-copy {
    display: contents;
  }
  .entry-title {
    align-self: center;
    margin-inline-end: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }
  .entry-rule,
  .entry-excerpt,
  .entry-location {
    grid-column: 1 / -1;
  }
  .entry-rule {
    height: 1px;
    background: var(--help-border);
  }
  .entry-excerpt {
    max-height: 100%;
    max-height: ~"round(down, 100%, 1lh)"; // 按行高取整，避免裁到半行。
    overflow: hidden;
    overflow-wrap: anywhere;
    font-size: 12px;
  }
}
@media (max-width: 420px) {
  .document-entry.is-paper {
    row-gap: 6px;
    padding: 10px 9px;
  }
}
</style>
