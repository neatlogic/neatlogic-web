<template>
  <div>
    <Poptip
      trigger="hover"
      width="700"
      :transfer="true"
      :title="$t('term.framework.grammarhint')"
    >
      <a href="javascript:void(0)">{{ $t('term.framework.grammarhint') }}</a>
      <div slot="content">
        <dl>
          <dt><pre>
1.约束：转换前数据的变量为<strong>O</strong>，转换后数据的变量为<strong>N</strong>。
       如需打印变量，请使用print("xx")，打印只会在转换测试时启用。</pre></dt>
          <dt>
            <pre>
2.范例：数据：{"userList":[
              {"username":"张三","title":"组长"},
              {"username":"李四","title":"员工"},
              {"username":"王五","title":"员工"}
            ]}
       规则：for(var i = 0; i &lt; O.userList.length; i++){
              var userObj = O.userList[i];
              if(!N[userObj['title']]){
                N[userObj['title']] = [];
              }
              N[userObj['title']].push(userObj['username']);
            }
       结果：{"组长":[ "张三" ] , "员工":[ "李四" , "王五" ] }</pre>
          </dt>
        </dl>
      </div>
    </Poptip>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
  },
  props: {},
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
