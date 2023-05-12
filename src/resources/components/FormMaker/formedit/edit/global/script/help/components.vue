<template>
  <div>
    <div class="table-container">
      <table v-if="controllerList && controllerList.length>0" class="ivu-table table">
        <thead>
          <tr>
            <th>组件名称</th>
            <!-- <th>组件类型（英文）</th> -->
            <th>组件uuid</th>
            <!-- <th>组件配置</th> -->
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(con,cindex) in controllerList" :key="cindex">
            <td>{{ con.label }}</td>
            <!-- <td>{{ con.handler }}</td> -->
            <td>{{ con.uuid }}</td>
            <!-- <td><div v-html="con.config"></div></td> -->
            <td><i v-clipboard="con.uuid" class="ts-link text-action" title="复制uuid"></i></td>
          </tr>

        </tbody>
      </table>
      <NoData v-else></NoData>
    </div>
  </div>

</template>
<script>
import clipboard from '@/resources/directives/clipboard.js';
export default {
  name: '',
  components: {
  },
  directives: {clipboard},
  filters: {},
  props: {
    controllerList: Array
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
<style lang='less'>

</style>
