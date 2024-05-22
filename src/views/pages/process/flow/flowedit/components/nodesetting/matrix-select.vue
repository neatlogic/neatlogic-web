<template>
  <div class="matrSelect">
    <TsFormSelect
      v-model="currentValue"
      v-bind="defaultSelfJson"
      :multiple="setting.isMultiple"
      showName="html"
      search
      transfer
      :readonly="readonly"
      sperateText="、"
      textColor="text-default"
      :isShowTitle="true"
    ></TsFormSelect>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    setting: Object,
    expressionConfig: Object,
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      //初始数据
      type: [String, Array],
      default: function() {
        if (this.setting.isMultiple == true) {
          return new Array();
        } else {
          return '';
        }
      }
    },
    name: String //表单数据改变
  },
  data() {
    let _this = this;
    return {
      currentValue: _this.value instanceof Array ? _this.value.concat([]) : _this.value,
      defaultSelfJson: {
        params: null,
        dynamicUrl: '',
        url: '',
        defaultUrl: '/api/rest/matrix/column/data/search/forselect',
        rootName: 'dataList',
        showName: null
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.setDefaultJson();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setDefaultJson() {
      //当是矩阵数据源时，改变矩阵中的配置时，需要触发改变默认值
      let _this = this;
      if (this.setting.mapping.value && this.setting.mapping.text) {
        let param = { matrixUuid: _this.setting.matrixUuid };
        param.keywordColumn = this.setting.mapping.text;
        param.valueField = this.setting.mapping.value;
        param.textField = this.setting.mapping.text;
        this.defaultSelfJson.params = param;
        this.defaultSelfJson.dynamicUrl = this.defaultSelfJson.defaultUrl;
      } else {
        this.defaultSelfJson.dynamicUrl = '';
        this.defaultSelfJson.showName = '';
      }
    }
  },
  filter: {},
  computed: {},
  watch: {
    value: {
      handler: function(val) {
        this.currentValue = val;
      },
      deep: true,
      immediate: true
    },
    currentValue: {
      handler: function(val) {
        this.$emit('update:value', val);
        this.$emit('change', val);
      },
      deep: true,
      immediate: true
    },
    name: {
      handler: function(val) {
        this.setDefaultJson();
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang='less'>
.matrSelect {
  .tsform-readonly {
    cursor: auto;
  }
}
</style>
