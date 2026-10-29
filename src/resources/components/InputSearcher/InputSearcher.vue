<template>
  <div class="input-searcher-box form-li" :class="[borderClass, { 'has-prefix': hasPrefix }]">
    <Input
      v-model="currentValue"
      :placeholder="placeholder"
      :class="currentValue ? 'input-box' : ''"
      :style="getStyle"
      :clearable="true"
      :size="size"
      @on-enter="onSearchValue"
      @on-clear="onSearchValue"
      @on-change="changeValue"
    >
      <template #prefix>
        <span v-if="hasPrefix" ref="searchPrefix" class="search-prefix">
          <Icon type="ios-search" @click="onSearchValue" />
          <slot name="prefix"></slot>
        </span>
        <Icon v-else type="ios-search" @click="onSearchValue" />
      </template>
    </Input>
  </div>
</template>
<script>
export default {
  name: 'InputSearcher',
  props: {
    size: { type: String },
    value: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default() {
        return this.$t('form.placeholder.keyword');
      }
    },
    border: {
      type: String,
      default: 'border' // 可选：borer/none
    },
    width: {
      type: [String, Number], // 百分比、数值 例如：50 50px 50%
      default: ''
    }
  },
  data() {
    return {
      currentValue: this.$utils.isEmpty(this.value) ? '' : this.value,
      prefixWidth: 26
    };
  },
  mounted() {
    if (this.$refs.searchPrefix) {
      this.prefixObserver = new ResizeObserver(() => {
        const prefix = this.$refs.searchPrefix;
        if (prefix) this.prefixWidth = Math.ceil(prefix.getBoundingClientRect().width) + 16;
      });
      this.prefixObserver.observe(this.$refs.searchPrefix);
    }
  },
  beforeDestroy() {
    this.prefixObserver?.disconnect();
  },
  methods: {
    focus() {
      this.$el.querySelector('input')?.focus();
    },
    onSearchValue() {
      this.$emit('change', this.currentValue);
    },
    changeValue() {
      this.$emit('input', this.currentValue);
    }
  },
  computed: {
    hasPrefix() {
      return !!(this.$scopedSlots.prefix || this.$slots.prefix);
    },
    borderClass() {
      let resultJson = {};
      if (this.border) {
        resultJson['tsForm-border-' + this.border] = true;
        resultJson['tsForm-item'] = true;
      }
      this.className && (resultJson[this.className] = true);
      return resultJson;
    },
    getStyle() {
      let styleObj = {};
      if (this.hasPrefix) styleObj['--input-searcher-prefix-width'] = this.prefixWidth + 'px';
      if (typeof this.width == 'number') {
        styleObj.width = this.width + 'px';
      } else if (typeof this.width == 'string') {
        styleObj.width = this.width;
      }
      return styleObj;
    }
  },
  watch: {
    value(newValue) {
      this.currentValue = newValue;
    }
  }
};
</script>
<style lang="less" scoped>
.input-searcher-box {
  ::v-deep .ivu-input {
    padding: 0 26px 0 var(--input-searcher-prefix-width, 26px) !important;
  }
  ::v-deep .ivu-input-icon-clear {
    top: 50%;
    transform: translateY(-50%);
  }
  ::v-deep .ivu-input-prefix {
    left: 8px;
    i {
      font-size: 14px !important;
    }
  }
  &.has-prefix ::v-deep .ivu-input-prefix {
    width: calc(var(--input-searcher-prefix-width, 26px) - 16px);
  }
  .search-prefix {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    height: 100%;
    white-space: nowrap;
  }
}
</style>
