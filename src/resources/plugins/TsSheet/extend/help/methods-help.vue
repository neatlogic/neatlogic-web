<template>
  <div class="methods-help-box">
    <Alert show-icon>
      {{ $t('page.help') }}
      <template slot="desc">
        <ul>
          <li>{{ $t('page.dataconfigjsondesc') }}</li>
          <li>{{ $t('page.thisisvueinstance') }}</li>
          <li>{{ $t('page.mainmethod') }}<span class="text-danger">{{ $t('page.mainmethodfixedname') }}</span>{{ $t('page.outputresultis') }}
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
            >
              <span class="text-href">{{ $t('page.eg') }}</span>
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
              <li>{{ $t('page.mainmethodparamdesc') }}</li>
              <li class="ml-nm" style="list-style: disc;">{{ $t('page.componentlistoutputdesc') }}
                <Poptip
                  trigger="click"
                  width="700"
                  :transfer="true"
                >
                  <span class="text-href">{{ $t('page.eg') }}</span>
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
              <li class="ml-nm" style="list-style: disc;">{{ $t('page.formdataoutputdesc') }}
                <Poptip
                  trigger="click"
                  width="700"
                  :transfer="true"
                >
                  <span class="text-href">{{ $t('page.eg') }}</span>
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
          <li>{{ $t('page.customfnprefix') }}<span class="text-danger">this.$</span>{{ $t('page.customfnsuffixwithperiod') }}
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
              :title="$t('term.framework.grammarhint')"
            >
              <span class="text-href">{{ $t('page.eg') }}</span>
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
          'tag': 'common1', // Tag name
          'key': 'formspecifications_systemName', // Key name
          'dataList': 'TLOP' // Value
        },
        {
          'tag': 'common1',
          'key': 'formspecifications_os',
          'dataList': [
            {
              'app': 'TLOP',
              'uuid': 1178825270501587,
              'osver': 'Kylin V10',
              'netRegion': 'DMZ',
              'xuqiu': 'XQ20240512-002',
              'oscfg': 'Standard[4c8g]',
              'osNum': '1',
              'osBaseline': 'Kylin V10-202402',
              'name': 'TLOP_Gateway_Server',
              'osType': 'ECS',
              'id': 1178825270501587,
              'cfgId': 1178825270501600,
              'sysUesr': '1',
              'moduleType': 'Application Server',
              'moduleEnName': 'gateway',
              'networkAreaCode': 'DMZ'
            }
          ]
        }
      ],
      componentList: [
        {
          'handler': 'formselect',
          'label': 'Resource Spec_1_System Name',
          'key': 'formspecifications_systemName',
          'tag': 'common1',
          'type': 'form'
        },
        {
          'handler': 'formtableinputer',
          'label': 'Resource Spec_1_Operating System',
          'key': 'formspecifications_os',
          'tag': 'common1',
          'type': 'form',
          'config': {
            'dataConfig': [
              {
                'handler': 'formtext',
                'label': 'Resource Spec_1_Operating System_Request No.',
                'uuid': 'xuqiu'
              },
              {
                'handler': 'formtext',
                'label': 'Resource Spec_1_Operating System_Config Item ID',
                'uuid': 'id'
              },
              {
                'handler': 'formtext',
                'label': 'Resource Spec_1_Operating System_UUID',
                'uuid': 'uuid'
              },
              {
                'handler': 'formselect',
                'label': 'Resource Spec_1_Operating System_Module Name',
                'uuid': 'name'
              },
              {
                'handler': 'formtext',
                'label': 'Resource Spec_1_Operating System_Module Type',
                'uuid': 'moduleType'
              },
              {
                'handler': 'formtext',
                'label': 'Resource Spec_1_Operating System_Module English Name',
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
                'deviceType': 'Encryption Device',
                'number': '222',
                'xuqiu': 'XQ20230925946-009',
                'moduleName': 'test09-web',
                'modelType': 'Other Device Resource Spec',
                'type': 'Basic Model',
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
                'name': 'test09-database',
                'uuid': '1172469759091395',
                'xforward': 'No',
                'infrabalanceType': 'HTTP',
                'policy': 'No Session Persistence',
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.methods-help-box {
  ::v-deep .ivu-poptip {
    margin-top: -5px;
  }
}
</style>
