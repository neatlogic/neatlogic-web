<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}
      <template slot="desc">
        {{ configHelp }}
        <Poptip
          trigger="click"
          width="700"
          :transfer="true"
          :title="$t('term.framework.grammarhint')"
        >
          <span class="text-href">demo</span>
          <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
            <TsCodemirror
              ref="code"
              :value="configDemo"   
              codeMode="json"
              :isReadOnly="true"
              isCopy
            ></TsCodemirror>                      
          </div>
        </Poptip>
      </template>
    </Alert>
  </div>
</template>
 
<script>
export default {
  name: '',
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror')
  },
  props: {},
  data() {
    return {
      configHelp: `数据转换是一个json格式的字符串，每个字段的含义说明：
    main为执行方法，其中：this为vue实例对象，componentList为数据配置输出结果，formData为表单原始数据保存值，this.$.customFn()为调用自定义的方法；`,
      configDemo: `{
  main(componentList, formData) {
    let valueList = [];
      componentList.forEach(item => {
        let findItem = formData.find(f => f.key == item.key);
        if (findItem) {
          let obj = {
            key: item.key,
            tag: item.tag,
            dataList: findItem.dataList
          };
          valueList.push(obj);
        }
      });
    return valueList;
  }
}`
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

  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>
