<template>
  <div class="select-main">
    <template v-if="config && config.dataSource == 'matrix'">
      <div v-if="config.matrixUuid" class="list">
        <TsFormSelect
          v-bind="matrixConfig"
          :value="config.matrixUuid"
          :readonly="true"
        >
        </TsFormSelect>
      </div>
      <div v-if="config.matrixUuid && config.defaultValue" class="list">
        <TsFormSelect
          :value="config.defaultValue"
          v-bind="getSetting"
          :multiple="multiple"
          :readonly="true"
        ></TsFormSelect>
      </div>
    </template>
    <template v-else-if="config && config.dataSource == 'static'">
      <div class="list">
        {{ $t('term.autoexec.static') }}
      </div>
      <div v-if="value" class="list">
        <TsFormSelect
          :value="value"
          :dataList="config.dataList || []"
          :readonly="true"
        ></TsFormSelect>
      </div>
    </template>
    <template v-else>{{ $t('page.notarget', {target: $t('page.defaultvalue')}) }}</template>
  </div>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect';
export default {
  name: '',
  components: {
    TsFormSelect
  },
  filters: {},
  props: {
    value: [String, Object, Array],
    config: Object,
    multiple: Boolean
  },
  data() {
    let _this = this;
    return {
      matrixConfig: { 
        url: '/api/rest/matrix/search', 
        rootName: 'tbodyList', 
        textName: 'name', 
        valueName: 'uuid' 
      },
      matrixAttributeConfig: {
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect/new', 
        rootName: 'tbodyList', 
        dealDataByUrl: _this.dealDataByUrl,
        params: null
      }
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
    dealDataByUrl(nodeList) { //当默认值的引用类型是自定义  处理默认值的数据结构
      return this.dealDataFilter(nodeList, this.config);
    },
    dealDataFilter(nodeList, config) {
      //当默认值的引用类型是自定义  处理默认值的数据结构
      let columlist = [];
      config = config || null;
      if (config.mapping.value && config.mapping.text && nodeList) {
        if (nodeList && nodeList.length > 0) {
          nodeList.forEach(co => {
            if (co[config.mapping.text]) {
              columlist.push({
                text: co[config.mapping.text].text,
                value: co[config.mapping.value].value + '&=&' + co[config.mapping.text].text,
                html: co[config.mapping.text].text
              });
            }
          });
        }
      }
      return columlist;
    }
  },
  computed: {
    getSetting() { //更新默认值设置
      let config = Object.assign({}, this.matrixAttributeConfig);
      let params = null;
      if (this.config.matrixUuid) {
        let columnList = [];
        let keywordColumn = '';
        if (this.config.mapping && this.config.mapping.value && this.config.mapping.text) {
          columnList = [this.config.mapping.value, this.config.mapping.text];
          keywordColumn = this.config.mapping.text;
        }
        params = { matrixUuid: this.config.matrixUuid, keywordColumn: keywordColumn, columnList: columnList };  
        if (this.config.defaultValue) {
          if (Array.isArray(this.config.defaultValue)) {
            this.config.defaultValue.length && (params.defaultValue = this.config.defaultValue);
          } else {
            params.defaultValue = [this.config.defaultValue];
          }
        } else {
          this.$set(params, 'defaultValue', []);
        }
      }
      params && this.$set(config, 'params', params);
      return config;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.select-main{
  .list {
    display: inline-block;
    padding-right: 10px;
  }
}
</style>
