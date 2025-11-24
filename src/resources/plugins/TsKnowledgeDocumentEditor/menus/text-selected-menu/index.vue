<template>
  <div ref="bubbleMenuRef" class="bubble-menu bg-op border-base">
    <component
      :is="getMenuComponent(menu.type)"
      v-for="(menu,index) in menuConfig"
      :key="index"
      :selectedNodeTypeName="selectedNodeTypeName"
      v-bind="menu"
      @execCommand="handleCommand"
    />
  </div>
</template>
<script>
import { BaseMenuConfigList, TableMenuConfigList } from './menu-config';
import MenuComponent from './src/index.js';
export default {
  name: '',
  components: {
    ...MenuComponent
  },
  props: {
    selectedNodeTypeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleCommand(execMenuValue) {
      this.$emit('execCommand', execMenuValue);
    },
    getMenuComponent(type) {
      return MenuComponent[type] || 'div';
    }
  },
  filter: {},
  computed: {
    menuConfig() {
      const menuMap = {
        'table': TableMenuConfigList
      };
      return [...BaseMenuConfigList, ...(menuMap[this.selectedNodeTypeName] || [])];
    }
  },
  watch: {}
};
</script>
<style lang="less">
.bubble-menu {
  position: absolute; /* 关键 */
  display: flex;
  align-items: center;
  gap: 15px;
  border-radius: 6px;
  padding: 10px;
  z-index: 100;
  span {
    cursor: pointer;
  } 
}
</style>
