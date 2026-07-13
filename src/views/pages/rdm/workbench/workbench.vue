<template>
  <div>
    <TsContain><template v-slot:navigation><span>{{ $t('term.rdm.navigation') }}</span></template>
      <template v-slot:topLeft>{{ $t('term.rdm.topleft') }}</template>
      <template v-slot:topCenter>{{ $t('term.rdm.topcenter') }}</template>
      <template v-slot:topRight>{{ $t('term.rdm.topright') }}</template>
      <template v-slot:sider>{{ $t('term.rdm.sidebar') }}</template>
      <template v-slot:content>{{ $t('page.content') }}</template></TsContain>
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
