<template>
  <div class="config-help-box">
    <Alert show-icon>
      {{ $t('page.help') }}
      <template slot="desc">
        <ul>
          <li>{{ $t('page.dataconfigjsondesc') }}</li>
          <li>{{ $t('page.thisisvueinstance') }}</li>
          <li>{{ $t('page.mainmethod') }}<span class="text-danger">{{ $t('page.mainmethodfixedname') }}</span>{{ $t('page.outputdatais') }}
            <Poptip
              trigger="click"
              width="700"
              :transfer="true"
            >
              <span class="text-href">demo</span>
              <div slot="content" class="overflow" style="height: 300px;overflow-y: auto">
                <TsCodemirror
                  ref="code"
                  :value="attributeList"   
                  codeMode="json"
                  :isReadOnly="true"
                  isCopy
                ></TsCodemirror>                      
              </div>
            </Poptip>
          </li>
          <li>{{ $t('page.customfnprefix') }}<span class="text-danger">this.$</span>{{ $t('page.customfnsuffix') }}</li>
          <li>{{ $t('page.eg') }}{{ $t('page.colon') }}  <Poptip
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
        label: 'label name',
        key: 'key name',
        type: 'form', // Source form component
        tag: 'tag1' // tag name
      },
      {
        handler: 'formtableinputer', // Component type
        label: 'datasource', // label name
        key: 'predistribution_dataBase', // Unique key
        type: 'form', // Source form component
        tag: 'tag1', // Custom tag
        config: {
          dataConfig: [ // Table header configuration
            {
              handler: 'formtext',
              label: 'label name',
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
      console.log(this.formItemList); // formItemList is the current form reference component list
      let attributeList = [];
      // Write conversion code according to the current form component list in formItemList
      return attributeList;
    }
}`,
      attributeList: `[
        {
          // Common component types: formselect(dropdown), formtext(text), formradio(single choice), formcheckbox(multiple choice), etc.
          'handler': 'formselect',
          'label': 'label name',
          'key': 'formspecifications_systemName',
          'tag': 'common1',
          'type': 'form'
        },
        {
          // Table component types: formtableinputer(table data component), formtableselector(table selector component)
          'handler': 'formtableinputer',
          'label': 'label name',
          'key': 'formspecifications_os',
          'tag': 'common1',
          'type': 'form',
          'config': {
            'dataConfig': [
              {
                'handler': 'formtext',
                'label': 'label name',
                'uuid': 'xuqiu'
              }
             
            ]
          }
        }
      ]`
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
.config-help-box {
  ::v-deep .ivu-poptip {
    margin-top: -5px;
  }
}
</style>
