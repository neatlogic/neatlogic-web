<template>
  <div>
    <EmptyRowMenu
      v-if="isEmptyRow"
      class="menu-wrapper"
      :style="{
        position: 'absolute',
        top: plusPos.top + 'px',
        left: plusPos.left + 'px'
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
        top: (plusPos.top) + 'px',
        left: plusPos.left + 'px'
      }"
      @replace-menu-content="(menuData)=> {
        $emit('replace-menu-content', menuData)
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
    plusPos: {
      type: Object,
      default: () => {
        return {
          top: 0,
          left: 0
        };
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
