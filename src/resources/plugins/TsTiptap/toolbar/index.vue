<template>
  <div class="toolbar-box">
    <component
      :is="componentName"
      v-for="(componentName,index) in toolbarComponent"
      :key="index"
      @insert-menu-content="(menuName)=> {
        $emit('insert-menu-content', menuName)
      }"
    ></component>
  </div>
</template>
<script>
import ToolBarComponent from './src/index.js';
export default {
  name: '',
  components: {
    ...ToolBarComponent
  },
  props: {},
  data() {
    return {
      toolbarComponent: ToolBarComponent
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.toolbar-box {
  display: grid;
  grid-template-columns: repeat(20, 30px);
  grid-gap: 5px;
}
</style>
