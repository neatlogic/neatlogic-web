<template>
  <div class="bg-op radius-lg padding-sm">
    <div class="application-module-switcher">
      <button
        type="button"
        class="application-module-card application-module-system padding-sm radius-sm border-base"
        :class="value === null ? 'item-selected text-primary' : 'bg-op text-default'"
        :aria-pressed="value === null"
        @click="select(null)"
      >
        <span class="tsfont-application mr-sm text-primary"></span>
        <span><strong>{{ $t('term.cmdb.applicationoverview.systemscope') }}</strong><span class="application-module-caption text-grey fz12">{{ $t('term.cmdb.applicationoverview.allresources') }}</span></span>
      </button>
      <div ref="strip" class="application-module-strip ml-sm">
        <button
          v-for="module in modules"
          :key="module.id"
          type="button"
          class="application-module-card padding-sm radius-sm border-base"
          :class="isSelected(module) ? 'item-selected text-primary' : 'bg-op text-default'"
          :aria-pressed="isSelected(module)"
          :data-module-id="module.id"
          :title="[module.abbrName, module.name].filter(Boolean).join(' / ')"
          @click="select(module.id)"
        >
          <span class="tsfont-application mr-sm text-primary"></span>
          <span class="application-module-name"><strong class="overflow">{{ module.abbrName || module.name }}</strong><span class="application-module-caption text-grey fz12 overflow">{{ module.name || module.abbrName }}</span></span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ApplicationModuleSwitcher',
  props: {
    value: { type: [Number, String], default: null },
    modules: { type: Array, default: () => [] }
  },
  mounted() {
    this.revealSelection();
  },
  methods: {
    // 保留接口返回的模块标识，交由页面切换业务范围。
    select(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    },
    // 路由查询参数为字符串时仍按同一真实标识匹配。
    isSelected(module) {
      return this.value !== null && String(this.value) === String(module.id);
    },
    // 仅滚动模块条，不改变页面及资产清单的滚动位置。
    async revealSelection() {
      await this.$nextTick();
      const strip = this.$refs.strip;
      if (!strip) {
        return;
      }
      const selected = Array.from(strip.querySelectorAll('[data-module-id]')).find(element => element.dataset.moduleId === String(this.value));
      if (!selected) {
        strip.scrollLeft = 0;
      } else if (selected.offsetLeft < strip.scrollLeft) {
        strip.scrollLeft = selected.offsetLeft;
      } else if (selected.offsetLeft + selected.offsetWidth > strip.scrollLeft + strip.clientWidth) {
        strip.scrollLeft = selected.offsetLeft + selected.offsetWidth - strip.clientWidth;
      }
    }
  },
  watch: {
    value: 'revealSelection',
    modules: 'revealSelection'
  }
};
</script>
<style scoped lang="less">
// 横向卡片导航无法用通用间距类表达，样式仅控制尺寸及排列。
.application-module-switcher {
  display: flex;
  align-items: center;
  min-width: 0;
}
.application-module-strip {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  position: relative;
}
.application-module-card {
  display: flex;
  align-items: center;
  flex: 0 0 220px;
  min-width: 0;
  min-height: 72px;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.application-module-name {
  min-width: 0;
  flex: 1;
}
.application-module-caption {
  display: block;
}
.application-module-system {
  flex-basis: 190px;
}
@media (max-width: 768px) {
  .application-module-switcher {
    flex-wrap: wrap;
  }
  .application-module-system {
    flex-basis: 150px;
  }
  .application-module-strip {
    flex-basis: calc(100% - 162px);
  }
}
</style>
