<template>
  <h1 :data_id="uuid" v-html="content"></h1>
</template>
<script>
import editorMixins from './common/mixins.js';
import domUtils from '@/views/pages/knowledge/edit/component/range/domUtils.js';
export default {
  name: '',
  components: {
  },
  filters: {},
  mixins: [editorMixins],
  props: {
    uuid: String,
    handler: String,
    content: String,
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
    
  },
  watch: {
    content: {
      handler: function(val) {
       
      },
      immediate: true,
      deep: true
    }
  }

};

</script>
<style lang='less'>

</style>
