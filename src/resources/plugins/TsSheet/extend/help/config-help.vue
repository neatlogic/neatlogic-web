<template>
  <div>
    <Alert show-icon>
      {{ $t('page.help') }}
      <template slot="desc">
        <ul>
          <li>数据配置是一个json格式的字符串，字段说明如下：</li>
          <li>this为vue实例对象</li>
          <li>main为执行方法<span class="text-danger">(该方法名不可更改)</span>，输出数据为：
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
            >
              <span class="text-href">demo</span>
              <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
                <TsCodemirror
                  ref="code"
                  :value="JSON.stringify(attributeList, null,2)"   
                  codeMode="json"
                  :isReadOnly="true"
                  isCopy
                ></TsCodemirror>                      
              </div>
            </Poptip>
          </li>
          <li>this.$.customFn()为自定义方法。要调用自定义方法，请使用<span class="text-danger">this.$</span>开头，例如：this.$.customFn()</li>
          <li>示例：  <Poptip
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
          </Poptip></li>
        </ul>
      
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
}`,
      attributeList: [
        {
          'parentUuid': '27b12c0d2bf64594b83c66295d58fd59',
          'handler': 'formselect',
          'label': '资源规格_1_系统名称',
          'key': 'formspecifications_systemName',
          'tag': 'common1',
          'type': 'form'
        },
        {
          'parentUuid': '27b12c0d2bf64594b83c66295d58fd59',
          'handler': 'formtableinputer',
          'label': '资源规格_1_数据库',
          'key': 'formspecifications_database',
          'tag': 'common1',
          'type': 'form',
          'config': {
            'dataConfig': [
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_需求编号',
                'uuid': 'xuqiu'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_配置项id',
                'uuid': 'id'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_uuid',
                'uuid': 'uuid'
              },
              {
                'handler': 'formselect',
                'label': '资源规格_1_数据库_模块名称',
                'uuid': 'name'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_模块类型',
                'uuid': 'moduleType'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_模块英文名称',
                'uuid': 'moduleEnName'
              },
              {
                'handler': 'formselect',
                'label': '资源规格_1_数据库_数据库版本',
                'uuid': 'dbVer'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_数据库类型',
                'uuid': 'dbType'
              },
              {
                'handler': 'formselect',
                'label': '资源规格_1_数据库_交付标准',
                'uuid': 'baseline'
              },
              {
                'handler': 'formselect',
                'label': '资源规格_1_数据库_字符集',
                'uuid': 'charset'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_数据库名称',
                'uuid': 'dbName'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_数据库_用户名',
                'uuid': 'userName'
              }
            ]
          }
        }
      ]
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
