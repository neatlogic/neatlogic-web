<template>
  <div>
    <Breadcrumb separator=">">
      <BreadcrumbItem to="/documentonline">
        {{ $t('term.documentonline.helpcenter') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-for="(item,index) in upwardNameList" :key="index" :to="index < upwardNameList.length-1? goto(item,index):''">
        {{ item }}
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
    upwardNameList: Array
  },
  data() {
    return {
      labelConfig: {}
    };
  },
  beforeCreate() {},
  created() { },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    goto(filePath, index) {
      if (filePath === 'documentonline') {
        return {path: '/documentonline'};
      } else if (filePath.indexOf('.md') == -1) {
        let upwardNameList = this.upwardNameList.slice(0, index + 1);
        return {
          path: '/documentonline-manage',
          query: {
            upwardNameList: upwardNameList.join('/')
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
