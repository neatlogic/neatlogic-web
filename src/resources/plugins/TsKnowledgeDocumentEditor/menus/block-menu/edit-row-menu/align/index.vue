<template>
  <Dropdown placement="right-start">
    <DropdownItem>
      <div class="menu-content-item">
        <div class="icon-text-box">
          <span class="tsfont-horizontal-left icon-image"></span>
          <span class="icon-text">对齐</span>
        </div>
        <Icon type="ios-arrow-forward"></Icon>
      </div>
    </DropdownItem>
    <DropdownMenu slot="list">
      <DropdownItem class="clear-hover-background">
       
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
<style lang="less">
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common-menu.less";
</style>
