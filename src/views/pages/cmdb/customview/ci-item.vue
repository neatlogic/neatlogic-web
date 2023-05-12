<template>
  <div>
    <TsContain><div slot="top" class="top">头部</div><div slot="content">内容</div></TsContain>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsContain: resolve =>
      require(['@/resources/components/TsContain/TsContain.vue'], resolve)
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
</style>
