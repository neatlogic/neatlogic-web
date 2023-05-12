<template>
  <div v-if="!phase.error">
    <div v-if="result" v-html="$t('term.pbc.uploaddataamount', {target: result.reportCount})"></div>
  </div>
  <div v-else>
    <Alert type="error">{{ phase.error }}</Alert>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: { phase: { type: Object}},
  data() {
    return {
      statistList: {}
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
  },
  filter: {},
  computed: {
    result() {
      if (this.phase.result) {
        return JSON.parse(this.phase.result);
      }
      return null;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>
