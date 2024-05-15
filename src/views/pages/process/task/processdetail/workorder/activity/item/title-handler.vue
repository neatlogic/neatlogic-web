<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span v-if="textShow(config) && textShow(config) ==$t('page.delete')" class="text-grey text-padding">{{ textShow(config) }}</span>
    <span v-text="config.oldContent"></span>
    <span v-if="textShow(config) && textShow(config) !=$t('page.delete')" class="text-grey text-padding">{{ textShow(config) }}</span>
    <span v-text="config.newContent"></span>
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
.text-padding{
  padding: 0 8px;
}
</style>
