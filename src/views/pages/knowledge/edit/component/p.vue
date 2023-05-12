<template>
  <p :data_id="uuid" v-html="content"></p>
</template>
<script>
import editorMixins from './common/mixins.js';
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
    config: Object,
    tipShow: Boolean//选中工具栏是否显示
  },
  data() {
    return {
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
  methods: {},
  computed: {},
  watch: {}

};

</script>

