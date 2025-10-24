<template>
  <div>
    <Dropdown>
      <span class="cursor-pointer">
        H
        <Icon type="ios-arrow-down"></Icon>
      </span>
      <DropdownMenu slot="list">
        <DropdownItem>H1 一级标题</DropdownItem>
        <DropdownItem>H2 二级标题</DropdownItem>
        <DropdownItem>H3 三级标题</DropdownItem>
        <DropdownItem>H4 四级标题</DropdownItem>
        <DropdownItem>H5 五级标题</DropdownItem>
        <DropdownItem>H6 六级标题</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
  data() {
    return {
      initData: null
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
<style lang="less">
</style>
