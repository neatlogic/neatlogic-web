<template>
  <div>
    <span class="left-label-text text-grey">{{ $t('term.process.triggertime', {target: setData(config.newContent).triggerText}) }}</span>
    <div>
      <span style="padding-right:8px;">{{ setData(config.newContent).integrationName }}</span>
      <span :class="setData(config.newContent).succeed == true?'text-success':'text-danger'">{{ setData(config.newContent).statusText }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
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
  methods: {
    setData(str) {
      let data = JSON.parse(str);
      return data;
    }
  },
  computed: {
    downurl() {
      return function(url, param) {
        return {
          url: url,
          params: { id: param }
        };
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
