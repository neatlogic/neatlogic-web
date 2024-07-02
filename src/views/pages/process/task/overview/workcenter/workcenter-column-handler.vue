<template>
  <div class="workcenter-column-handler-box">
    <Component :is="getComponentByKey(header.key)" :headerKey="header.key" :rowData="row"></Component>  
  </div>
</template>

<script>
import workcenterColumnHandler from './column/index.js';
export default {
  name: 'WorkcenterColumnHandler',
  components: {
    ...workcenterColumnHandler
  },
  props: ['config', 'header', 'row'],
  data() {
    return {};
  },
  mounted() {},
  methods: {},
  computed: {
    getComponentByKey() {
      const mapping = {
        'owner': 'usercardHandler',
        'reporter': 'usercardHandler',
        'channeltype': 'statusHandler',
        'priority': 'statusHandler',
        'status': 'statusHandler'
      };
      return (key) => {
        return mapping[key] || (Object.keys(workcenterColumnHandler).includes(`${key}Handler`) ? `${key}Handler` : 'textHandler');
      };
    }
  }
};
</script>
<style lang="less">
.workcenter-column-handler-box {
  .Avatar {
    margin-right: 6px;
    vertical-align: middle;
  }
  .ivu-carousel-dots {
    text-align: left;
  }
}
</style>
