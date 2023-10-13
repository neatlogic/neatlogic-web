<template>
  <div>
    <TsContain><template v-slot:navigation><span>导航</span></template>
      <template v-slot:topLeft>上左</template>
      <template v-slot:topCenter>上中</template>
      <template v-slot:topRight>上右</template>
      <template v-slot:sider>侧边栏</template>
      <template v-slot:content>内容</template></TsContain>
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
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
