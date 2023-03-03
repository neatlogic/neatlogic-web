<template>
  <div v-if="config">
    <TsFormSelect
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
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
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
        dynamicUrl: '/api/rest/matrix/column/data/search/forselect/new',
        rootName: 'tbodyList',
        dealDataByUrl: _this.dealDataByUrl
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
    dealDataByUrl(nodeList) {
      //处理返回的数据结构为tsFormSelect需要的数据结构
      let columlist = [];
      if (this.config.mapping.value && this.config.mapping.text && nodeList) {
        nodeList.forEach(co => {
          if (co[this.config.mapping.text]) {
            if (this.config.mapping.value != this.config.mapping.text) {
              columlist.push({
                text: co[this.config.mapping.text].text,
                value: co[this.config.mapping.value].value + '&=&' + co[this.config.mapping.text].text,
                html: co[this.config.mapping.text].text + "<small class='text-grey'>(" + co[this.config.mapping.value].text + ')</small>'
              });
            } else {
              columlist.push({
                text: co[this.config.mapping.text].text,
                value: co[this.config.mapping.value].value + '&=&' + co[this.config.mapping.text].text,
                html: co[this.config.mapping.text].text
              });
            }
          }
        });
      }
      return columlist;
    },
    //如果数据来自矩阵，需要补充矩阵需要的TsFormSelect配置信息
    mergeMatrixConfig() {
      if (this.config && this.config.dataSource == 'matrix' && this.config.matrixUuid && this.config.mapping.value && this.config.mapping.text) {
        //过滤条件
        this.config.params = {
          matrixUuid: this.config.matrixUuid,
          keywordColumn: this.config.mapping.text,
          columnList: [this.config.mapping.value, this.config.mapping.text],
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
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>
