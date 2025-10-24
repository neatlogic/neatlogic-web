<template>
  <div>
    <div
      v-if="showPlus"
      class="bg-op border-base"
      :class="isEmptyRow ? 'plus-button' : `drag-button shadow`"
      :style="{
        position: 'absolute',
        top: plusPos.top + 'px',
        left: plusPos.left + 'px'
      }"
      @mouseenter="()=>{
        $emit('PlusMouseenter')
      }"
    >
      <span v-if="!isEmptyRow" :class="iconClassName" class="text-primary"></span>
      <span :class="isEmptyRow ? 'tsfont-plus' : `tsfont-drag`"></span>
    </div>
    <template v-if="menuVisible">
      <EmptyMenuList
        v-if="isEmptyRow"
        class="menu-wrapper"
        :style="{
          position: 'absolute',
          top: menuPos.top + 'px',
          left: menuPos.left + 'px'
        }"
        @click-menu="(menuData)=> {
          $emit('insert-menu-content', menuData)
        }"
      >
      </EmptyMenuList>
      <NormalMenuList
        v-else
        :style="{
          position: 'absolute',
          top: menuPos.top + 'px',
          left: menuPos.left + 'px'
        }"
        @replace-menu-content="(menuData)=> {
          $emit('replace-menu-content', menuData)
        }"
      ></NormalMenuList>
    </template>
  
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EmptyMenuList: () => import('@/resources/plugins/TsTiptap/menu/empty-menu.vue'),
    NormalMenuList: () => import('@/resources/plugins/TsTiptap/menu/normal-menu.vue')
  },
  props: {
    isEmptyRow: {
      type: Boolean,
      default: true
    },
    menuVisible: {
      type: Boolean,
      default: false
    },
    showPlus: {
      type: Boolean,
      default: false
    },
    iconClassName: {
      type: String,
      default: ''
    },
    plusPos: {
      type: Object,
      default: () => {
        return {
          top: 0,
          left: 0
        };
      }
    },
    menuPos: {
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
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"  scoped>
.plus-button {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  z-index: 10;
  &:hover {
  background: #1f23291f !important;
 }
}
.drag-button {
  display: flex;
  align-items: center;
  max-width: 59px;
  height: 24px;
  line-height: 24px;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 10;
}
</style>
