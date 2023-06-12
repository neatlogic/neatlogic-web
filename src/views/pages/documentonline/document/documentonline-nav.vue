<template>
  <div>
    <Breadcrumb separator=">">
      <BreadcrumbItem to="/documentonline">
        帮助中心
      </BreadcrumbItem>
      <BreadcrumbItem v-for="(item,index) in filepathList" :key="index" :to="index<filepathList.length-1? goto(item):''">
        {{ getNavLabel(item) }}
      </BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    moduleGroup: String,
    menu: String,
    filepathList: Array
  },
  data() {
    return {
      labelConfig: {}
    };
  },
  beforeCreate() {},
  created() { },
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      if (this.moduleGroup) {
        let module = this.moduleList.find(m => m.moduleId === this.moduleGroup);
        let routerConfig = this.$utils.getRouterConfig();
        if (module) {
          this.$set(this.labelConfig, this.moduleGroup, module.moduleName);
        }
        if (this.menu && routerConfig[this.moduleGroup]) {
          let findItem = routerConfig[this.moduleGroup].find(i => (i.name === this.menu));
          if (findItem) {
            this.$set(this.labelConfig, this.menu, findItem.meta.title);
          }
        }
      }
    },
    getNavLabel(item) {
      if (item === 'documentonline') {
        return '帮助中心';
      } else if (item.indexOf('.md') != -1) {
        return item;
      } else if (this.labelConfig[item]) {
        return this.labelConfig[item];
      }
      return '';
    },
    goto(filePath) {
      if (filePath === 'documentonline') {
        return {path: '/documentonline'};
      } else if (filePath.indexOf('.md') == -1) {
        return {
          path: '/documentonline-manage',
          query: {
            moduleGroup: this.moduleGroup,
            menu: filePath
          }
        };
      }
    }
  },
  filter: {},
  computed: {
    moduleList() {
      return this.$store.state.topMenu.moduleList;
    }
  },
  watch: {}
};
</script>
<style lang="less">
</style>
