<template>
  <h1
    :data_id="uuid"
    class="fz-h1"
    :class="changeType?'bg-'+ changeType:''"
    v-html="content"
  ></h1>
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
<style lang='less' scoped>
@import (reference) '~@/resources/assets/css/theme.less';
.fz-h1 {
  word-break: break-all;
  position: relative;
  font-size: 16px;
  font-weight: bold;
  min-height: 32px;
  line-height: 30px;
  padding-left: 10px;
  margin: 6px 0;
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    height: 18px;
    width: 4px;

    border-radius: 2px;
    background-color:@dividing-color;
  }
}
</style>
