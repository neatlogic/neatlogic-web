<template>
  <div>
    <span class="tip-title">{{ config.typeName }}</span>
    <div v-if="config.newContent" v-html="config.newContent"></div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
   
  },
  filters: {},
  props: {
    config: Object
  },
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
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
