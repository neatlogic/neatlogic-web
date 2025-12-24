<template>
  <Dropdown placement="right" @on-click="handleClick">
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
      <DropdownItem v-for="item in alignList" :key="item.value" :name="item.value">
        <span :class="item.iconClassName" class="knowledge-document-editor-menu-icon"></span>
        <span class="ml-sm mr-sm">{{ item.text }}</span>
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
    return {
      alignList: [{
        iconClassName: 'tsfont-horizontal-left',
        text: '左对齐',
        value: 'left'
      }, {
        iconClassName: 'tsfont-horizontal-center',
        text: '居中对齐',
        value: 'center'
      },
      {
        iconClassName: 'tsfont-horizontal-right',
        text: '右对齐',
        value: 'right'
      }]
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
    handleClick(selectedMenuName) {
      this.$emit('click-menu', {
        commandName: 'textAlign',
        value: {
          textAlign: selectedMenuName
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import "@/resources/plugins/TsKnowledgeDocumentEditor/menus/block-menu/common.less";
</style>
