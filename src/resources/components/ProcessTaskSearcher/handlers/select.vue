<template>
  <div v-if="config">
    <TsFormTree
      v-if="condition.formHandler === 'formtreeselect'"
      :value="conditionData && conditionData.valueList"
      v-bind="treeConfig"
      @on-change="change"
    ></TsFormTree>
    <TsFormSelect
      v-else
      ref="searchInputer"
      transfer
      v-bind="config"
      border="border"
      :value="conditionData && conditionData.valueList"
      :validateList="[{ name: 'required', message: ' ' }]"
      @change="change"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormTree: resolve => require(['@/resources/plugins/TsForm/TsFormTree'], resolve)
  },
  props: {
    mode: {
      type: String,
      default: 'simple'
    },
    condition: { type: Object },
    conditionData: {type: Object}//当前组件在工单中心配置中的数据
  },
  data() {
    const _this = this;
    return {
      config: this.condition.config,
      matrixConfig: {
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList'
      }
    };
  },
  beforeCreate() {},
  created() { this.mergeMatrixConfig(); },
  beforeMount() {},
  mounted() {
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    valid() {
      if (this.$refs['searchInputer']) {
        return this.$refs['searchInputer'].valid();
      }
      return true;
    },
    //如果数据来自矩阵，需要补充矩阵需要的TsFormSelect配置信息
    mergeMatrixConfig() {
      if (this.config && this.config.dataSource == 'matrix' && this.config.matrixUuid && this.config.mapping.value && this.config.mapping.text) {
        //过滤条件
        this.config.params = {
          matrixUuid: this.config.matrixUuid,
          keywordColumn: this.config.mapping.text,
          valueField: this.config.mapping.value,
          textField: this.config.mapping.text,
          needPage: false
        };
        Object.assign(this.config, this.matrixConfig);
      } 
    },
    change(val, option) {
      let text = '';
      if (option) {
        if (option instanceof Array) {
          option.forEach(d => {
            if (text) {
              text += '、';
            }
            text += d.text;
          });
        } else {
          text += option.text;
        }
      }
      this.$emit('change', val, text);
    }
  },
  filter: {},
  computed: {
    treeConfig() {
      let setting = this.config.config ? this.config.config : {};
      let config = {
        url: setting.url,
        desc: '',
        params: {isActive: 1},
        valueName: setting.valueName || 'uuid',
        textName: setting.textName || 'name',
        childrenKey: setting.childrenKey || 'children',
        validateList: [],
        placeholder: this.config.placeholder,
        clearable: true,
        border: 'border',
        transfer: true
      };
      return config;
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>
