<template>
  <h2
    :data_id="uuid"
    class="fz-h2"
    :class="changeType?'bg-'+ changeType:''"
    v-html="content"
  ></h2>
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
.fz-h2 {
  word-break: break-all;
  font-size: 13px;
  font-weight: bold;
  min-height: 32px;
  line-height: 30px;
  margin: 6px 0;
  padding-left: 28px;
}
</style>
