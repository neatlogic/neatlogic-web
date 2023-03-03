<template>
  <p
    :data_id="uuid"
    class="p-fz"
    :class="changeType?'bg-'+ changeType:''"
    v-html="content"
  ></p>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    uuid: String,
    handler: String,
    content: String,
    config: Object,
    changeType: String
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
<style lang="less" scoped>
.p-fz {
  text-indent: 2em;
  line-height: 20px;
  min-height: 20px;
  padding-bottom: 8px;
}
p{
  word-break: break-all;
  /deep/span.line-through{
    text-decoration:line-through;
    vertical-align: baseline;
  }
}  
</style>
