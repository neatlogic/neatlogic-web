<template>
  <div ref="bubbleMenuRef" class="bubble-menu bg-op border-base">
    <template v-if="selectedNodeTypeName === 'ImageView'">
      <ImageView
        :menuList="menuConfig(selectedNodeTypeName)"
        @executeEditorCommand="handleCommand"
      ></ImageView>
    </template>
    <template v-else>
      <component
        :is="getMenuComponent(menu.type)"
        v-for="(menu,index) in menuConfig(selectedNodeTypeName)"
        :key="index"
        :selectedNodeTypeName="selectedNodeTypeName"
        v-bind="menu"
        @executeEditorCommand="handleCommand"
      />
    </template>
   
  </div>
</template>
<script>
import { BaseMenuConfigList, TableMenuConfigList, ImageMenuConfigList} from './menu-config';
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
    handleCommand(menuDataConfig) {
      this.$emit('executeEditorCommand', menuDataConfig);
    },
    getMenuComponent(type) {
      return MenuComponent[type] || 'div';
    }
  },
  filter: {},
  computed: {
    menuConfig() {
      return (type) => {
        if (type === 'ImageView') {
          return ImageMenuConfigList;
        }
        const menuMap = {
          'table': TableMenuConfigList
        };
        return [...BaseMenuConfigList, ...(menuMap[this.selectedNodeTypeName] || [])];
      };
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
  padding: 10px 16px;
  z-index: 100;
  span {
    cursor: pointer;
  } 
}
</style>
