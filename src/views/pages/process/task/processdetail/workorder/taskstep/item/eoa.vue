<template>
  <div v-if="item">
    <EoaDetail :handlerStepInfo="item.handlerStepInfo" :readonly="true"></EoaDetail>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    EoaDetail: resolve => require(['@/views/pages/process/task/processdetail/workorder/eoa/eoa-detail.vue'], resolve)
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    }
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
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
