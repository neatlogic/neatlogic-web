<template>
  <div>
    <div>传入自定义脚本的参数it是整个表单的虚拟dom，</div>
    <h4>常用方法有：</h4>
    <div class="table-container">
      <table class="ivu-table table">
        <thead>
          <tr>
            <th>方法</th>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>getComponentconfig(uuid, key)</td>
            <td>
              <div>uuid:表单组件uuid</div>
              <div>key:对应组件参数的键名（['value','type']）</div>
            </td>
            <td>获取当前表单键名为key的值</td>
          </tr>
          <tr>
            <td>updateComponentconfig(uuid,key, val)</td>
            <td>
              <div>uuid:表单组件uuid</div>
              <div>key:对应组件参数的键名（['value']）</div>
              <div>val:对应组件参数的新的值</div>
            </td>
            <td>更新表单指定uuid的组件的参数值</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h4>常用参数有：</h4>
    <div class="table-container">
      <table class="ivu-table table">
        <thead>
          <tr>
            <th>参数</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>componentList</td>
            <td>表单的所有组件信息</td>
          </tr>
          <tr>
            <td>globalSetting</td>
            <td>表单的所有全局设置（含默认隐藏行、表单联动、自定义脚本）</td>
          </tr>
          <tr>
            <td>hideTrlist</td>
            <td>表单的所有隐藏行</td>
          </tr>
          <tr>
            <td>hideComponentlist</td>
            <td>表单的所有隐藏组件</td>
          </tr>
          <tr>
            <td>readTrlist</td>
            <td>表单的所有只读行</td>
          </tr>
          <tr>
            <td>readComponentlist</td>
            <td>表单的所有只读组件</td>
          </tr>
        </tbody>
      </table>
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
