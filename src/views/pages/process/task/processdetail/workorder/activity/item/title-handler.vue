<template>
  <div class="activity-title-row">
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <div v-if="config.oldContent && config.newContent" class="activity-compare-grid">
      <span class="activity-compare-value" v-text="config.oldContent"></span>
      <span class="activity-compare-marker text-grey">{{ textShow(config) }}</span>
      <span class="activity-compare-value" v-text="config.newContent"></span>
    </div>
    <template v-else>
      <span v-if="textShow(config) == $t('page.delete')" class="text-grey text-padding">{{ textShow(config) }}</span>
      <span v-text="config.oldContent"></span>
      <span v-text="config.newContent"></span>
    </template>
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
  methods: {},
  computed: {
    textShow() {
      return function(config) {
        let text = null;
        if (config.oldContent && config.newContent) {
          text = this.$t('term.process.changeto');
        } else if (config.oldContent && !config.newContent) {
          text = this.$t('page.delete');
        } else {
          text = '';
        }
        return text;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
.activity-title-row {
  display: flex;
  > .left-label-text {
    flex: 0 0 72px;
  }
}
.text-padding{
  padding: 0 8px;
}
</style>
