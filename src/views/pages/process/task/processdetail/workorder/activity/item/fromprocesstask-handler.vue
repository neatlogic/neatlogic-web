<template>
  <div class="fromprocessstak-handler-box">
    <span class="left-label-text text-grey">{{ config.typeName }}</span>
    <div>
      <span class="text-href tip-title" style="text-transform: uppercase;" @click="toTask(setData(config.newContent).processTaskId)">{{ setData(config.newContent).serialNumber }}</span>
      <span>{{ setData(config.newContent).title }}</span>
    </div>
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
    return {
    };
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
    },
    toTask(id) {
      window.open(HOME + '/process.html#/task-detail?processTaskId=' + id, '_blank');
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang='less' scoped>
.fromprocessstak-handler-box {
  display: flex;
}
</style>
