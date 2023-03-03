<template>
  <div style="white-space: pre-wrap;font-size:10px;" v-html="help"></div>
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
      help: ''
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    let help = `传入自定义脚本的参数是一个json格式的字符串，每个字段的含义说明和demo如下：
    每个字段为执行方法，其中：参数list为当前表单的所有组件的数据，参数ajax为调用接口的方法，参数it为整个表单的虚拟dom，参数uuid为数据变化的组件的uuid
{
  loadFn:function(list,ajax,it){
    //loadFn:为每次表单初始化时执行的事件
    //获取表单组件数据
    if(list && list.length>0){
      list.forEach(li=>{
      })
    }
    //调用/api/rest/module/list获取数据
    ajax.post('/api/rest/module/list').then(res=>{
      //do something with the result res
    })
  },
  changeFn:function(uuid,val,list,ajax,it){
    //changeFn:当表单组件uuid为uuid的值改变时执行的事件
    console.log(uuid);
    console.log(val);
  }
}`;
    this.help = help;
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
