<template>
  <div>
    <div style="white-space: nowrap">
      <span>{{ config.user }}</span>
      <span class="ml-xs">{{ config.time | formatDate('yyyy-mm-dd hh:mm') }}</span>
    </div>
    <div v-if="config.source">
      <span class="text-grey pr-xs">来自</span>
      <span>{{ config.source }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {
    config: Object
  },
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
