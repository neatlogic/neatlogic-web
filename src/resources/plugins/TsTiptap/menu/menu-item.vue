<template>
  <li class="menu-item">
    <!-- 分类层 -->
    <template v-if="item.category && item.children">
      <div class="category-name text-grey">{{ getCategoryName(item.category) }}</div>
      <ul class="children">
        <menu-item
          v-for="child in item.children"
          :key="child.uuid"
          :item="child"
          @click-menu="$emit('click-menu', $event)"
        />
      </ul>
    </template>

    <!-- 具体菜单项 -->
    <template v-else>
      <div
        class="menu-entry"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click.stop="handleClick"
      >
        <div :class="item.hoverComponent ? 'flex-between' : ''">
          <div>
            <span v-if="item.iconClass" :class="['mr-xs', item.iconClass]"></span>
            <Tooltip
              v-if="item.tipConentList"
              transfer
              theme="dark"
              placement="top"
            >
              <span>{{ item.label }}</span>
              <div slot="content">
                <div v-for="(tip, idx) in item.tipConentList" :key="idx">{{ tip }}</div>
              </div>
            </Tooltip>
            <span v-else>{{ item.label }}</span>
          </div>
          <span v-if="item.hoverComponent" class="tsfont-right"></span>
        </div>

        <!-- hover 弹出内容（如 TableGridSelector） -->
        <div
          v-if="item.isShowHoverComponent"
          class="hover-box"
          :style="{ position: 'absolute', right: '-226px', top: '-28px' }"
        >
          <component
            :is="getComponentName(item.hoverComponent)"
            v-if="item.hoverComponent"
            @select="handleTableSelect"
          ></component>
        
          <menu-item
            v-for="child in item.children"
            v-else-if="item.children"
            :key="child.uuid"
            :item="child"
            @click-menu="$emit('click-menu', $event)"
          />
        </div>
      </div>
    </template>
  </li>
</template>

<script>
import HoverComponent from '@/resources/plugins/TsTiptap/menu/component/hover/index.js';
export default {
  name: 'MenuItem',
  components: {
    ...HoverComponent
  },
  props: {
    item: { type: Object, required: true }
  },
  methods: {
    handleMouseEnter() {
      if (this.item.hoverComponent) this.$set(this.item, 'isShowHoverComponent', true);
    },
    handleMouseLeave() {
      if (this.item.hoverComponent) {
        // setTimeout(() => (this.item.isShowHoverComponent = false), 300);
      }
    },
    handleClick() {
      this.$emit('click-menu', { category: this.item.category, value: this.item.value });
    },
    handleTableSelect(rowCol) {
      this.$emit('click-menu', { category: this.item.category, value: rowCol });
    },
    getCategoryName(category) {
      const map = { basic: '基础', common: '常用' };
      return map[category] || category;
    }
  },
  computed: {
    getComponentName(componentName) {
      return (componentName) => {
        return HoverComponent[componentName] || 'div';
      };
    }
  }
};
</script>

<style scoped lang="less">
.menu-item {
  position: relative;
  .category-name {
    margin-bottom: 10px;
    font-size: 15px;
  }
  .menu-entry {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    &:hover {
      background: #1f23291f;
    }
  }
  .hover-box {
    z-index: 10;
  }
}
</style>
