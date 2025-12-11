<template>
  <div @click.stop>
    <EmptyRowMenu
      v-if="isEmptyRow"
      class="menu-wrapper"
      :style="{
        position: 'absolute',
        top: menuPosition.top + 'px',
        left: menuPosition.left + 'px'
      }"
      @click-menu="(menuData)=> {
        $emit('insert-menu-content', menuData)
      }"
    >
    </EmptyRowMenu>
    <EditRowMenu
      v-else
      :style="{
        position: 'absolute',
        top: (menuPosition.top) + 'px',
        left: menuPosition.left + 'px'
      }"
      :currentNode="currentNode"
      @click-menu="(menuData)=> {
        $emit('replace-menu-content', menuData)
      }"
      @insert-below-position="(menuData)=> {
        $emit('insert-below-position', menuData)
      }"
    >
    </EditRowMenu>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EmptyRowMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/empty-row-menu/index.vue'),
    EditRowMenu: () => import('@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/edit-row-menu/index.vue')
  },
  props: {
    isEmptyRow: {
      type: Boolean,
      default: false
    },
    menuPosition: {
      type: Object,
      default: () => {
        return {
          top: 0,
          left: 0
        };
      }
    },
    currentNode: {
      type: Object,
      default: () => {
        return {};
      }
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
