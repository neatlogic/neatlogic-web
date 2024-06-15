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
      configHelp: `数据配置是一个json格式的字符串，每个字段的含义说明：
    main为执行方法，其中：this为vue实例对象，this.$.customFn()为调用自定义的方法；`,
      configDemo: `{
  main() {
      let list = [
      {
        handler: 'formtext',
        label: '名称',
        key: 'name',
        type: 'form', //来源表单组件
        tag: 'tag1', //自定义标签
      },
      {
        handler: 'formtableinputer', //组件类型
        label: '数据库', //名称
        key: 'predistribution_dataBase', //英文名称（唯一标识）
        type: 'form', //来源表单组件
        tag: 'tag1', //自定义标签
        config: {
          dataConfig: [ //表头配置
            {
              handler: 'formtext',
              label: '用户名',
              uuid: 'user'
            }
          ]
        }
      }
      ];
      list.push(...this.$.customFn('tag1'));
      return list;
    },
    customFn(tag) {
    console.log(this.formItemList);//formItemList为当前表单引用组件
      let attributeList = [];
      //根据formItemList当前表单组件写转换代码

      return attributeList;
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
