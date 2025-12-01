<template>
  <div>
    <Dropdown placement="bottom-start">
      <span class="tsfont-plus-o cursor-pointer" style="font-size: 20px;"></span>
      <DropdownMenu slot="list">
        <DropdownItem class="clear-hover-background">
          <BaseMenu
            @click-menu="(menuData)=> {
              $emit('click-menu', menuData)
            }"
          ></BaseMenu>
        </DropdownItem>
        <DropdownItem class="clear-hover-background">
          <span class="text-grey">常用</span>
        </DropdownItem>
        <DropdownItem>
          <UploadImage
            @click-menu="(menuData)=> {
              $emit('click-menu', menuData)}"
          ></UploadImage>
        </DropdownItem>
        <DropdownItem>
          <UploadVideo
            @click-menu="(menuData)=> {
              $emit('click-menu', menuData)}"
          ></UploadVideo>
        </DropdownItem>
        <InsertTable
          @click-menu="(menuData)=> {
            $emit('click-menu', menuData)}"
        ></InsertTable>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    BaseMenu: () => import('./base/index.vue'),
    UploadImage: () => import('./commonly-used/upload-image/index.vue'),
    UploadVideo: () => import('./commonly-used/upload-video/index.vue'),
    InsertTable: () => import('./commonly-used/insert-table/index.vue')
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
