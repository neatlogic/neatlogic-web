<template>
  <Dropdown
    :placement="placement"
    @on-visible-change="status => $emit('dropdown-visible-change', status)"
  >
    <template v-if="placement === 'bottom-start'">
      <div class="knowledge-document-editor-plus-box cursor-pointer">
        <span class="tsfont-plus"></span>
      </div>
    </template>
    <template v-else>
      <DropdownItem>
        <div class="knowledge-document-editor-menu-item-content">
          <div class="icon-text-box">
            <span class="tsfont-plus-square icon-image"></span>
            <span class="icon-text">在下方插入</span>
          </div>
          <Icon type="ios-arrow-forward"></Icon>
        </div>
      </DropdownItem>
    </template>
    <DropdownMenu slot="list">
      <DropdownItem class="clear-dropdown-item-hover-background">
        <BaseMenu
          @click-menu="(menuData)=> {
            $emit('click-menu', menuData)
          }"
        ></BaseMenu>
      </DropdownItem>
      <DropdownItem class="clear-dropdown-item-hover-background">
        <span class="text-grey">常用</span>
      </DropdownItem>
      <DropdownItem>
        <UploadImage
          @click-menu="(menuData)=> {
            $emit('click-menu', menuData)}"
        ></UploadImage>
      </DropdownItem>
      <DropdownItem>
        <InsertVideo
          @click-menu="(menuData)=> {
            $emit('click-menu', menuData)}"
        ></InsertVideo>
      </DropdownItem>
      <InsertTable
        @click-menu="(menuData)=> {
          $emit('click-menu', menuData)}"
        @dropdown-visible-change="status => $emit('dropdown-visible-change', status)"
      ></InsertTable>
    </DropdownMenu>
  </Dropdown>
</template>
<script>
export default {
  name: '',
  components: {
    BaseMenu: () => import('./base/index.vue'),
    UploadImage: () => import('./commonly-used/upload-image/index.vue'),
    InsertVideo: () => import('./commonly-used/insert-video/index.vue'),
    InsertTable: () => import('./commonly-used/insert-table/index.vue')
  },
  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },
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
@import "@/views/pages/knowledge/category/knowledgeeditor/menus/block-menu/common.less";
</style>
