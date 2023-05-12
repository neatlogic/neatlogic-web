<template>
  <div>
    <TsFormItem :label="$t('page.disabledselect')" labelPosition="top">
      <TsFormRadio
        :value="config.dataSource"
        :dataList="dataSourceList"
        :disabled="disabled"
        @on-change="val => {
          setConfig('dataSource', val);
        }"
      ></TsFormRadio>
    </TsFormItem>
    <TsFormItem :label="$t('page.datasource')" labelPosition="top" required>
      <div class="radius-sm padding-md" :class="validClass('url')">
        <TsFormSelect
          ref="url"
          :value="config.url"
          v-bind="matrixJson"
          :disabled="disabled"
          @on-change="changeMatrix"
        ></TsFormSelect>
      </div>
    </TsFormItem>
    <!-- <TsFormItem label="默认值" labelPosition="top">
      <TsFormTree
        :value="config.defaultValue"
        v-bind="getConfig"
        @on-change="val => {
          setConfig('defaultValue', val);
        }"
      ></TsFormTree>
    </TsFormItem>-->
    <TsFormItem :label="$t('page.inputtip')" labelPosition="top">
      <TsFormInput
        :value="config.placeholder"
        :maxlength="50"
        :disabled="disabled"
        @on-change="val => {
          setConfig('placeholder', val);
        }"
      ></TsFormInput>
    </TsFormItem>
  </div>
</template>
<script>
import base from './base-config.vue';

export default {
  name: '',
  components: {
    TsFormItem: resolve => require(['@/resources/plugins/TsForm/TsFormItem'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    //TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  extends: base,
  props: {},
  data() {
    return {
      dataSourceList: [
        {
          text: this.$t('page.rootnode'),
          value: 'knowledgeType'
        }
      ],
      matrixJson: {
        dynamicUrl: '/api/rest/form/treeselect/handler/list',
        dealDataByUrl: this.dealDataByUrl,
        validateList: ['required'],
        border: 'border',
        firstSelect: false
      }
    };
  },
  beforeCreate() {},
  async created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    dealDataByUrl(nodeList) {
      let dataList = [];
      nodeList.forEach(item => {
        dataList.push({ text: item.handlerName, value: item.config.url, config: item.config});
      });
      return dataList;
    },
    changeMatrix(val, item, obj) {
      this.setConfig('url', val);
      this.setConfig('config', obj.config || {});
    }
  },
  filter: {},
  computed: {
    getConfig() {
      let setting = this.config.config ? this.config.config : {};
      let config = {
        url: setting.url,
        desc: '',
        params: {isActive: 1},
        valueName: setting.valueName || 'uuid',
        textName: setting.textName || 'name',
        childrenKey: setting.childrenKey || 'children',
        clearable: true,
        showPath: true,
        sperateText: '>',
        border: 'border'
      };
      return config;
    }
  },
  watch: {}
};
</script>
