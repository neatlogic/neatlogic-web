<template>
  <div @click.stop>
    <Dropdown @on-click="handleClickMenu">
      <span class="cursor-pointer">
        H
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <DropdownItem name="heading1">H1 一级标题</DropdownItem>
        <DropdownItem name="heading2">H2 二级标题</DropdownItem>
        <DropdownItem name="heading3">H3 三级标题</DropdownItem>
        <DropdownItem name="heading4">H4 四级标题</DropdownItem>
        <DropdownItem name="heading5">H5 五级标题</DropdownItem>
        <DropdownItem name="heading6">H6 六级标题</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
import toolBarMixin from '@/resources/plugins/TsTiptap/toolbar/src/toolbar-mixin.js';
export default {
  name: '',
  components: {
  },
  mixins: [toolBarMixin],
  props: {},
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
  methods: {
    handleClickMenu(menuName) {
      this.emitValue({menuName: menuName});
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
