<template>
  <div>
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <span v-html="setPriority(config.oldContent)"></span>
    <span v-if="config.newContent && config.oldContent" class="text-grey change-text">{{ $t('term.process.changeto') }}</span>
    <span v-html="setPriority(config.newContent)"></span>
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
    setPriority() {
      return function(item) {
        let html = '';
        if (item) {
          try {
            let str = JSON.parse(item);
            html = '<span style="color:' + str.color + '">' + str.name + '</span>';
          } catch (e) {
            console.log(e);
          }
        }
        return html;
      };
    }
  },
  watch: {}
};
</script>
<style lang='less' scoped>
</style>
