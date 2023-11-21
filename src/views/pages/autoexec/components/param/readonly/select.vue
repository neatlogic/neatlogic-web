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
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect', 
        rootName: 'dataList', 
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
  methods: {},
  computed: {
    getSetting() { //更新默认值设置
      let config = Object.assign({}, this.matrixAttributeConfig);
      let params = null;
      if (this.config.matrixUuid) {
        let keywordColumn = '';
        let valueField = null;
        let textField = null;
        if (this.config.mapping && this.config.mapping.value && this.config.mapping.text) {
          valueField = this.config.mapping.value;
          textField = this.config.mapping.text;
          keywordColumn = this.config.mapping.text;
        }
        params = { matrixUuid: this.config.matrixUuid, keywordColumn: keywordColumn, valueField: valueField, textField: textField };  
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
