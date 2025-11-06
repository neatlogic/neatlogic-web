<template>
  <div ref="bubbleMenuRef" class="bubble-menu bg-op border-base">
    <component
      :is="getMenuComponent(menu.type)"
      v-for="(menu,index) in menuConfig"
      :key="index"
      v-bind="menu"
      @execCommand="handleCommand"
    />
  </div>
</template>
<script>
import MenuConfig from './menu-config';
import MenuComponent from './src/index.js';
export default {
  name: '',
  components: {
    ...MenuComponent
  },
  props: {},
  data() {
    return {
      menuConfig: MenuConfig
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
  computed: {},
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
