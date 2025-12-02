<template>
  <Dropdown placement="right">
    <DropdownItem>
      <div class="knowledge-document-editor-menu-item-content">
        <div class="icon-text-box">
          <span class="tsfont-horizontal-left icon-image"></span>
          <span class="icon-text">对齐</span>
        </div>
        <Icon type="ios-arrow-forward"></Icon>
      </div>
    </DropdownItem>
    <DropdownMenu slot="list">
      <DropdownItem>
        <span class="tsfont-horizontal-left knowledge-document-editor-menu-icon"></span>
        <span class="ml-sm mr-sm">左对齐</span>
        <!-- <span class="tsfont-check"></span> -->
      </DropdownItem>
      <DropdownItem>
        <span class="tsfont-horizontal-center knowledge-document-editor-menu-icon"></span>
        <span class="ml-sm mr-sm">居中对齐</span>
        <!-- <span class="tsfont-check"></span> -->
      </DropdownItem>
      <DropdownItem>
        <span class="tsfont-horizontal-right knowledge-document-editor-menu-icon"></span>
        <span class="ml-sm mr-sm">右对齐</span>
        <!-- <span class="tsfont-check"></span> -->
      </DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>
<script>
export default {
  name: '',
  components: {},
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
<style lang="less" scoped>
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
