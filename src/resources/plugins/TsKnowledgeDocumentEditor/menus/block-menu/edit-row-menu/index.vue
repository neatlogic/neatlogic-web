<template>
  <div>
    <Dropdown placement="bottom-start">
      <span class="tsfont-drag cursor-pointer" style="font-size: 20px;"></span>
      <DropdownMenu slot="list">
        <DropdownItem class="clear-hover-background">
          <BaseMenu
            :hideBaseText="true"
            @click-menu="(menuData)=> {
              $emit('click-menu', menuData)
            }"
          ></BaseMenu>
        </DropdownItem>
        <DropdownItem>
          <div class="border-base-bottom"></div>
        </DropdownItem>
        <AlignMenu></AlignMenu>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    BaseMenu: () => import('../empty-row-menu/base/index.vue'),
    AlignMenu: () => import('../edit-row-menu/align/index.vue')
  },
  props: {},
  data() {
    return {};
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
<style lang="less">
.clear-hover-background {
  &.ivu-dropdown-item:hover {
    background: transparent!important;
  }
}
</style>
