<template>
  <div>
    <Breadcrumb separator=">">
      <BreadcrumbItem to="/documentonline">
        {{ $t('term.documentonline.helpcenter') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-for="(item,index) in upwardNameList" :key="index" :to="index < upwardNameList.length-1? goto(index):''">
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
    goto(index) {
      let upwardNameList = this.upwardNameList.slice(0, index + 1);
      return '/documentonline-detail?upwardNameList=' + upwardNameList.join('/') + '&isSiderHide=false';
    }
    
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
