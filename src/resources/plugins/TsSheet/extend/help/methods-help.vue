<template>
  <div class="methods-help-box">
    <Alert show-icon>
      {{ $t('page.help') }}
      <template slot="desc">
        <ul>
          <li>数据配置是一个json格式的字符串，字段说明如下：</li>
          <li>this为vue实例对象</li>
          <li>main为执行方法<span class="text-danger">(该方法名不可更改)</span>，输出结果：
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
            >
              <span class="text-href">示例</span>
              <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
                <TsCodemirror
                  ref="code"
                  :value="JSON.stringify(valueList, null,2)"   
                  codeMode="json"
                  :isReadOnly="true"
                  isCopy
                ></TsCodemirror>                      
              </div>
            </Poptip>
            <ul>
              <li>main执行方法入参说明：</li>
              <li class="ml-nm" style="list-style: disc;">componentList是数据配置值，输出结果：
                <Poptip
                  trigger="click"
                  width="700"
                  :transfer="true"
                >
                  <span class="text-href">示例</span>
                  <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
                    <TsCodemirror
                      ref="code"
                      :value="JSON.stringify(componentList, null,2)"   
                      codeMode="json"
                      :isReadOnly="true"
                      isCopy
                    ></TsCodemirror>                      
                  </div>
                </Poptip>
              </li>
              <li class="ml-nm" style="list-style: disc;">formData是表单数据值，输出结果：
                <Poptip
                  trigger="click"
                  width="700"
                  :transfer="true"
                >
                  <span class="text-href">示例</span>
                  <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
                    <TsCodemirror
                      ref="code"
                      :value="JSON.stringify(formData, null,2)"   
                      codeMode="json"
                      :isReadOnly="true"
                      isCopy
                    ></TsCodemirror>                      
                  </div>
                </Poptip>
              </li>
            </ul>
          </li>
          <li>this.$.customFn()为自定义方法。要调用自定义方法，请使用<span class="text-danger">this.$</span>开头，例如：this.$.customFn()。
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
              :title="$t('term.framework.grammarhint')"
            >
              <span class="text-href">示例</span>
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
          </li>
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
}`,
      valueList: [
        {
          'tag': 'common1', // 标签名称
          'key': 'formspecifications_systemName', // 键名
          'dataList': 'TLOP' // 值
        },
        {
          'tag': 'common1',
          'key': 'formspecifications_os',
          'dataList': [
            {
              'app': 'TLOP',
              'uuid': 1178825270501587,
              'osver': '麒麟v10',
              'netRegion': 'DMZ区域',
              'xuqiu': 'XQ20240512-002',
              'oscfg': '低配[4c8g]',
              'osNum': '1',
              'osBaseline': '麒麟v10-202402',
              'name': 'TLOP_三资村行前置机',
              'osType': 'ECS',
              'id': 1178825270501587,
              'cfgId': 1178825270501600,
              'sysUesr': '1',
              'moduleType': '应用服务',
              'moduleEnName': 'sanzi',
              'networkAreaCode': 'DMZ'
            }
          ]
        }
      ],
      componentList: [
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
          'label': '资源规格_1_操作系统',
          'key': 'formspecifications_os',
          'tag': 'common1',
          'type': 'form',
          'config': {
            'dataConfig': [
              {
                'handler': 'formtext',
                'label': '资源规格_1_操作系统_需求编号',
                'uuid': 'xuqiu'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_操作系统_配置项id',
                'uuid': 'id'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_操作系统_uuid',
                'uuid': 'uuid'
              },
              {
                'handler': 'formselect',
                'label': '资源规格_1_操作系统_模块名称',
                'uuid': 'name'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_操作系统_模块类型',
                'uuid': 'moduleType'
              },
              {
                'handler': 'formtext',
                'label': '资源规格_1_操作系统_模块英文名称',
                'uuid': 'moduleEnName'
              }
            ]
          }
        }
      ],
      formData: [
        {
          'attributeUuid': '27b12c0d2bf64594b83c66295d58fd59',
          'key': 'formspecifications',
          'handler': 'formcustom',
          'dataList': {
            'otherDeviceResources': [
              {
                'deviceType': '加密机',
                'number': '222',
                'xuqiu': 'XQ20230925946-009',
                'moduleName': 'test09-web',
                'modelType': '其他设备资源规格',
                'type': '基础模型',
                'deviceName': '333',
                'uuid': '1162121589039167',
                'id': '1162121589039167'
              }
            ],
            'loadBalance': [
              {
                'app': 'TEST09',
                'xuqiu': 'XQ20230925946-009',
                'balanceName': 'TEST09_TEST09_002',
                'loadBalanceUuid': '002',
                'name': 'test09-数据库',
                'uuid': '1172469759091395',
                'xforward': '否',
                'infrabalanceType': 'HTTP',
                'policy': '无需会话保持',
                'moduleEnName': 'TEST09',
                'id': '1172469759091395',
                'port': [
                  '3333'
                ]
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
<style lang="less" scoped>
.methods-help-box {
  /deep/ .ivu-poptip {
    margin-top: -5px;
  }
}
</style>
