<template>
  <div v-if="!isReadOnly">
    <TsFormCheckbox
      ref="searchInputer"
      v-bind="config"
      className="block-span"
      :value="conditionData && conditionData.valueList"
      :validateList="[{ name: 'required', message: ' ' }]"
      @on-change="change"
    ></TsFormCheckbox>
  </div>
  <Tag v-else></Tag>
</template>
<script>
import matrixMinxis from './matrixMinxis.js';
export default {
  name: '',
  components: {
    TsFormCheckbox: resolve => require(['@/resources/plugins/TsForm/TsFormCheckbox'], resolve)
  },
  mixins: [matrixMinxis],
  props: {
    isReadOnly: {type: Boolean, default: false},
    mode: {
      type: String,
      default: 'simple'
    },
    condition: { type: Object },
    conditionData: {type: Object}//当前组件在工单中心配置中的数据
  },
  data() {
    return { 
      config: this.condition.config,
      matrixConfig: {
        url: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        dealDataByUrl: this.dealDataByUrl
      }
    };
  },
  beforeCreate() {},
  created() {},
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
    },
    //如果数据来自矩阵，需要补充矩阵配置信息
    mergeMatrixConfig() {
      if (this.config && this.config.dataSource == 'matrix' && this.config.matrixUuid && this.config.mapping.value && this.config.mapping.text) {
        //过滤条件
        this.config.params = {
          matrixUuid: this.config.matrixUuid,
          keywordColumn: this.config.mapping.text,
          valueField: this.config.mapping.value,
          textField: this.config.mapping.text
        };
        Object.assign(this.config, this.matrixConfig);
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
